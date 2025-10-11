// schema.js
const { table } = require('../util/schemaBuilder');

/**
 * Database Schema
 * Applied to each ledger database
 */
function initSchema(db) {
  console.log('📋 Initializing schema...');

  db.pragma('foreign_keys = ON');

  // Accounts
  table('accounts')
    .id()
    .text('name').required().unique() 
    .text('type').required().check("IN ('asset', 'liability')")
    .boolean('is_savings').default(0)
    .real('overdraft_limit').default(0)
    .real('credit_limit').default(0)
    .integer('payment_due_day')  // NULL = niet applicable
    .timestamp()
    .create(db);

  // Transactions
  table('transactions')
    .id()
    .text('date').required()
    .text('description')
    .text('payee')
    .boolean('is_transfer').default(0)
    .timestamp()
    .index('date', 'idx_transactions_date')
    .create(db);

  // Entries (double-entry)
  table('entries')
    .id()
    .foreignKey('transaction_id', 'transactions')
    .foreignKey('account_id', 'accounts')
    .real('amount').required()
    .timestamp()
    .index('transaction_id', 'idx_entries_transaction')
    .index('account_id', 'idx_entries_account')
    .create(db);

  // Categories
  table('categories')
    .id()
    .text('name').required()
    .text('group_name').required()
    .timestamp()
    .create(db);

  // Transaction Categories (one-to-one: transaction has max one category)
  table('transaction_categories')
    .integer('transaction_id').primaryKey()
    .foreignKey('category_id', 'categories')
    .create(db);

  // Payees
  table('payees')
    .id()
    .text('name').required().unique()
    .integer('default_category_id')
    .create(db);

  console.log('✅ Schema ready');
}

module.exports = { initSchema };