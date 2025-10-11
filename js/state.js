/**
 * ============================================================================
 * STATE.JS - Application State Manager
 * ============================================================================
 * 
 * VERANTWOORDELIJKHEID:
 * - Centralized app state (pure data storage)
 * - Getters en setters voor state access
 * - LocalStorage persistence
 * - GEEN business logic (dat hoort in andere files)
 * 
 * GEBRUIKT DOOR:
 * - Alle modules die state nodig hebben
 * 
 * GEBRUIKT:
 * - Niks (pure data layer)
 * 
 * EXPORTS:
 * - AppState.currentLedgerId
 * - AppState.ledgers
 * - AppState.accounts
 * - AppState.getCurrentLedger()
 * - AppState.setCurrentLedger()
 * 
 * ============================================================================
 */

export const AppState = {
  /**
   * Current view name
   * Wordt gezet door Router
   */
  currentView: null,

  /**
   * Current ledger ID
   * Bijv: "ledger-123"
   */
  currentLedgerId: null,

  /**
   * All ledgers
   * Array van ledger objects
   * Structuur: [{ id, name, created_at }, ...]
   */
  ledgers: [],

  /**
   * Accounts in current ledger
   * Array van account objects
   * Structuur: [{ id, name, type, balance, ... }, ...]
   */
  accounts: [],

  /**
   * User preferences
   * Theme, language, etc
   */
  preferences: {
    theme: 'dark',
    language: 'nl'
  },

  /**
   * ========================================================================
   * GETTERS
   * ========================================================================
   */

  /**
   * Get current ledger object
   * @returns {Object|null} - Current ledger of null
   */
  getCurrentLedger() {
    return this.ledgers.find(l => l.id === this.currentLedgerId) || null;
  },

  /**
   * Get account by ID
   * @param {string} accountId - Account ID
   * @returns {Object|null} - Account object of null
   */
  getAccount(accountId) {
    return this.accounts.find(a => a.id === accountId) || null;
  },

  /**
   * ========================================================================
   * SETTERS
   * ========================================================================
   */

  /**
   * Set current ledger
   * @param {string} ledgerId - Ledger ID om te activeren
   */
  setCurrentLedger(ledgerId) {
    this.currentLedgerId = ledgerId;
    this.saveToLocalStorage();
    console.log('💾 Current ledger set to:', ledgerId);
  },

  /**
   * Set ledgers array
   * @param {Array} ledgers - Array van ledger objects
   */
  setLedgers(ledgers) {
    this.ledgers = ledgers;
    console.log('💾 Ledgers updated:', ledgers.length, 'ledgers');
  },

  /**
   * Set accounts array
   * @param {Array} accounts - Array van account objects
   */
  setAccounts(accounts) {
    this.accounts = accounts;
    console.log('💾 Accounts updated:', accounts.length, 'accounts');
  },

  /**
   * Set user preference
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   */
  setPreference(key, value) {
    this.preferences[key] = value;
    this.saveToLocalStorage();
    console.log('💾 Preference updated:', key, '=', value);
  },

  /**
   * ========================================================================
   * PERSISTENCE (LocalStorage)
   * ========================================================================
   */

  /**
   * Save state to localStorage
   * Slaat alleen essentiële data op (geen volledige arrays)
   */
  saveToLocalStorage() {
    const stateToSave = {
      currentLedgerId: this.currentLedgerId,
      preferences: this.preferences
    };
    
    try {
      localStorage.setItem('budgetTrackerState', JSON.stringify(stateToSave));
      console.log('💾 State saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
  },

  /**
   * Load state from localStorage
   * Restore alleen essentiële data
   */
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('budgetTrackerState');
      
      if (saved) {
        const state = JSON.parse(saved);
        this.currentLedgerId = state.currentLedgerId;
        this.preferences = { ...this.preferences, ...state.preferences };
        
        console.log('💾 State loaded from localStorage');
        return true;
      }
      
      console.log('💾 No saved state found');
      return false;
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
      return false;
    }
  },

  /**
   * Clear localStorage
   * Gebruikt voor logout of reset
   */
  clearLocalStorage() {
    try {
      localStorage.removeItem('budgetTrackerState');
      console.log('💾 LocalStorage cleared');
    } catch (error) {
      console.error('❌ Error clearing localStorage:', error);
    }
  },

  /**
   * ========================================================================
   * UTILITIES
   * ========================================================================
   */

  /**
   * Reset state to defaults
   * Gebruikt voor logout
   */
  reset() {
    this.currentView = null;
    this.currentLedgerId = null;
    this.ledgers = [];
    this.accounts = [];
    this.preferences = {
      theme: 'dark',
      language: 'nl'
    };
    
    this.clearLocalStorage();
    console.log('🔄 State reset to defaults');
  },

  /**
   * Debug: Log current state
   * Handig voor troubleshooting
   */
  debug() {
    console.log('📊 AppState Debug:', {
      currentView: this.currentView,
      currentLedgerId: this.currentLedgerId,
      ledgersCount: this.ledgers.length,
      accountsCount: this.accounts.length,
      preferences: this.preferences
    });
  }
};

/**
 * ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 * 
 * import { AppState } from './state.js';
 * 
 * // Get current ledger
 * const ledger = AppState.getCurrentLedger();
 * 
 * // Switch ledger
 * AppState.setCurrentLedger('ledger-123');
 * 
 * // Update accounts
 * const accounts = await API.getAccounts(AppState.currentLedgerId);
 * AppState.setAccounts(accounts);
 * 
 * // Debug state
 * AppState.debug();
 * 
 * ============================================================================
 */