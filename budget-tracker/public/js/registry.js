/**
 * ============================================================================
 * REGISTRY.JS - Web Component Auto-Loader
 * ============================================================================
 * 
 * VERANTWOORDELIJKHEID:
 * - Detecteert custom elements in HTML (<app-container>, <view>, etc)
 * - Laadt de juiste .js file voor dat component
 * - Registreert het component bij de browser
 * - Cached alles (laad 1x, hergebruik forever)
 * 
 * CONVENTION:
 * - Tag met dash → app-container, budget-card
 * - Tag zonder dash → moet in singleWordElements lijst (bijv: view)
 * - File naam = PascalCase versie van tag (app-container → Container.js)
 * 
 * GEBRUIKT DOOR:
 * - router.js → na het laden van een view
 * - app.js → start observer voor dynamic content
 * 
 * EXPORTS:
 * - ComponentRegistry.discoverAndLoad() → Scan & load components
 * - ComponentRegistry.observe() → Watch for new components
 * - ComponentRegistry.load() → Load single component
 * 
 * ============================================================================
 */

export class ComponentRegistry {
  /**
   * Cache van geladen components
   * @type {Map<string, Function>}
   * @example { 'app-container': ContainerClass, 'view': ViewClass }
   */
  static cache = new Map();
  
  /**
   * Components die momenteel aan het laden zijn
   * Voorkomt duplicate loads als meerdere tags tegelijk renderen
   * @type {Map<string, Promise<boolean>>}
   */
  static loading = new Map();
  
  /**
   * ========================================================================
   * PATH RESOLVER - Convention over Configuration
   * ========================================================================
   */
  
  /**
   * Resolve component path based on tag name
   * 
   * Convention:
   * - view → ../components/layout/View.js
   * - app-container → ../components/layout/Container.js
   * - budget-card → ../components/ui/BudgetCard.js
   * 
   * @param {string} tagName - De tag naam (lowercase), bijv: 'app-container'
   * @returns {string} Path naar component file
   * 
   * @example
   * resolvePath('view')           // → '../components/layout/View.js'
   * resolvePath('app-container')  // → '../components/layout/Container.js'
   * resolvePath('budget-card')    // → '../components/ui/BudgetCard.js'
   */
  static resolvePath(tagName) {
    const parts = tagName.split('-');
    
    // app-* → layout primitives
    if (parts[0] === 'app') {
      // app-container → Container
      // app-stack → Stack
      const name = parts.slice(1)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join('');
      return `../components/layout/${name}.js`;
    }
    
    // everything else → ui components
    // budget-card → BudgetCard
    // transaction-list → TransactionList
    const name = tagName
      .split('-')
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join('');
    return `../components/ui/${name}.js`;
  }
  
  /**
   * ========================================================================
   * LOAD - Laad een enkel component
   * ========================================================================
   */
  
  /**
   * Load a single component on-demand
   * 
   * Flow:
   * 1. Check: is het al gedefinieerd? → skip
   * 2. Check: zijn we het al aan het laden? → wacht erop
   * 3. Start laden:
   *    - Resolve path
   *    - Import file
   *    - Registreer bij browser (customElements.define)
   *    - Cache voor volgende keer
   * 
   * @param {string} tagName - De tag naam, bijv: 'app-container'
   * @returns {Promise<boolean>} True als succesvol geladen
   * 
   * @example
   * await ComponentRegistry.load('app-container');
   * await ComponentRegistry.load('view');
   */
  static async load(tagName) {
    // Al gedefinieerd bij browser? Dan hoeven we niks te doen
    if (customElements.get(tagName)) {
      return true;
    }
    
    // Al aan het laden? Wacht op die promise
    if (this.loading.has(tagName)) {
      return await this.loading.get(tagName);
    }
    
    // Start loading process
    const loadPromise = (async () => {
      
      try {
        // 1. Bepaal waar de file staat
        const path = this.resolvePath(tagName);
        
        // 2. Import de file (dynamic import = lazy loading!)
        const module = await import(path);
        const ComponentClass = module.default;
        
        // 3. Registreer bij browser
        customElements.define(tagName, ComponentClass);
        
        // 4. Cache voor later
        this.cache.set(tagName, ComponentClass);
        
        return true;
        
      } catch (err) {
        // File bestaat niet? Typo in HTML? Return false
        return false;
      } finally {
        // Cleanup loading state
        this.loading.delete(tagName);
      }
    })();
    
    // Sla loading promise op zodat andere calls kunnen wachten
    this.loading.set(tagName, loadPromise);
    return await loadPromise;
  }
  
  /**
   * ========================================================================
   * DISCOVER AND LOAD - Scan DOM en laad alle components
   * ========================================================================
   */
  
  /**
   * Discover and load all custom elements in DOM
   * 
   * Dit wordt aangeroepen NA het laden van een view.
   * Scant de DOM voor custom elements en laadt ze parallel.
   * Geeft batch report: successes en failures samen.
   * 
   * @param {HTMLElement} [root=document.body] - Root element om te scannen
   * @returns {Promise<void>}
   * 
   * @example
   * // In router, na view load:
   * await ComponentRegistry.discoverAndLoad(contentArea);
   * 
   * // Scan hele document:
   * await ComponentRegistry.discoverAndLoad();
   */
  static async discoverAndLoad(root = document.body) {
    const customTags = new Set();
    
    // List of our single-word custom elements (geen dash)
    const singleWordElements = ['view'];
    
    // Scan alle elements in root
    root.querySelectorAll('*').forEach(el => {
      const tagName = el.tagName.toLowerCase();
      
      // Custom element? (heeft '-' in naam OF is in whitelist)
      // Nog niet gedefinieerd?
      if ((tagName.includes('-') || singleWordElements.includes(tagName)) 
          && !customElements.get(tagName)) {
        customTags.add(tagName);
      }
    });
    
    // Load alle gevonden components parallel
    if (customTags.size > 0) {
      console.log(`🔍 Discovered ${customTags.size} components:`, Array.from(customTags));
      
      // Load all components
      const results = await Promise.all(
        Array.from(customTags).map(async tag => {
          const success = await this.load(tag);
          return { tag, success };
        })
      );
      
      // Batch report: successes
      const successes = results.filter(r => r.success).map(r => r.tag);
      if (successes.length > 0) {
        console.log(`✅ Loaded with success:`, successes);
      }
      
      // Batch report: failures
      const failures = results.filter(r => !r.success).map(r => r.tag);
      if (failures.length > 0) {
        console.warn(`⚠️ Failed to load:`, failures);
      }
    }
  }
  
  /**
   * ========================================================================
   * OBSERVE - Watch voor dynamisch toegevoegde elements
   * ========================================================================
   */
  
  /**
   * Watch for dynamically added custom elements
   * 
   * Gebruikt MutationObserver om te kijken of er nieuwe elements
   * aan de DOM worden toegevoegd (bijv via JavaScript).
   * 
   * @param {HTMLElement} [root=document.body] - Root element om te observeren
   * @returns {MutationObserver} De observer (kan later gestopt worden)
   * 
   * @example
   * // Start watching:
   * const observer = ComponentRegistry.observe();
   * 
   * // Later stoppen:
   * observer.disconnect();
   * 
   * @example
   * // Watch only main content area:
   * ComponentRegistry.observe(document.querySelector('main'));
   */
  static observe(root = document.body) {
    // List of our single-word custom elements
    const singleWordElements = ['view'];
    
    const observer = new MutationObserver(async (mutations) => {
      const newTags = new Set();
      
      // Loop door alle mutations (DOM changes)
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          // Is het een HTML element?
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            
            // Custom element dat nog niet gedefinieerd is?
            if ((tagName.includes('-') || singleWordElements.includes(tagName))
                && !customElements.get(tagName)) {
              newTags.add(tagName);
            }
            
            // Check ook children van nieuwe node
            node.querySelectorAll?.('*').forEach(child => {
              const childTag = child.tagName.toLowerCase();
              if ((childTag.includes('-') || singleWordElements.includes(childTag))
                  && !customElements.get(childTag)) {
                newTags.add(childTag);
              }
            });
          }
        }
      }
      
      // Load nieuwe components
      if (newTags.size > 0) {
        await Promise.all(
          Array.from(newTags).map(tag => this.load(tag))
        );
      }
    });
    
    // Start observing
    observer.observe(root, {
      childList: true,  // Watch voor added/removed nodes
      subtree: true     // Watch ook in nested elements
    });
    
    console.log('👀 Component observer started');
    return observer;
  }
}