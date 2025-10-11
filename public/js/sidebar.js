/**
 * ============================================================================
 * SIDEBAR.JS - Sidebar UI Controller
 * ============================================================================
 * 
 * VERANTWOORDELIJKHEID:
 * - Ledger selector dropdown
 * - Navigatie links renderen
 * - Accounts lijst renderen
 * - User interactions (clicks)
 * - READS from AppState (no initial fetches!)
 * - WRITES to API on user actions (add/update/delete)
 * 
 * GEBRUIKT DOOR:
 * - app.js (sidebar init)
 * 
 * GEBRUIKT:
 * - Router → voor navigatie
 * - AppState → voor data (READ)
 * - API → voor user actions (WRITE)
 * 
 * EXPORTS:
 * - Sidebar.init() → Initialize sidebar (renders from state)
 * - Sidebar.renderNavigation() → Render nav links
 * - Sidebar.renderAccounts() → Render accounts from state
 * 
 * ARCHITECTUUR:
 * - app.js fetches initial data → puts in AppState
 * - Sidebar.init() renders from AppState
 * - User action (add account) → API call → update AppState → re-render
 * 
 * ============================================================================
 */

import { Router } from './router.js';
import { AppState } from './state.js';
import { API } from './api.js';

export const Sidebar = {
  /**
   * Initialize sidebar
   * Sets up all event listeners and renders initial state
   * READS from AppState, does NOT fetch from API!
   */
  init() {
    this.setupLedgerDropdown();
    this.renderLedgerSelector();
    this.renderNavigation();
    this.renderAccounts();  // Render accounts from state!
    this.setupAddAccountButton();
    
    console.log('✅ Sidebar ready');
  },

  /**
   * ========================================================================
   * LEDGER SELECTOR
   * ========================================================================
   */

  /**
   * Setup ledger dropdown behavior
   * Handles open/close and outside clicks
   */
  setupLedgerDropdown() {
    const dropdown = document.querySelector('.js-ledger-dropdown');
    const trigger = dropdown.querySelector('.dropdown__trigger');
    
    // Toggle dropdown on click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('dropdown--open');
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('dropdown--open');
      }
    });
    
    // Setup action buttons
    this.setupLedgerActions();
  },

  /**
   * Setup ledger action buttons (rename, settings, add)
   */
  setupLedgerActions() {
    document.querySelector('.js-rename-ledger')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.renameLedger();
    });
    
    document.querySelector('.js-ledger-settings')?.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Settings - coming soon!');
      this.closeDropdown();
    });
    
    document.querySelector('.js-add-ledger')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.addNewLedger();
    });
  },

  /**
   * Render ledger selector
   * Updates trigger text and ledger list
   */
  renderLedgerSelector() {
    const currentLedger = AppState.getCurrentLedger();
    const currentName = currentLedger?.name || 'Select Ledger';
    
    // Update trigger text
    document.querySelector('.js-current-ledger').textContent = currentName;
    
    // Render ledger list
    const list = document.querySelector('.js-ledger-list');
    list.innerHTML = AppState.ledgers.map(ledger => {
      const isActive = ledger.id === AppState.currentLedgerId;
      const activeClass = isActive ? 'dropdown__item--active' : '';
      
      return `
        <a href="#" 
           class="dropdown__item ${activeClass}" 
           data-ledger-id="${ledger.id}">
          ${ledger.name}
        </a>
      `;
    }).join('');
    
    // Add click handlers
    list.querySelectorAll('.dropdown__item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const ledgerId = item.dataset.ledgerId;
        this.switchLedger(ledgerId);
      });
    });
  },

  /**
   * Switch to different ledger
   * Fetches new data, updates state, re-renders
   * @param {string} ledgerId - ID of ledger to switch to
   */
  async switchLedger(ledgerId) {
    console.log('🔄 Switching to ledger:', ledgerId);
    
    // 1. Update state
    AppState.setCurrentLedger(ledgerId);
    
    // 2. Fetch accounts for new ledger
    const accounts = await API.getAccounts(ledgerId);
    AppState.setAccounts(accounts);
    
    // 3. Re-render UI
    this.renderLedgerSelector();
    this.renderAccounts();
    this.closeDropdown();
    
    console.log('✅ Switched to ledger:', ledgerId);
  },

  /**
   * Rename current ledger
   */
  async renameLedger() {
    const currentLedger = AppState.getCurrentLedger();
    const newName = prompt('Nieuwe naam:', currentLedger.name);
    
    if (!newName || newName === currentLedger.name) {
      this.closeDropdown();
      return;
    }
    
    try {
      await API.updateLedger(AppState.currentLedgerId, { name: newName });
      
      // Reload ledgers
      const ledgers = await API.getLedgers();
      AppState.setLedgers(ledgers);
      
      this.renderLedgerSelector();
      alert('Naam gewijzigd!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
    
    this.closeDropdown();
  },

  /**
   * Add new ledger
   * Creates ledger via API, updates state, switches to it
   */
  async addNewLedger() {
    const name = prompt('Nieuwe ledger naam:');
    if (!name) {
      this.closeDropdown();
      return;
    }
    
    try {
      // 1. Create ledger
      const newLedger = await API.createLedger(name);
      
      // 2. Reload all ledgers
      const ledgers = await API.getLedgers();
      AppState.setLedgers(ledgers);
      
      // 3. Switch to new ledger (will fetch accounts + render)
      await this.switchLedger(newLedger.id);
      
      alert('Ledger toegevoegd!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
    
    this.closeDropdown();
  },

  /**
   * Close ledger dropdown
   */
  closeDropdown() {
    document.querySelector('.js-ledger-dropdown')?.classList.remove('dropdown--open');
  },

  /**
   * ========================================================================
   * NAVIGATION
   * ========================================================================
   */

  /**
   * Render navigation links from Router
   * Gets routes from Router.getSidebarRoutes()
   */
  renderNavigation() {
    const navContainer = document.querySelector('nav');
    const existingNav = navContainer.querySelector('.nav-links');
    
    // Remove old nav if exists
    if (existingNav) {
      existingNav.remove();
    }
    
    // Get routes from Router
    const sidebarRoutes = Router.getSidebarRoutes();
    
    // Generate navigation HTML
    const navHTML = `
      <div class="nav-links">
        ${sidebarRoutes.map(route => {
          const isActive = Router.currentRoute === route.name;
          const activeClass = isActive ? 'active' : '';
          
          return `
            <a href="#" 
               class="nav-link ${activeClass}" 
               data-route="${route.name}">
              ${route.icon ? `<span class="nav-icon">${route.icon}</span>` : ''}
              ${route.label}
            </a>
          `;
        }).join('')}
      </div>
    `;
    
    // Insert at beginning of nav
    navContainer.insertAdjacentHTML('afterbegin', navHTML);
    
    // Setup click handlers
    this.setupNavigationHandlers();
  },

  /**
   * Setup navigation click handlers
   * Calls Router.navigate() on click
   */
  setupNavigationHandlers() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const routeName = link.dataset.route;
        
        // Use Router to navigate
        const success = await Router.navigate(routeName);
        
        if (success) {
          // Update active state
          document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
          link.classList.add('active');
          
          // Remove active from accounts
          document.querySelectorAll('.account-item').forEach(a => a.classList.remove('active'));
        }
      });
    });
  },

  /**
   * ========================================================================
   * ACCOUNTS LIST
   * ========================================================================
   */

  /**
   * Render accounts list
   * READS from AppState.accounts (no API calls!)
   */
  renderAccounts() {
    const accountList = document.querySelector('.account-list');
    const totalBalanceEl = document.querySelector('.total-balance');
    
    let totalBalance = 0;
    
    // Render each account from state
    accountList.innerHTML = AppState.accounts.map(acc => {
      const balance = acc.balance || 0;
      totalBalance += balance;
      const balanceClass = balance < 0 ? 'negative' : 'positive';
      
      return `
        <div class="account-item" data-account-id="${acc.id}">
          <span class="account-name">${acc.name}</span>
          <span class="account-balance ${balanceClass}">
            ${API.formatCurrency(balance)}
          </span>
        </div>
      `;
    }).join('');
    
    // Update total
    totalBalanceEl.textContent = API.formatCurrency(totalBalance);
    
    // Add click handlers
    this.setupAccountHandlers();
  },

  /**
   * Setup account click handlers
   */
  setupAccountHandlers() {
    document.querySelectorAll('.account-item').forEach(item => {
      item.addEventListener('click', () => {
        const accountId = item.dataset.accountId;
        const accountName = item.querySelector('.account-name').textContent;
        this.selectAccount(accountId, accountName);
      });
    });
  },

  /**
   * Handle account selection
   * @param {string} accountId - ID of selected account
   * @param {string} accountName - Name of selected account
   */
  selectAccount(accountId, accountName) {
    // Remove active from all
    document.querySelectorAll('.account-item').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
    
    // Add active to selected
    const selectedItem = document.querySelector(`[data-account-id="${accountId}"]`);
    if (selectedItem) {
      selectedItem.classList.add('active');
    }
    
    // TODO: Navigate to account transactions view
    console.log('📊 Selected account:', accountId, accountName);
    // Later: Router.navigate('transactions', { accountId });
  },

  /**
   * ========================================================================
   * ADD ACCOUNT
   * ========================================================================
   */

  /**
   * Setup add account button
   */
  setupAddAccountButton() {
    document.querySelector('.add-account-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showAddAccountModal();
    });
  },

  /**
   * Show add account modal
   * Creates account, updates state, re-renders
   * TODO: Later replace with proper modal component
   */
  async showAddAccountModal() {
    const name = prompt('Account naam:');
    if (!name) return;
    
    const type = prompt('Type (asset/liability):');
    if (!type || !['asset', 'liability'].includes(type)) {
      alert('Type moet "asset" of "liability" zijn');
      return;
    }
    Ja
    try {
      // 1. Create account via API
      await API.createAccount(AppState.currentLedgerId, {
        name,
        type,
        overdraft_limit: 0
      });
      
      // 2. Reload accounts from API
      const accounts = await API.getAccounts(AppState.currentLedgerId);
      AppState.setAccounts(accounts);
      
      // 3. Re-render UI
      this.renderAccounts();
      
      alert('Account toegevoegd!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }
};

/**
 * ============================================================================
 * USAGE
 * ============================================================================
 * 
 * // In app.js
 * import { Sidebar } from './sidebar.js';
 * 
 * async function init() {
 *   await loadInitialData();
 *   Sidebar.init();
 *   await Router.navigate('budget');
 * }
 * 
 * ============================================================================
 */