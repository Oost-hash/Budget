// util/schemaBuilder.js

class SchemaBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.columns = [];
    this.foreignKeys = [];
    this.indexes = [];
  }

  /**
   * Add INTEGER PRIMARY KEY AUTOINCREMENT column (convenience method)
   * @param {string} [name='id'] - Column name
   * @returns {SchemaBuilder}
   */
  id(name = 'id') {
    this.columns.push(`${name} INTEGER PRIMARY KEY AUTOINCREMENT`);
    return this;
  }

  /**
   * Add TEXT column
   * @param {string} name - Column name
   * @returns {ColumnBuilder}
   */
  text(name) {
    return new ColumnBuilder(this, name, 'TEXT');
  }

  /**
   * Add INTEGER column
   * @param {string} name - Column name
   * @returns {ColumnBuilder}
   */
  integer(name) {
    return new ColumnBuilder(this, name, 'INTEGER');
  }

  /**
   * Add REAL column
   * @param {string} name - Column name
   * @returns {ColumnBuilder}
   */
  real(name) {
    return new ColumnBuilder(this, name, 'REAL');
  }

  /**
   * Add BOOLEAN column (stored as INTEGER 0/1)
   * @param {string} name - Column name
   * @returns {ColumnBuilder}
   */
  boolean(name) {
    return new ColumnBuilder(this, name, 'BOOLEAN');
  }

  /**
   * Add DATETIME column with default CURRENT_TIMESTAMP
   * @param {string} [name='created_at'] - Column name
   * @returns {SchemaBuilder}
   */
  timestamp(name = 'created_at') {
    this.columns.push(`${name} DATETIME DEFAULT CURRENT_TIMESTAMP`);
    return this;
  }

  /**
   * Add foreign key column with constraint
   * @param {string} name - Column name
   * @param {string} refTable - Referenced table
   * @param {string} [refColumn='id'] - Referenced column
   * @param {string} [onDelete='CASCADE'] - ON DELETE action
   * @returns {SchemaBuilder}
   */
  foreignKey(name, refTable, refColumn = 'id', onDelete = 'CASCADE') {
    this.columns.push(`${name} INTEGER NOT NULL`);
    this.foreignKeys.push(`FOREIGN KEY (${name}) REFERENCES ${refTable}(${refColumn}) ON DELETE ${onDelete}`);
    return this;
  }

  /**
   * Add an index
   * @param {string} columnName - Column to index
   * @param {string} [indexName] - Custom index name (auto-generated if not provided)
   * @returns {SchemaBuilder}
   */
  index(columnName, indexName) {
    const name = indexName || `idx_${this.tableName}_${columnName}`;
    this.indexes.push({ name, column: columnName });
    return this;
  }

  /**
   * Build and execute CREATE TABLE statement
   * @param {object} db - Database instance
   */
  create(db) {
    const allConstraints = [...this.columns, ...this.foreignKeys];
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        ${allConstraints.join(',\n        ')}
      )
    `;
    
    db.exec(sql);
    console.log(`✅ Created table: ${this.tableName}`);

    // Create indexes
    this.indexes.forEach(idx => {
      const indexSql = `CREATE INDEX IF NOT EXISTS ${idx.name} ON ${this.tableName}(${idx.column})`;
      db.exec(indexSql);
      console.log(`  📌 Index: ${idx.name}`);
    });

    return this;
  }
}

class ColumnBuilder {
  constructor(schemaBuilder, name, type) {
    this.schemaBuilder = schemaBuilder;
    this.name = name;
    this.type = type;
    this.constraints = [];
  }

  /**
   * Make column PRIMARY KEY
   * @param {boolean} [autoIncrement=false] - Add AUTOINCREMENT
   * @returns {ColumnBuilder}
   */
  primaryKey(autoIncrement = false) {
    if (autoIncrement) {
      this.constraints.push('PRIMARY KEY AUTOINCREMENT');
    } else {
      this.constraints.push('PRIMARY KEY');
    }
    return this;
  }

  /**
   * Make column NOT NULL
   * @returns {ColumnBuilder}
   */
  required() {
    this.constraints.push('NOT NULL');
    return this;
  }

  /**
   * Make column UNIQUE
   * @returns {ColumnBuilder}
   */
  unique() {
    this.constraints.push('UNIQUE');
    return this;
  }

  /**
   * Set default value
   * @param {any} value - Default value
   * @returns {ColumnBuilder}
   */
  default(value) {
    if (typeof value === 'string') {
      this.constraints.push(`DEFAULT '${value}'`);
    } else {
      this.constraints.push(`DEFAULT ${value}`);
    }
    return this;
  }

  /**
   * Add CHECK constraint
   * @param {string} condition - Check condition (e.g., "IN ('asset', 'liability')")
   * @returns {ColumnBuilder}
   */
  check(condition) {
    this.constraints.push(`CHECK(${this.name} ${condition})`);
    return this;
  }

  /**
   * Finalize column and return to schema builder
   * @returns {SchemaBuilder}
   */
  done() {
    const constraintStr = this.constraints.length > 0 ? ' ' + this.constraints.join(' ') : '';
    this.schemaBuilder.columns.push(`${this.name} ${this.type}${constraintStr}`);
    return this.schemaBuilder;
  }

  // Convenience methods that auto-return to schema builder
  text(name) { this.done(); return this.schemaBuilder.text(name); }
  integer(name) { this.done(); return this.schemaBuilder.integer(name); }
  real(name) { this.done(); return this.schemaBuilder.real(name); }
  boolean(name) { this.done(); return this.schemaBuilder.boolean(name); }
  timestamp(name) { this.done(); return this.schemaBuilder.timestamp(name); }
  foreignKey(name, ref, col, onDel) { this.done(); return this.schemaBuilder.foreignKey(name, ref, col, onDel); }
  index(col, name) { this.done(); return this.schemaBuilder.index(col, name); }
  create(db) { this.done(); return this.schemaBuilder.create(db); }
}

/**
 * Create a new schema builder
 * @param {string} tableName - Name of the table
 * @returns {SchemaBuilder}
 */
function table(tableName) {
  return new SchemaBuilder(tableName);
}

module.exports = { table, SchemaBuilder };