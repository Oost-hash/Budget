// util/endpointBuilder.js
const { SQLBuilder } = require('./sqlBuilder');

class EndpointBuilder extends SQLBuilder {
  constructor(method, path) {
    super();
    this.method = method.toUpperCase();
    this.path = path;
    this.executeMethod = 'all';
    this.transformFn = null;
    this.notFoundMsg = null;
    this.rawSQL = null;
    this.paramNames = [];
    this.requiredFields = [];
    this.insertFields = [];
    this.updateFields = [];
    this.customHandler = null;
  }

  /**
   * Override where to support paramName binding
   * @param {string} condition - SQL condition (e.g., 'id = ?')
   * @param {string} [paramName] - URL param name to bind
   * @returns {EndpointBuilder}
   */
  where(condition, paramName) {
    this.whereClauses.push(condition);
    if (paramName) {
      this.paramNames.push(paramName);
    }
    return this;
  }

  /**
   * Set the execute method
   * @param {'all'|'get'|'run'} method - Execute method
   * @returns {EndpointBuilder}
   */
  execute(method) {
    this.executeMethod = method;
    return this;
  }

  /**
   * Add a transform function to process results
   * @param {function(any, object, object): any} fn - Transform function (result, db, params)
   * @returns {EndpointBuilder}
   */
  transform(fn) {
    this.transformFn = fn;
    return this;
  }

  /**
   * Set not found error message
   * @param {string} message - Error message
   * @returns {EndpointBuilder}
   */
  notFound(message) {
    this.notFoundMsg = message;
    return this;
  }

  /**
   * Use raw SQL instead of building query
   * @param {string} sql - Raw SQL query
   * @returns {EndpointBuilder}
   */
  raw(sql) {
    this.rawSQL = sql;
    return this;
  }

  /**
   * Specify URL param names to bind
   * @param {...string} names - Parameter names
   * @returns {EndpointBuilder}
   */
  params(...names) {
    this.paramNames.push(...names);
    return this;
  }

  /**
   * Require fields in request body (validation)
   * @param {...string} fields - Required field names
   * @returns {EndpointBuilder}
   */
  require(...fields) {
    this.requiredFields.push(...fields);
    return this;
  }

  /**
   * Specify fields to insert (POST)
   * @param {...string} fields - Field names from req.body
   * @returns {EndpointBuilder}
   */
  insert(...fields) {
    this.insertFields.push(...fields);
    return this;
  }

  /**
   * Specify fields that can be updated (PATCH)
   * @param {...string} fields - Field names from req.body
   * @returns {EndpointBuilder}
   */
  update(...fields) {
    this.updateFields.push(...fields);
    return this;
  }

  /**
   * Custom handler for complex logic
   * @param {function(req, res, db): any} fn - Handler function
   * @returns {EndpointBuilder}
   */
  handler(fn) {
    this.customHandler = fn;
    return this;
  }

  /**
   * Build SQL based on method type
   * @returns {string} SQL query
   */
  buildSQL() {
    if (this.rawSQL) {
      return this.rawSQL;
    }

    if (this.method === 'GET') {
      return this.buildSelect();
    } else if (this.method === 'DELETE') {
      return this.buildDelete();
    } else if (this.method === 'POST' && this.insertFields.length > 0) {
      const placeholders = this.insertFields.map(() => '?').join(', ');
      return `INSERT INTO ${this.tableName} (${this.insertFields.join(', ')}) VALUES (${placeholders})`;
    } else if (this.method === 'PATCH' && this.updateFields.length > 0) {
      const updates = this.updateFields.map(f => `${f} = ?`).join(', ');
      let sql = `UPDATE ${this.tableName} SET ${updates}`;
      if (this.whereClauses.length > 0) {
        sql += ' WHERE ' + this.whereClauses.join(' AND ');
      }
      return sql;
    }

    return '';
  }

  /**
   * Register the endpoint with Express router
   * @param {import('express').Router} router - Express router
   */
  register(router) {
    const method = this.method.toLowerCase();

    router[method](this.path, (req, res) => {
      try {
        const db = req.ledgerDb;
        
        // Custom handler mode
        if (this.customHandler) {
          const result = this.customHandler(req, res, db);
          if (!res.headersSent) {
            res.json(result);
          }
          return;
        }

        // Validate required fields
        for (const field of this.requiredFields) {
          const value = req.body[field];
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            const receivedFields = Object.keys(req.body);
            return res.status(400).json({ 
              error: `Missing required field: ${field}`,
              required: this.requiredFields,
              received: receivedFields,
              hint: receivedFields.length > 0 
                ? `Did you mean one of: ${receivedFields.join(', ')}?` 
                : 'Request body is empty'
            });
          }
        }

        // POST - INSERT
        if (this.method === 'POST' && this.insertFields.length > 0) {
          const sql = this.buildSQL();
          const values = this.insertFields.map(f => {
            const val = req.body[f];
            return typeof val === 'string' ? val.trim() : val;
          });
          
          const stmt = db.prepare(sql);
          const result = stmt.run(...values);
          
          console.log(`✅ Inserted into ${this.tableName}:`, result.lastInsertRowid);
          
          // Build response object
          const response = { id: result.lastInsertRowid };
          this.insertFields.forEach(f => {
            response[f] = req.body[f];
          });
          
          return res.json(response);
        }

        // PATCH - UPDATE
        if (this.method === 'PATCH' && this.updateFields.length > 0) {
          const updates = [];
          const values = [];
          
          // Only update fields that are present in body
          for (const field of this.updateFields) {
            if (req.body[field] !== undefined) {
              updates.push(`${field} = ?`);
              const val = req.body[field];
              values.push(typeof val === 'string' ? val.trim() : val);
            }
          }
          
          if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
          }
          
          // Add WHERE params
          const paramValues = this.paramNames.map(name => req.params[name]);
          values.push(...paramValues);
          
          const sql = `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE ${this.whereClauses.join(' AND ')}`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...values);
          
          if (result.changes === 0 && this.notFoundMsg) {
            return res.status(404).json({ error: this.notFoundMsg });
          }
          
          console.log(`✅ Updated ${this.tableName}:`, req.params[this.paramNames[0]]);
          
          // Fetch and return updated record
          const getStmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE ${this.whereClauses[0]}`);
          const updated = getStmt.get(...paramValues);
          return res.json(updated);
        }

        // GET/DELETE - Standard query execution
        const sql = this.buildSQL();
        const params = {};
        this.paramNames.forEach(name => {
          params[name] = req.params[name];
        });

        const stmt = db.prepare(sql);
        const paramValues = this.paramNames.map(name => req.params[name]);
        let result = stmt[this.executeMethod](...paramValues);

        // Not found checks
        if (this.executeMethod === 'get' && !result && this.notFoundMsg) {
          return res.status(404).json({ error: this.notFoundMsg });
        }

        if (this.executeMethod === 'run' && result.changes === 0 && this.notFoundMsg) {
          return res.status(404).json({ error: this.notFoundMsg });
        }

        // Transform if needed
        if (this.transformFn) {
          result = this.transformFn(result, db, params);
          
          // Check if transform returned null (not found)
          if (result === null && this.notFoundMsg) {
            return res.status(404).json({ error: this.notFoundMsg });
          }
        }

        res.json(result);
      } catch (error) {
        console.error(`❌ Error on ${this.method} ${this.path}:`, error);
        res.status(500).json({ error: error.message });
      }
    });

    console.log(`✅ Registered ${this.method} ${this.path}`);
  }
}

/**
 * Create a new endpoint builder
 * @param {'GET'|'POST'|'PATCH'|'DELETE'} method - HTTP method
 * @param {string} path - Route path
 * @returns {EndpointBuilder}
 */
function endpoint(method, path) {
  return new EndpointBuilder(method, path);
}

module.exports = { endpoint, EndpointBuilder };