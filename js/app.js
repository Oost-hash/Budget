/**
 * ============================================================================
 * APP.JS - Application Entry Point
 * ============================================================================
 * 
 * VERANTWOORDELIJKHEID:
 * - App initialization sequence
 * - Load initial data from API
 * - Setup UI components
 * - Determine initial route
 * - Error handling voor startup
 * 
 * GEBRUIKT:
 * - Router → navigatie
 * - Sidebar → UI init
 * - AppState → state management
 * - API → data loading
 * 
 * FLOW:
 * 1. Load state from localStorage
 * 2. Fetch ledgers from API
 * 3. Determine which ledger to use
 * 4. Check if onboarding needed
 * 5. Init sidebar
 * 6. Navigate to initial view
 * 
 * ============================================================================
 */

import { Router } from './router.js';
import { Sidebar } from './sidebar.js';
import { AppState } from './state.js';
import { API } from './api.js';

/**
 * Main initialization function
 * Called when DOM is ready
 */
async function init() {
  console.log('🚀 Budget Tracker starting...');

  try {
    // 1. Load saved state from localStorage
    console.log('📦 Loading saved state...');
    AppState.loadFromLocalStorage();

    // 2. Fetch ledgers from API
    console.log('📡 Fetching ledgers...');
    const ledgers = await API.getLedgers();
    AppState.setLedgers(ledgers);

    // 3. Determine which ledger to use
    if (ledgers.length === 0) {
      // No ledgers → onboarding
      console.log('🎯 No ledgers found, starting onboarding...');
      await Router.navigate('onboarding');
      return; // Stop hier, geen sidebar nodig
    }

    // 4. Select ledger (from localStorage or first available)
    let currentLedgerId = AppState.currentLedgerId;
    
    if (!currentLedgerId || !ledgers.find(l => l.id === currentLedgerId)) {
      // Geen saved ledger of bestaat niet meer → gebruik eerste
      currentLedgerId = ledgers[0].id;
      AppState.setCurrentLedger(currentLedgerId);
      console.log('📋 Using first ledger:', currentLedgerId);
    } else {
      console.log('📋 Using saved ledger:', currentLedgerId);
    }

    // 5. Load accounts voor current ledger
    console.log('📡 Fetching accounts...');
    const accounts = await API.getAccounts(currentLedgerId);
    AppState.setAccounts(accounts);

    // 6. Initialize sidebar (reads from state!)
    console.log('🎨 Initializing sidebar...');
    Sidebar.init();

    // 7. Navigate to initial view
    console.log('🎯 Navigating to initial view...');
    await Router.navigate('budget');

    // 8. Optional: Preload views in background (disabled for now)
    // setTimeout(() => {
    //   Router.preload('transactions');
    // }, 3000);

    console.log('✅ Budget Tracker ready!');
    
  } catch (error) {
    console.error('❌ Initialization error:', error);
    showErrorScreen(error);
  }
}

/**
 * Show error screen when initialization fails
 * @param {Error} error - The error that occurred
 */
function showErrorScreen(error) {
  const app = document.querySelector('.app');
  app.innerHTML = `
    <div class="error-view">
      <h1>Oeps! Er ging iets mis</h1>
      <p>De app kon niet worden gestart.</p>
      <p class="u-text-muted">${error.message}</p>
      <div class="button-group">
        <button class="btn btn--primary" onclick="location.reload()">
          Probeer opnieuw
        </button>
        <button class="btn btn--secondary" onclick="clearAndReload()">
          Reset app
        </button>
      </div>
    </div>
  `;
}

/**
 * Clear localStorage and reload
 * Gebruikt als laatste redmiddel bij errors
 */
window.clearAndReload = function() {
  if (confirm('Weet je zeker dat je de app wilt resetten? Lokale instellingen gaan verloren.')) {
    AppState.clearLocalStorage();
    location.reload();
  }
};

/**
 * Wait for DOM to be ready, then initialize
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already ready
  init();
}

/**
 * ============================================================================
 * INITIALIZATION FLOW
 * ============================================================================
 * 
 * Scenario 1: Nieuwe gebruiker
 * ┌─────────────────────────────────────────┐
 * │ 1. Load state (empty)                   │
 * │ 2. Fetch ledgers → []                   │
 * │ 3. Navigate to onboarding               │
 * │ 4. User creates ledger                  │
 * │ 5. Reload app → Scenario 2              │
 * └─────────────────────────────────────────┘
 * 
 * Scenario 2: Bestaande gebruiker
 * ┌─────────────────────────────────────────┐
 * │ 1. Load state (has currentLedgerId)     │
 * │ 2. Fetch ledgers → [...]                │
 * │ 3. Use saved ledger                     │
 * │ 4. Load accounts                        │
 * │ 5. Init sidebar                         │
 * │ 6. Navigate to budget view              │
 * └─────────────────────────────────────────┘
 * 
 * Scenario 3: Error handling
 * ┌─────────────────────────────────────────┐
 * │ 1. Something fails (API down, etc)      │
 * │ 2. Catch error                          │
 * │ 3. Show error screen                    │
 * │ 4. Offer retry or reset                 │
 * └─────────────────────────────────────────┘
 * 
 * ============================================================================
 */