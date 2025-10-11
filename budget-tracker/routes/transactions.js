const express = require('express');
const router = express.Router();
const { ledgerMiddleware } = require('../middleware/ledger');
const { endpoint } = require('../util/endpointBuilder');

router.use(ledgerMiddleware);

// GET /api/transactions?ledger_id=X
endpoint('GET', '/')
  .table('transactions')
  .select('id', 'date', 'payee', 'description', 'is_transfer')
  .selectFrom('transaction_categories', 'category_id')
  .selectFrom('categories', 'name as category_name')
  .join('JOIN', 'entries', 'transactions.id', 'entries.transaction_id')
  .join('LEFT', 'transaction_categories', 'transactions.id', 'transaction_categories.transaction_id')
  .join('LEFT', 'categories', 'transaction_categories.category_id', 'categories.id')
  .distinct()
  .order('date', 'DESC')
  .order('id', 'DESC')
  .execute('all')
  .transform((transactions, db) => {
    return transactions.map(t => ({
      ...t,
      entries: db.helpers.getTransactionEntries(t.id)
    }));
  })
  .register(router);

// GET /api/transactions/:id?ledger_id=X
endpoint('GET', '/:id')
  .table('transactions')
  .select('*')
  .selectFrom('transaction_categories', 'category_id')
  .selectFrom('categories', 'name as category_name')
  .join('LEFT', 'transaction_categories', 'transactions.id', 'transaction_categories.transaction_id')
  .join('LEFT', 'categories', 'transaction_categories.category_id', 'categories.id')
  .where('transactions.id = ?', 'id')
  .execute('get')
  .transform((transaction, db, params) => {
    if (!transaction) return null;
    return {
      ...transaction,
      entries: db.helpers.getTransactionEntries(params.id)
    };
  })
  .notFound('Transaction not found')
  .register(router);

// POST /api/transactions?ledger_id=X
endpoint('POST', '/')
  .handler((req, res, db) => {
    const { date, payee, description, entries, category_id, is_transfer } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    if (!entries || entries.length < 2) {
      return res.status(400).json({ error: 'At least 2 entries required' });
    }
    
    // Check balance
    const sum = entries.reduce((acc, e) => acc + e.amount, 0);
    if (Math.abs(sum) >= 0.01) {
      return res.status(400).json({ 
        error: 'Entries must balance to zero',
        sum 
      });
    }
    
    // Insert transaction
    const insertTransaction = db.transaction((txData) => {
      const txStmt = db.prepare(`
        INSERT INTO transactions (date, payee, description, is_transfer)
        VALUES (?, ?, ?, ?)
      `);
      const txResult = txStmt.run(
        txData.date, 
        txData.payee || null, 
        txData.description || null,
        txData.is_transfer ? 1 : 0
      );
      
      const transactionId = txResult.lastInsertRowid;
      
      // Insert entries
      const entryStmt = db.prepare(`
        INSERT INTO entries (transaction_id, account_id, amount)
        VALUES (?, ?, ?)
      `);
      
      for (const entry of txData.entries) {
        entryStmt.run(transactionId, entry.account_id, entry.amount);
      }
      
      // Insert category if not transfer
      if (!txData.is_transfer && txData.category_id) {
        const catStmt = db.prepare(`
          INSERT INTO transaction_categories (transaction_id, category_id)
          VALUES (?, ?)
        `);
        catStmt.run(transactionId, txData.category_id);
      }
      
      return transactionId;
    });
    
    const transactionId = insertTransaction({
      date,
      payee,
      description,
      entries,
      category_id,
      is_transfer
    });
    
    console.log('✅ Created transaction:', transactionId);
    
    // Return full transaction
    const transaction = db.prepare(`
      SELECT 
        t.*,
        tc.category_id,
        c.name as category_name
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.id = tc.transaction_id
      LEFT JOIN categories c ON tc.category_id = c.id
      WHERE t.id = ?
    `).get(transactionId);
    
    transaction.entries = db.helpers.getTransactionEntries(transactionId);
    return transaction;
  })
  .register(router);

// PATCH /api/transactions/:id?ledger_id=X
endpoint('PATCH', '/:id')
  .handler((req, res, db) => {
    const { id } = req.params;
    const { date, payee, description, category_id } = req.body;
    
    const updates = [];
    const values = [];
    
    if (date !== undefined) {
      updates.push('date = ?');
      values.push(date);
    }
    
    if (payee !== undefined) {
      updates.push('payee = ?');
      values.push(payee);
    }
    
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    
    if (updates.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
    
    // Update category
    if (category_id !== undefined) {
      db.prepare('DELETE FROM transaction_categories WHERE transaction_id = ?').run(id);
      
      if (category_id !== null) {
        db.prepare(`
          INSERT INTO transaction_categories (transaction_id, category_id)
          VALUES (?, ?)
        `).run(id, category_id);
      }
    }
    
    console.log('✅ Updated transaction:', id);
    
    // Return updated
    const transaction = db.prepare(`
      SELECT 
        t.*,
        tc.category_id,
        c.name as category_name
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.id = tc.transaction_id
      LEFT JOIN categories c ON tc.category_id = c.id
      WHERE t.id = ?
    `).get(id);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    transaction.entries = db.helpers.getTransactionEntries(id);
    return transaction;
  })
  .register(router);

// DELETE /api/transactions/:id?ledger_id=X
endpoint('DELETE', '/:id')
  .table('transactions')
  .where('id = ?', 'id')
  .execute('run')
  .notFound('Transaction not found')
  .register(router);

module.exports = router;