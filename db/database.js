// db/database.js
/**
 * Database Operations
 * Handles all SQLite database operations for ledgers
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { initSchema } = require('./schema');
const { getHelpers } = require('./dbHelpers');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Connection cache
const connections = new Map();

/**
 * Initialize a new ledger database
 * Creates db.sqlite and initializes schema
 * Use this ONCE when creating a new ledger
 * @param {string} ledgerId - Ledger folder name
 * @returns {Object} Database with helpers
 */
function initLedger(ledgerId) {
  const dbPath = path.join(DATA_DIR, ledgerId, 'db.sqlite');

  if (fs.existsSync(dbPath)) {
    throw new Error(`Database already exists: ${ledgerId}`);
  }

  try {
    const db = new Database(dbPath);
    
    // Initialize schema (only here!)
    initSchema(db);
    
    // Attach helpers
    db.helpers = getHelpers(db);
    db.ledgerId = ledgerId;

    // Cache connection
    connections.set(ledgerId, db);

    console.log('✅ Initialized database:', ledgerId);
    return db;
  } catch (error) {
    // Cleanup on failure
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

/**
 * Open existing ledger database
 * Use this for accessing existing ledgers
 * @param {string} ledgerId - Ledger folder name
 * @returns {Object} Database with helpers
 */
function openLedger(ledgerId) {
  // Return cached connection
  if (connections.has(ledgerId)) {
    return connections.get(ledgerId);
  }

  const dbPath = path.join(DATA_DIR, ledgerId, 'db.sqlite');

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database not found: ${ledgerId}`);
  }

  try {
    const db = new Database(dbPath);
    
    // NO schema init - database already exists!
    
    // Attach helpers
    db.helpers = getHelpers(db);
    db.ledgerId = ledgerId;

    // Cache connection
    connections.set(ledgerId, db);

    console.log('✅ Opened database:', ledgerId);
    return db;
  } catch (error) {
    console.error('❌ Error opening database:', error);
    throw error;
  }
}

/**
 * Close ledger database connection
 * @param {string} ledgerId - Ledger ID
 */
function closeLedger(ledgerId) {
  if (connections.has(ledgerId)) {
    const db = connections.get(ledgerId);
    db.close();
    connections.delete(ledgerId);
    console.log('🔒 Closed database:', ledgerId);
  }
}

/**
 * Close all database connections
 */
function closeAll() {
  for (const [ledgerId, db] of connections.entries()) {
    db.close();
    console.log('🔒 Closed database:', ledgerId);
  }
  connections.clear();
}

// Cleanup on exit
process.on('exit', closeAll);
process.on('SIGINT', () => {
  closeAll();
  process.exit(0);
});

module.exports = {
  initLedger,
  openLedger,
  closeLedger,
  closeAll
};