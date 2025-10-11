// util/sqlBuilder.js

/**
 * Base SQL Builder
 * Handles all SQL query construction and execution
 */
class SQLBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.tableName = null;
    this.selectFields = [];
    this.joinClauses = [];
    this.whereClauses = [];
    this.whereParams = [];
    this.orderClauses = [];
    this.isDistinct = false;
    this.insertFields = [];
    this.insertValues = [];
    this.updateFields = [];
    this.updateValues = [];
    this.rawSQL = null;
    return this;
  }

  /**
   * Set the table name
   * @param {string} name - Table name
   * @returns {SQLBuilder}
   */
  table(name) {
    this.tableName = name;
    return this;
  }

  /**
   * Add fields to SELECT
   * @param {...string} fields - Field names
   * @returns {SQLBuilder}
   */
  select(...fields) {
    this.selectFields.push(...fields);
    return this;
  }

  /**
   * Add fields from a specific table to SELECT
   * @param {string} table - Table name
   * @param {...string} fields - Field names
   * @returns {SQLBuilder}
   */
  selectFrom(table, ...fields) {
    fields.forEach(field => {
      this.selectFields.push(`${table}.${field}`);
    });
    return this;
  }

  /**
   * Set the FROM clause (alias for table)
   * @param {string} name - Table name
   * @returns {SQLBuilder}
   */
  from(name) {
    return this.table(name);
  }

  /**
   * Add a JOIN clause
   * @param {string} type - JOIN type (LEFT, INNER, etc)
   * @param {string} table - Table to join
   * @param {string} leftField - Left field for ON condition
   * @param {string} rightField - Right field for ON condition
   * @returns {SQLBuilder}
   */
  join(type, table, leftField, rightField) {
    this.joinClauses.push({
      type: type.toUpperCase(),
      table,
      leftField,
      rightField
    });
    return this;
  }

  /**
   * Add LEFT JOIN
   * @param {string} table - Table to join
   * @param {string} leftField - Left field
   * @param {string} rightField - Right field
   * @returns {SQLBuilder}
   */
  leftJoin(table, leftField, rightField) {
    return this.join('LEFT', table, leftField, rightField);
  }

  /**
   * Add INNER JOIN
   * @param {string} table - Table to join
   * @param {string} leftField - Left field
   * @param {string} rightField - Right field
   * @returns {SQLBuilder}
   */
  innerJoin(table, leftField, rightField) {
    return this.join('INNER', table, leftField, rightField);
  }

  /**
   * Add WHERE condition
   * @param {string} condition - SQL condition
   * @param {...any} params - Parameters to bind
   * @returns {SQLBuilder}
   */
  where(condition, ...params) {
    this.whereClauses.push(condition);
    this.whereParams.push(...params);
    return this;
  }

  /**
   * Add ORDER BY clause
   * @param {string} field - Field to order by
   * @param {string} [direction='ASC'] - Direction
   * @returns {SQLBuilder}
   */
  order(field, direction = 'ASC') {
    this.orderClauses.push(`${field} ${direction.toUpperCase()}`);
    return this;
  }

  /**
   * Make the query DISTINCT
   * @returns {SQLBuilder}
   */
  distinct() {
    this.isDistinct = true;
    return this;
  }

  /**
   * Set fields and values for INSERT
   * @param {Object} data - Key-value pairs to insert
   * @returns {SQLBuilder}
   */
  insertData(data) {
    this.insertFields = Object.keys(data);
    this.insertValues = Object.values(data).map(val => 
      typeof val === 'string' ? val.trim() : val
    );
    return this;
  }

  /**
   * Set fields and values for UPDATE
   * @param {Object} data - Key-value pairs to update
   * @returns {SQLBuilder}
   */
  updateData(data) {
    this.updateFields = Object.keys(data);
    this.updateValues = Object.values(data).map(val =>
      typeof val === 'string' ? val.trim() : val
    );
    return this;
  }

  /**
   * Use raw SQL instead of building
   * @param {string} sql - Raw SQL query
   * @returns {SQLBuilder}
   */
  raw(sql) {
    this.rawSQL = sql;
    return this;
  }

  /**
   * Build SELECT query
   * @returns {string}
   */
  buildSelect() {
    let sql = 'SELECT ';
    if (this.isDistinct) sql += 'DISTINCT ';
    
    if (this.selectFields.length > 0) {
      sql += this.selectFields.join(', ');
    } else {
      sql += '*';
    }
    
    sql += ` FROM ${this.tableName}`;

    this.joinClauses.forEach(join => {
      sql += ` ${join.type} JOIN ${join.table} ON ${join.leftField} = ${join.rightField}`;
    });

    if (this.whereClauses.length > 0) {
      sql += ' WHERE ' + this.whereClauses.join(' AND ');
    }

    if (this.orderClauses.length > 0) {
      sql += ' ORDER BY ' + this.orderClauses.join(', ');
    }

    return sql;
  }

  /**
   * Build INSERT query
   * @returns {string}
   */
  buildInsert() {
    const placeholders = this.insertFields.map(() => '?').join(', ');
    return `INSERT INTO ${this.tableName} (${this.insertFields.join(', ')}) VALUES (${placeholders})`;
  }

  /**
   * Build UPDATE query
   * @returns {string}
   */
  buildUpdate() {
    const updates = this.updateFields.map(f => `${f} = ?`).join(', ');
    let sql = `UPDATE ${this.tableName} SET ${updates}`;
    
    if (this.whereClauses.length > 0) {
      sql += ' WHERE ' + this.whereClauses.join(' AND ');
    }
    
    return sql;
  }

  /**
   * Build DELETE query
   * @returns {string}
   */
  buildDelete() {
    let sql = `DELETE FROM ${this.tableName}`;
    
    if (this.whereClauses.length > 0) {
      sql += ' WHERE ' + this.whereClauses.join(' AND ');
    }
    
    return sql;
  }

  /**
   * Build appropriate SQL based on operation
   * @returns {string}
   */
  buildSQL() {
    if (this.rawSQL) return this.rawSQL;
    
    if (this.insertFields.length > 0) return this.buildInsert();
    if (this.updateFields.length > 0) return this.buildUpdate();
    if (this.whereClauses.length > 0 && !this.selectFields.length && this.selectFields.length === 0) {
      return this.buildDelete();
    }
    
    return this.buildSelect();
  }

  /**
   * Execute query and get single row
   * @param {Object} db - Database instance
   * @returns {Object|undefined}
   */
  get(db) {
    const sql = this.buildSQL();
    const params = [...this.insertValues, ...this.updateValues, ...this.whereParams];
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  }

  /**
   * Execute query and get all rows
   * @param {Object} db - Database instance
   * @returns {Array}
   */
  all(db) {
    const sql = this.buildSQL();
    const params = [...this.whereParams];
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  }

  /**
   * Execute query (INSERT, UPDATE, DELETE)
   * @param {Object} db - Database instance
   * @returns {Object} - Result with lastInsertRowid, changes
   */
  run(db) {
    const sql = this.buildSQL();
    const params = [...this.insertValues, ...this.updateValues, ...this.whereParams];
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  }
}

module.exports = { SQLBuilder };