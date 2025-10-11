/**
 * ============================================================================
 * ROUTER.JS - Pure HTML View Navigation
 * ============================================================================
 * 
 * VERANTWOORDELIJKHEID:
 * - Route definities (welke views bestaan?)
 * - Navigatie tussen views
 * - HTML files laden
 * - HTML caching (load 1x, hergebruik)
 * - Component discovery triggeren (via registry)
 * 
 * GEBRUIKT DOOR:
 * - sidebar.js → navigatie clicks
 * - app.js → initial route
 * 
 * GEBRUIKT:
 * - ComponentRegistry → om components in views te laden
 * 
 * ============================================================================
 */

import { ComponentRegistry } from './registry.js';

export const Router = {
  /**
   * ========================================================================
   * ROUTE DEFINITIONS
   * ========================================================================
   * 
   * Elke route wijst naar een HTML file.
   * 
   * 
   * Properties:
   * - name: Unieke identifier
   * - label: Display naam in sidebar
   * - icon: Emoji voor sidebar
   * - showInSidebar: Toon in navigatie?
   * - path: Pad naar HTML file
   */
  routes: {
    budget: {
      name: 'budget',
      label: 'Budget',
      icon: '💰',
      showInSidebar: true,
      path: './views/budget.html'
    },

    transactions: {
      name: 'transactions',
      label: 'Transacties',
      icon: '📊',
      showInSidebar: true,
      path: './views/transactions.html'
    },

    onboarding: {
      name: 'onboarding',
      label: 'Onboarding',
      icon: null,
      showInSidebar: false,  // Onboarding niet in sidebar
      path: './views/onboarding.html'
    }
  },

  /**
   * HTML Cache
   * Slaat HTML strings op zodat we niet elke keer opnieuw fetchen
   * Structuur: Map<routeName, htmlString>
   */
  cache: new Map(),

  /**
   * Huidige route naam
   */
  currentRoute: null,

  /**
   * ========================================================================
   * NAVIGATE - Navigeer naar een view
   * ========================================================================
   * 
   * Dit is de main functie die views laadt en rendert.
   * 
   * Flow:
   * 1. Check of route bestaat
   * 2. Toon loading state
   * 3. Haal HTML (uit cache of fetch)
   * 4. Insert HTML in main
   * 5. Discover & load components in die HTML
   * 6. Update currentRoute
   * 
   * @param {string} routeName - Naam van route (bijv: 'budget')
   * @returns {Promise<boolean>} - True als succesvol
   */
  async navigate(routeName) {
    // 1. Check of route bestaat
    const route = this.routes[routeName];
    
    if (!route) {
      console.error('❌ Route bestaat niet:', routeName);
      return false;
    }

    try {
      // 2. Toon loading state (simpele "Loading..." text)
      this.showLoading();

      // 3. Haal HTML op
      let html;
      
      if (this.cache.has(routeName)) {
        // Uit cache - instant!
        html = this.cache.get(routeName);
        console.log('✅ View uit cache:', routeName);
      } else {
        // Fetch van server
        console.log('📡 Fetching view:', routeName);
        
        const response = await fetch(route.path);
        
        if (!response.ok) {
          throw new Error(`View niet gevonden: ${route.path}`);
        }
        
        html = await response.text();
        
        // Sla op in cache voor volgende keer
        this.cache.set(routeName, html);
        console.log('✅ View geladen en cached:', routeName);
      }

      // 4. Insert HTML in DOM
      const contentArea = document.querySelector('main');
      contentArea.innerHTML = html;

      // 5. Discover & load Web Components in deze HTML
      // Dit triggert de registry om alle <custom-tags> te vinden en laden
      await ComponentRegistry.discoverAndLoad(contentArea);

      // 6. Update state
      this.currentRoute = routeName;
      this.hideLoading();

      console.log('✅ Navigatie compleet:', routeName);
      return true;

    } catch (error) {
      // Error afhandeling
      console.error('❌ Error bij navigatie:', error);
      this.showError(error);
      return false;
    }
  },

  /**
   * ========================================================================
   * LOADING STATES
   * ========================================================================
   */

  /**
   * Toon loading state
   * Simpele "Loading..." text in content area
   */
  showLoading() {
    const contentArea = document.querySelector('main');
    contentArea.innerHTML = '<p class="u-text-center">Loading...</p>';
  },

  /**
   * Hide loading state
   * Placeholder - kan later gebruikt worden voor fade-out animaties
   */
  hideLoading() {
    // Kan later gebruikt worden voor animations
  },

  /**
   * Toon error state
   * Als iets fout gaat bij navigatie (view niet gevonden, fetch error, etc)
   * 
   * @param {Error} error - De error die is opgetreden
   */
  showError(error) {
    const contentArea = document.querySelector('main');
    contentArea.innerHTML = `
      <div class="error-view">
        <h2>Oeps! Er ging iets mis</h2>
        <p class="u-text-muted">${error.message || 'Onbekende fout'}</p>
        <button class="btn btn--primary" onclick="location.reload()">
          Probeer opnieuw
        </button>
      </div>
    `;
  },

  /**
   * ========================================================================
   * HELPER METHODS
   * ========================================================================
   */

  /**
   * Get routes die in sidebar moeten
   * Gebruikt door sidebar.js om navigatie te renderen
   * 
   * @returns {Array} - Array van route objects
   */
  getSidebarRoutes() {
    return Object.values(this.routes)
      .filter(route => route.showInSidebar);
  },

  /**
   * Get current route object
   * @returns {Object|null} - Current route of null
   */
  getCurrentRoute() {
    return this.currentRoute ? this.routes[this.currentRoute] : null;
  },

  /**
   * ========================================================================
   * PERFORMANCE - Preloading
   * ========================================================================
   * 
   * Preload een view in de achtergrond
   * Handig voor views die users vaak bezoeken
   * 
   * @param {string} routeName - Route om te preloaden
   * 
   * Use case:
   * - User is op budget view
   * - Preload transactions in achtergrond
   * - Als user naar transactions gaat → instant!
   */
  async preload(routeName) {
    const route = this.routes[routeName];
    
    // Skip als al gecached
    if (this.cache.has(routeName)) {
      return;
    }
    
    // Skip als route niet bestaat
    if (!route) {
      console.warn('⚠️ Kan route niet preloaden, bestaat niet:', routeName);
      return;
    }

    try {
      console.log('📡 Preloading:', routeName);
      const response = await fetch(route.path);
      const html = await response.text();
      this.cache.set(routeName, html);
      console.log('✅ Preloaded:', routeName);
    } catch (error) {
      console.warn('⚠️ Preload failed:', routeName);
    }
  },

  /**
   * Clear cache
   * Handig tijdens development om changes in HTML te zien
   * 
   * In production zou je dit nooit aanroepen,
   * maar tijdens dev kun je in console typen: Router.clearCache()
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Router cache cleared');
  }
};