// db/metadata.js
/**
 * Metadata Operations
 * Handles ledger metadata and folder structure
 * Does NOT touch database files
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('📁 Created data directory');
}

/**
 * List all ledgers
 * @returns {Array} Array of ledger metadata
 */
function listAll() {
  try {
    const items = fs.readdirSync(DATA_DIR);
    const ledgers = [];

    for (const item of items) {
      const ledgerPath = path.join(DATA_DIR, item);
      const stat = fs.statSync(ledgerPath);

      if (!stat.isDirectory()) continue;

      const metadataPath = path.join(ledgerPath, 'metadata.json');
      const dbPath = path.join(ledgerPath, 'db.sqlite');

      // Only include if both metadata and db exist
      if (fs.existsSync(metadataPath) && fs.existsSync(dbPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        ledgers.push({
          id: item,
          ...metadata,
          path: ledgerPath
        });
      }
    }

    return ledgers.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('❌ Error listing metadata:', error);
    return [];
  }
}

/**
 * Get single ledger metadata
 * @param {string} ledgerId - Ledger ID
 * @returns {Object|null} Ledger metadata or null
 */
function get(ledgerId) {
  try {
    const metadataPath = path.join(DATA_DIR, ledgerId, 'metadata.json');

    if (!fs.existsSync(metadataPath)) {
      return null;
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    return {
      id: ledgerId,
      ...metadata,
      path: path.join(DATA_DIR, ledgerId)
    };
  } catch (error) {
    console.error('❌ Error getting metadata:', error);
    return null;
  }
}

/**
 * Create ledger metadata and folder structure
 * Does NOT create database
 * @param {string} name - Ledger name
 * @returns {Object} Ledger metadata with id
 */
function create(name) {
  if (!name || name.trim() === '') {
    throw new Error('Ledger name is required');
  }

  // Generate unique ID
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  const timestamp = Date.now();
  const ledgerId = `${sanitized}_${timestamp}`;
  const ledgerPath = path.join(DATA_DIR, ledgerId);

  if (fs.existsSync(ledgerPath)) {
    throw new Error('Ledger already exists');
  }

  try {
    // Create folder
    fs.mkdirSync(ledgerPath, { recursive: true });

    // Create metadata
    const metadata = {
      name: name.trim(),
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      currency: 'EUR',
      description: ''
    };

    fs.writeFileSync(
      path.join(ledgerPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log('✅ Created metadata:', ledgerId);

    return {
      id: ledgerId,
      ...metadata,
      path: ledgerPath
    };
  } catch (error) {
    // Cleanup on failure
    if (fs.existsSync(ledgerPath)) {
      fs.rmSync(ledgerPath, { recursive: true, force: true });
    }
    throw error;
  }
}

/**
 * Update ledger metadata
 * @param {string} ledgerId - Ledger ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated ledger metadata
 */
function update(ledgerId, updates) {
  const ledger = get(ledgerId);
  if (!ledger) {
    throw new Error('Ledger not found');
  }

  try {
    const metadataPath = path.join(DATA_DIR, ledgerId, 'metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    if (updates.name !== undefined) metadata.name = updates.name.trim();
    if (updates.description !== undefined) metadata.description = updates.description;
    if (updates.currency !== undefined) metadata.currency = updates.currency;

    metadata.last_modified = new Date().toISOString();

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('✅ Updated metadata:', ledgerId);

    return {
      id: ledgerId,
      ...metadata,
      path: ledger.path
    };
  } catch (error) {
    console.error('❌ Error updating metadata:', error);
    throw error;
  }
}

/**
 * Delete ledger folder (metadata + database + everything)
 * @param {string} ledgerId - Ledger ID
 */
function remove(ledgerId) {
  const ledgerPath = path.join(DATA_DIR, ledgerId);

  if (!fs.existsSync(ledgerPath)) {
    throw new Error('Ledger not found');
  }

  try {
    fs.rmSync(ledgerPath, { recursive: true, force: true });
    console.log('✅ Deleted ledger folder:', ledgerId);
  } catch (error) {
    console.error('❌ Error deleting ledger:', error);
    throw error;
  }
}

module.exports = {
  listAll,
  get,
  create,
  update,
  remove
};