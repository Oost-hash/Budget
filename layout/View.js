/**
 * ============================================================================
 * VIEW.JS - View Container Primitive
 * ============================================================================
 * 
 * Extends: LayoutPrimitive
 * 
 * Wrapper voor views met standaard padding.
 * Geen scroll op view-level - containers bepalen eigen scroll behavior.
 * 
 * ATTRIBUTES:
 * - no-padding       → Geen padding (full-bleed)
 * - padding="24px"   → Custom padding
 * - auto-height      → (from base) Groeit met content
 * - height="500px"   → (from base) Custom height
 * 
 * ============================================================================
 */

import { LayoutPrimitive } from './LayoutPrimitive.js';

export default class View extends LayoutPrimitive {
  render() {
    // Flex layout
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
    this.style.overflow = 'hidden';

    // Padding logic
    let padding;
    if (this.hasAttribute('no-padding')) {
      padding = '0';
    } else if (this.hasAttribute('padding')) {
      padding = this.getAttribute('padding');
    } else {
      padding = 'var(--space-xl)';
    }

    this.style.padding = padding;

    // DEBUG
    console.log('🎨 View render:', {
      padding: this.style.padding,
      computedPadding: getComputedStyle(this).padding,
      hasNoPadding: this.hasAttribute('no-padding'),
      customPadding: this.getAttribute('padding')
    });
  }
}