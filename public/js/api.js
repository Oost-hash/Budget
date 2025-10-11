/**
 * ============================================================================
 * API.JS - Backend Communication Layer
 * ============================================================================
 * 
 * VERANTWOORDELIJKHEID:
 * - All HTTP requests naar backend
 * - Error handling
 * - Data formatting (currency, dates)
 * - CRUD operations voor: ledgers, accounts, transactions, categories
 * 
 * GEBRUIKT DOOR:
 * - Alle modules die backend data nodig hebben
 * 
 * GEBRUIKT:
 * - Niks (pure API layer)
 * 
 * EXPORTS:
 * - API.getLedgers()
 * - API.createLedger()
 * - API.getAccounts()
 * - API.createAccount()
 * - API.formatCurrency()
 * 
 * ============================================================================
 */

export const API = {
  /**
   * ========================================================================
   * HTTP HELPERS
   * ========================================================================
   */

  /**
   * Generic fetch wrapper met error handling
   * @param {string} endpoint - API endpoint (bijv: '/api/ledgers')
   * @param {Object} options - Fetch options
   * @returns {Promise} - Response data
   */
  async request(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
      console.log(`📡 ${config.method || 'GET'} ${endpoint}`);
      
      const response = await fetch(endpoint, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Response:`, data);
      
      return data;
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      throw error;
    }
  },

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * PATCH request
   */
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  /**
   * ========================================================================
   * LEDGERS
   * ========================================================================
   */

  /**
   * Get all ledgers
   * @returns {Promise<Array>} - Array van ledgers
   */
  async getLedgers() {
    return this.get('/api/ledgers');
  },

  /**
   * Get single ledger
   * @param {string} ledgerId - Ledger ID
   * @returns {Promise<Object>} - Ledger object
   */
  async getLedger(ledgerId) {
    return this.get(`/api/ledgers/${ledgerId}`);
  },

  /**
   * Create new ledger
   * @param {string} name - Ledger name
   * @returns {Promise<Object>} - Created ledger
   */
  async createLedger(name) {
    return this.post('/api/ledgers', { name });
  },

  /**
   * Update ledger
   * @param {string} ledgerId - Ledger ID
   * @param {Object} data - Update data (bijv: { name: 'New Name' })
   * @returns {Promise<Object>} - Updated ledger
   */
  async updateLedger(ledgerId, data) {
    return this.patch(`/api/ledgers/${ledgerId}`, data);
  },

  /**
   * Delete ledger
   * @param {string} ledgerId - Ledger ID
   * @returns {Promise<Object>} - Delete response
   */
  async deleteLedger(ledgerId) {
    return this.delete(`/api/ledgers/${ledgerId}`);
  },

  /**
   * ========================================================================
   * ACCOUNTS
   * ========================================================================
   */

  /**
   * Get all accounts in ledger
   * @param {string} ledgerId - Ledger ID
   * @returns {Promise<Array>} - Array van accounts
   */
  async getAccounts(ledgerId) {
    return this.get(`/api/accounts?ledger_id=${ledgerId}`);
  },

  /**
   * Get single account
   * @param {string} ledgerId - Ledger ID
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} - Account object
   */
  async getAccount(ledgerId, accountId) {
    return this.get(`/api/accounts/${accountId}?ledger_id=${ledgerId}`);
  },

  /**
   * Create new account
   * @param {string} ledgerId - Ledger ID
   * @param {Object} data - Account data
   * @param {string} data.name - Account name
   * @param {string} data.type - 'asset' or 'liability'
   * @param {number} data.overdraft_limit - Overdraft limit (optional)
   * @returns {Promise<Object>} - Created account
   */
  async createAccount(ledgerId, data) {
    return this.post(`/api/accounts?ledger_id=${ledgerId}`, data);
  },

  /**
   * Update account
   * @param {string} ledgerId - Ledger ID
   * @param {string} accountId - Account ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated account
   */
  async updateAccount(ledgerId, accountId, data) {
    return this.patch(`/api/accounts/${accountId}?ledger_id=${ledgerId}`, data);
  },

  /**
   * Delete account
   * @param {string} ledgerId - Ledger ID
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} - Delete response
   */
  async deleteAccount(ledgerId, accountId) {
    return this.delete(`/api/accounts/${accountId}?ledger_id=${ledgerId}`);
  },

  /**
   * ========================================================================
   * CATEGORIES
   * ========================================================================
   */

  /**
   * Get categories for a ledger
   * @param {string} ledgerId - Ledger ID
   * @returns {Promise<Array>} - Array van categories
   */
  async getCategories(ledgerId) {
    return this.get(`/api/categories?ledger_id=${ledgerId}`);
  },

  /**
   * Create category
   * @param {string} ledgerId - Ledger ID
   * @param {Object} data - Category data
   * @returns {Promise<Object>} - Created category
   */
  async createCategory(ledgerId, data) {
    return this.post(`/api/categories?ledger_id=${ledgerId}`, data);
  },

  /**
   * ========================================================================
   * TRANSACTIONS
   * ========================================================================
   */

  /**
   * Get transactions
   * @param {string} ledgerId - Ledger ID
   * @param {Object} filters - Optional filters (bijv: { account_id, start_date })
   * @returns {Promise<Array>} - Array van transactions
   */
  async getTransactions(ledgerId, filters = {}) {
    const params = new URLSearchParams({ ledger_id: ledgerId, ...filters });
    return this.get(`/api/transactions?${params}`);
  },

  /**
   * Create transaction
   * @param {string} ledgerId - Ledger ID
   * @param {Object} data - Transaction data
   * @returns {Promise<Object>} - Created transaction
   */
  async createTransaction(ledgerId, data) {
    return this.post(`/api/transactions?ledger_id=${ledgerId}`, data);
  },

  /**
   * Update transaction
   * @param {string} ledgerId - Ledger ID
   * @param {string} transactionId - Transaction ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated transaction
   */
  async updateTransaction(ledgerId, transactionId, data) {
    return this.patch(`/api/transactions/${transactionId}?ledger_id=${ledgerId}`, data);
  },

  /**
   * Delete transaction
   * @param {string} ledgerId - Ledger ID
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} - Delete response
   */
  async deleteTransaction(ledgerId, transactionId) {
    return this.delete(`/api/transactions/${transactionId}?ledger_id=${ledgerId}`);
  },

  /**
   * ========================================================================
   * FORMATTING UTILITIES
   * ========================================================================
   */

  /**
   * Format number as currency (EUR)
   * @param {number} amount - Amount in cents of euros
   * @returns {string} - Formatted string (bijv: "€1.234,56")
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },

  /**
   * Format date
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date (bijv: "1 jan 2024")
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  },

  /**
   * Format date with time
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted datetime
   */
  formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
};

/**
 * ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 * 
 * import { API } from './api.js';
 * 
 * // Get ledgers
 * const ledgers = await API.getLedgers();
 * 
 * // Create account
 * const account = await API.createAccount('ledger-123', {
 *   name: 'Spaarrekening',
 *   type: 'asset'
 * });
 * 
 * // Get transactions with filters
 * const transactions = await API.getTransactions('ledger-123', {
 *   account_id: 'account-456',
 *   start_date: '2024-01-01'
 * });
 * 
 * // Format currency
 * const formatted = API.formatCurrency(1234.56); // "€1.234,56"
 * 
 * ============================================================================
 */