const express = require('express');
const router = express.Router();
const { ledgerMiddleware } = require('../middleware/ledger');
const { endpoint } = require('../util/endpointBuilder');

router.use(ledgerMiddleware);

// GET /api/accounts?ledger_id=X
endpoint('GET', '/')
  .table('accounts')
  .execute('all')
  .transform((accounts, db) => {
    return accounts.map(acc => ({
      ...acc,
      balance: db.helpers.getAccountBalance(acc.id),
      available: db.helpers.getAccountBalance(acc.id) + (acc.overdraft_limit || 0)
    }));
  })
  .register(router);

// GET /api/accounts/:id?ledger_id=X
endpoint('GET', '/:id')
  .table('accounts')
  .where('id = ?', 'id')
  .execute('get')
  .transform((account, db, params) => {
    if (!account) return null;
    const balance = db.helpers.getAccountBalance(params.id);
    return {
      ...account,
      balance,
      available: balance + (account.overdraft_limit || 0)
    };
  })
  .notFound('Account not found')
  .register(router);

// POST /api/accounts?ledger_id=X
endpoint('POST', '/')
  .table('accounts')
  .handler((req, res, db) => {
    const { name, type, overdraft_limit } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Account name is required' });
    }
    
    if (!type || !['asset', 'liability'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "asset" or "liability"' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO accounts (name, type, overdraft_limit)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(name.trim(), type, overdraft_limit || 0);
    
    console.log('✅ Created account:', name);
    return { 
      id: result.lastInsertRowid, 
      name: name.trim(), 
      type,
      overdraft_limit: overdraft_limit || 0,
      balance: 0,
      available: overdraft_limit || 0
    };
  })
  .register(router);

// PATCH /api/accounts/:id?ledger_id=X
endpoint('PATCH', '/:id')
  .table('accounts')
  .update('name', 'overdraft_limit')
  .where('id = ?', 'id')
  .notFound('Account not found')
  .transform((account, db, params) => {
    // Fetch updated account with balance
    const updated = db.prepare('SELECT * FROM accounts WHERE id = ?').get(params.id);
    return {
      ...updated,
      balance: db.helpers.getAccountBalance(params.id),
      available: db.helpers.getAccountBalance(params.id) + (updated.overdraft_limit || 0)
    };
  })
  .register(router);

// DELETE /api/accounts/:id?ledger_id=X
endpoint('DELETE', '/:id')
  .handler((req, res, db) => {
    const { id } = req.params;
    
    // Check if has transactions
    const entryCount = db.prepare('SELECT COUNT(*) as count FROM entries WHERE account_id = ?').get(id);
    
    if (entryCount.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete account with transactions',
        entry_count: entryCount.count
      });
    }
    
    const stmt = db.prepare('DELETE FROM accounts WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error('Account not found');
    }
    
    console.log('✅ Deleted account:', id);
    return { message: 'Account deleted successfully' };
  })
  .register(router);

module.exports = router;