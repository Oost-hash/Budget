/**
 * ============================================================================
 * CONTAINER.JS - Grid Layout Primitive
 * ============================================================================
 * 
 * Extends: LayoutPrimitive
 * 
 * Een flexible grid container voor layouts.
 * 
 * ATTRIBUTES:
 * - col="3"              → 3 equal columns (1fr 1fr 1fr)
 * - col="3/20,30,50"     → 3 columns met custom sizes (20fr 30fr 50fr)
 * - row="2"              → 2 auto rows
 * - row="2/100px,auto"   → 2 rows met custom sizes
 * - gap="16px"           → Gap tussen items (default: var(--space-md))
 * - test="true"          → Debug mode: random kleuren per cell
 * - auto-height          → (from base) Groeit met content
 * - height="500px"       → (from base) Custom height
 * 
 * ============================================================================
 */

import { LayoutPrimitive } from './LayoutPrimitive.js';

export default class Container extends LayoutPrimitive {
  /**
   * Render container-specifieke styling
   */
  render() {
    // Grid setup
    this.style.display = 'grid';
    
    // Parse columns
    const col = this.getAttribute('col');
    if (col) {
      this.style.gridTemplateColumns = this.parseGridValue(col);
    }
    
    // Parse rows
    const row = this.getAttribute('row');
    if (row) {
      // Met auto-height: rows moeten auto zijn, niet fr
      if (this.hasAttribute('auto-height')) {
        const count = row.includes('/') ? row.split('/')[0] : row;
        this.style.gridTemplateRows = `repeat(${count}, auto)`;
      } else {
        this.style.gridTemplateRows = this.parseGridValue(row);
      }
    }
    
    // Gap
    this.style.gap = this.getAttribute('gap') || 'var(--space-md)';
    
    // Test mode
    if (this.getAttribute('test') === 'true') {
      this.applyTestColors();
    }
  }
  
  /**
   * ========================================================================
   * CONTAINER-SPECIFIC METHODS
   * ========================================================================
   */
  
  /**
   * Parse grid value (col or row)
   * "3"           → "repeat(3, 1fr)"
   * "3/20,30,50"  → "20fr 30fr 50fr"
   * "2/100px,1fr" → "100px 1fr"
   */
  parseGridValue(value) {
    if (!value) return null;
    
    if (value.includes('/')) {
      const [count, sizes] = value.split('/');
      const sizeArray = sizes.split(',').map(s => s.trim());
      
      const cssValues = sizeArray.map(size => {
        // Has unit already? (px, fr, %, etc)
        if (/\d(px|fr|%|em|rem|vh|vw)/.test(size)) {
          return size;
        }
        // No unit = assume FR
        return size + 'fr';
      });
      
      return cssValues.join(' ');
      
    } else {
      // No custom sizes = equal distribution
      return `repeat(${value}, 1fr)`;
    }
  }
  
  /**
   * Apply test colors to children
   */
  applyTestColors() {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#10b981',
      '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'
    ];
    
    Array.from(this.children).forEach((child, i) => {
      child.style.background = colors[i % colors.length];
      
      // Only set minHeight if auto-height
      if (this.hasAttribute('auto-height')) {
        child.style.minHeight = '100px';
      }
      
      child.style.display = 'flex';
      child.style.alignItems = 'center';
      child.style.justifyContent = 'center';
      child.style.color = 'white';
      child.style.fontWeight = 'bold';
      child.style.borderRadius = 'var(--radius-md)';
      
      if (!child.textContent) {
        child.textContent = `Cell ${i + 1}`;
      }
    });
  }
  
  /**
   * ========================================================================
   * PUBLIC API - Container-specific
   * ========================================================================
   */
  
  /**
   * Update column sizes dynamically
   * @param {Array} sizes - Array of sizes [20, 60, 20]
   */
  setColumnSizes(sizes) {
    const cssValues = sizes.map(s => s + 'fr').join(' ');
    this.style.gridTemplateColumns = cssValues;
  }
  
  /**
   * Update row sizes dynamically
   * @param {Array} sizes - Array of sizes ['100px', 'auto', '50px']
   */
  setRowSizes(sizes) {
    this.style.gridTemplateRows = sizes.join(' ');
  }
}