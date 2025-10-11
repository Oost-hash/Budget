/**
 * ============================================================================
 * LAYOUTPRIMITIVE.JS - Base Class voor Layout Primitives
 * ============================================================================
 * 
 * Base class die alle layout primitives delen.
 * Handelt common behavior: height, width, overflow, flex.
 * 
 * SUBCLASSES:
 * - View
 * - Container
 * - Stack (future)
 * - Cluster (future)
 * 
 * SHARED ATTRIBUTES:
 * - auto-height     → height: auto (groeit met content)
 * - height="500px"  → custom height
 * - (default)       → height: 100% + flex: 1 (vult beschikbare ruimte)
 * 
 * ============================================================================
 */

export class LayoutPrimitive extends HTMLElement {
    /**
     * Called when element is added to DOM
     * Calls applyBaseStyles() then render()
     */
    connectedCallback() {
        this.applyBaseStyles();
        this.render();
    }

    /**
     * ========================================================================
     * BASE STYLES - Shared door alle layout primitives
     * ========================================================================
     */

    /**
     * Apply base styles die alle primitives nodig hebben
     * Height, width, flex behavior
     */
    applyBaseStyles() {
        // Width: altijd 100%
        this.style.width = '100%';

        // Height logic
        if (this.hasAttribute('auto-height')) {
            // Explicitly auto: groeit met content
            this.style.height = 'auto';
            // Geen flex
        } else if (this.hasAttribute('height')) {
            // Custom height
            this.style.height = this.getAttribute('height');
        } else {
            // Default: vul beschikbare ruimte
            // In flex parent: alleen flex: 1 (GEEN height: 100%)
            // In block parent: height: 100%

            // Check of parent flex is
            const parent = this.parentElement;
            const parentDisplay = parent ? getComputedStyle(parent).display : 'block';

            if (parentDisplay.includes('flex')) {
                // Parent is flex: gebruik alleen flex: 1
                this.style.flex = '1';
                this.style.minHeight = '0';  // Important: zorgt dat flex shrinking werkt
            } else {
                // Parent is block/grid: gebruik height: 100%
                this.style.height = '100%';
            }
        }

        // Default overflow (subclasses kunnen overriden)
        if (!this.style.overflow) {
            this.style.overflow = 'auto';
        }
    }

    /**
     * ========================================================================
     * RENDER - Subclasses MOETEN dit implementeren
     * ========================================================================
     */

    /**
     * Render method - moet door subclass geïmplementeerd worden
     * Hier komt primitive-specifieke styling (display, grid, flex, gap, etc)
     */
    render() {
        throw new Error(`${this.constructor.name} must implement render() method`);
    }

    /**
     * ========================================================================
     * SHARED API - Beschikbaar voor alle primitives
     * ========================================================================
     */

    /**
     * Update height dynamically
     * @param {string} height - Height value (e.g. '500px', '100%', 'auto')
     */
    setHeight(height) {
        this.style.height = height;

        // Als custom height, remove flex
        if (height !== '100%') {
            this.style.flex = '';
        }
    }

    /**
     * Update padding dynamically
     * @param {string} padding - Padding value (e.g. '48px', '24px 48px')
     */
    setPadding(padding) {
        this.style.padding = padding;
    }

    /**
     * Update gap dynamically (voor grid/flex primitives)
     * @param {string} gap - Gap value (e.g. '24px')
     */
    setGap(gap) {
        this.style.gap = gap;
    }
}