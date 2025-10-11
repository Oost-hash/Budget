// db/dbHelpers.js
const { SQLBuilder } = require('../util/sqlBuilder');

/**
 * Helper functions for database operations
 * These are attached to db.helpers in the connector
 */
function getHelpers(db) {
  return {
    /**
     * Get the current balance of an account
     * @param {number} accountId - Account ID
     * @returns {number} Current balance
     */
    getAccountBalance: (accountId) => {
      const result = new SQLBuilder()
        .select('COALESCE(SUM(amount), 0) as balance')
        .from('entries')
        .where('account_id = ?', accountId)
        .get(db);
      
      return result.balance;
    },

    /**
     * Check if a transaction's entries sum to zero (balanced)
     * @param {number} transactionId - Transaction ID
     * @returns {boolean} True if balanced
     */
    isTransactionBalanced: (transactionId) => {
      const result = new SQLBuilder()
        .select('COALESCE(SUM(amount), 0) as total')
        .from('entries')
        .where('transaction_id = ?', transactionId)
        .get(db);
      
      return Math.abs(result.total) < 0.01;
    },

    /**
     * Get all entries for a transaction with account names
     * @param {number} transactionId - Transaction ID
     * @returns {Array} Array of entries
     */
    getTransactionEntries: (transactionId) => {
      return new SQLBuilder()
        .selectFrom('e', '*')
        .select('a.name as account_name')
        .from('entries e')
        .innerJoin('accounts a', 'e.account_id', 'a.id')
        .where('e.transaction_id = ?', transactionId)
        .all(db);
    },

    /**
     * Check if a proposed amount would stay within overdraft limit
     * @param {number} accountId - Account ID
     * @param {number} proposedAmount - Amount to add/subtract
     * @returns {boolean} True if within limit
     */
    isWithinOverdraft: (accountId, proposedAmount) => {
      const account = new SQLBuilder()
        .select('overdraft_limit')
        .from('accounts')
        .where('id = ?', accountId)
        .get(db);
      
      if (!account) return false;
      
      const currentBalance = getHelpers(db).getAccountBalance(accountId);
      const newBalance = currentBalance + proposedAmount;
      
      return newBalance >= -(account.overdraft_limit || 0);
    }
  };
}

module.exports = { getHelpers };