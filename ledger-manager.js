// db/ledger-manager.js
/**
 * Ledger Manager (Orchestrator)
 * High-level facade that combines metadata and database operations
 */

const metadata = require('./metadata');
const database = require('./database');

/**
 * List all ledgers
 * @returns {Array} Array of ledgers
 */
function listLedgers() {
  return metadata.listAll();
}

/**
 * Get single ledger
 * @param {string} ledgerId - Ledger ID
 * @returns {Object|null} Ledger or null
 */
function getLedger(ledgerId) {
  return metadata.get(ledgerId);
}

/**
 * Create new ledger (metadata + database)
 * @param {string} name - Ledger name
 * @returns {Object} Created ledger metadata
 */
function createLedger(name) {
  try {
    // Step 1: Create metadata + folder
    const ledger = metadata.create(name);
    
    // Step 2: Create database + init schema
    database.initLedger(ledger.id);
    
    console.log('✅ Created ledger:', ledger.id);
    return ledger;
  } catch (error) {
    console.error('❌ Error creating ledger:', error);
    throw error;
  }
}

/**
 * Update ledger metadata
 * @param {string} ledgerId - Ledger ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated ledger
 */
function updateLedger(ledgerId, updates) {
  return metadata.update(ledgerId, updates);
}

/**
 * Delete ledger (closes database, removes all files)
 * @param {string} ledgerId - Ledger ID
 */
function deleteLedger(ledgerId) {
  try {
    // Step 1: Close database connection if open
    database.closeLedger(ledgerId);
    
    // Step 2: Remove all files (metadata + database)
    metadata.remove(ledgerId);
    
    console.log('✅ Deleted ledger:', ledgerId);
  } catch (error) {
    console.error('❌ Error deleting ledger:', error);
    throw error;
  }
}

module.exports = {
  listLedgers,
  getLedger,
  createLedger,
  updateLedger,
  deleteLedger
};