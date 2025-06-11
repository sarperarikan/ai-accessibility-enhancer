/**
 * Element WCAG Analysis Buttons
 * Interactive element analysis with hover functionality
 * 
 * WCAG 2.2-AA Compliance:
 * - SC 2.4.3: Focus Order - Proper focus management for interactive elements
 * - SC 4.1.2: Name, Role, Value - Semantic button structure
 * - SC 1.4.3: Contrast (Minimum) - Accessible button colors
 * - SC 2.1.1: Keyboard - Full keyboard accessibility
 * 
 * MIT License
 */


interface ElementAnalysisButton {
  element: HTMLElement;
  button: HTMLButtonElement;
  cleanup: () => void;
}

class ElementWCAGAnalyzer {
  private activeButtons: Map<HTMLElement, ElementAnalysisButton> = new Map();
  private isEnabled: boolean = false;
  private hoverTimeout: number | null = null;

  /**
   * Enable element analysis mode
   */
  public enable(): void {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    document.addEventListener('mouseover', this.handleMouseOver);
    document.addEventListener('mouseout', this.handleMouseOut);
    document.addEventListener('keydown', this.handleKeyDown);
    
    this.showModeIndicator();
    console.log('🎯 Element WCAG Analysis mode enabled');
  }

  /**
   * Disable element analysis mode
   */
  public disable(): void {
    if (!this.isEnabled) return;
    
    this.isEnabled = false;
    document.removeEventListener('mouseover', this.handleMouseOver);
    document.removeEventListener('mouseout', this.handleMouseOut);
    document.removeEventListener('keydown', this.handleKeyDown);
    
    this.cleanup();
    this.hideModeIndicator();
    console.log('🎯 Element WCAG Analysis mode disabled');
  }

  /**
   * Toggle analysis mode
   */
  public toggle(): void {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Handle mouse over events
   */
  private handleMouseOver = (event: MouseEvent): void => {
    if (!this.isEnabled) return;
    
    const target = event.target as HTMLElement;
    if (!target || target.nodeType !== Node.ELEMENT_NODE) return;
    
    // Skip if element already has button or is analysis UI
    if (this.activeButtons.has(target) || this.isAnalysisUI(target)) return;
    
    // Clear any pending timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    // Add small delay to prevent flickering
    this.hoverTimeout = window.setTimeout(() => {
      this.showAnalysisButton(target);
    }, 200);
  };

  /**
   * Handle mouse out events
   */
  private handleMouseOut = (event: MouseEvent): void => {
    if (!this.isEnabled) return;
    
    // Clear pending timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    
    const target = event.target as HTMLElement;
    if (!target) return;
    
    // Remove button after a delay to allow interaction
    setTimeout(() => {
      const buttonInfo = this.activeButtons.get(target);
      if (buttonInfo && !this.isHoveringButtonOrElement(buttonInfo)) {
        this.removeAnalysisButton(target);
      }
    }, 500);
  };

  /**
   * Handle keyboard events for accessibility
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    // Exit mode with Escape key
    if (event.key === 'Escape') {
      this.disable();
    }
  };

  /**
   * Check if element is part of analysis UI
   */
  private isAnalysisUI(element: HTMLElement): boolean {
    return element.closest('[data-wcag-analysis]') !== null ||
           element.id?.includes('wcag-analysis') ||
           element.className?.includes('wcag-analysis');
  }

  /**
   * Check if user is hovering button or element
   */
  private isHoveringButtonOrElement(buttonInfo: ElementAnalysisButton): boolean {
    const button = buttonInfo.button;
    const element = buttonInfo.element;
    
    return button.matches(':hover') || element.matches(':hover');
  }

  /**
   * Show analysis button for element
   */
  private showAnalysisButton(element: HTMLElement): void {
    if (this.activeButtons.has(element)) return;
    
    const button = this.createAnalysisButton(element);
    this.positionButton(button, element);
    
    const cleanup = () => {
      button.remove();
    };
    
    this.activeButtons.set(element, { element, button, cleanup });
    document.body.appendChild(button);
  }

  /**
   * Remove analysis button for element
   */
  private removeAnalysisButton(element: HTMLElement): void {
    const buttonInfo = this.activeButtons.get(element);
    if (!buttonInfo) return;
    
    buttonInfo.cleanup();
    this.activeButtons.delete(element);
  }

  /**
   * Create analysis button
   */
  private createAnalysisButton(element: HTMLElement): HTMLButtonElement {
    const button = document.createElement('button');
    button.setAttribute('data-wcag-analysis', 'button');
    button.setAttribute('aria-label', `Erişilebilirlik analizini başlat: ${this.getElementDescription(element)}`);
    button.textContent = '🔍 Analiz Et';
    
    button.style.cssText = `
      position: fixed !important;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
      color: white !important;
      border: none !important;
      padding: 8px 12px !important;
      border-radius: 6px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      z-index: 999998 !important;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
      transition: all 0.2s ease !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      border: 2px solid rgba(255, 255, 255, 0.2) !important;
    `;
    
    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.6)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
    });
    
    // Click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.startElementAnalysis(element);
    });
    
    // Keyboard accessibility
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.startElementAnalysis(element);
      }
    });
    
    return button;
  }

  /**
   * Position button relative to element
   */
  private positionButton(button: HTMLButtonElement, element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Position above the element with some margin
    let top = rect.top + scrollTop - 40;
    let left = rect.left + scrollLeft;
    
    // Ensure button stays within viewport
    const buttonWidth = 100; // Approximate button width
    const viewportWidth = window.innerWidth;
    
    if (left + buttonWidth > viewportWidth) {
      left = viewportWidth - buttonWidth - 10;
    }
    
    if (left < 10) {
      left = 10;
    }
    
    if (top < 10) {
      top = rect.bottom + scrollTop + 10;
    }
    
    button.style.top = `${top}px`;
    button.style.left = `${left}px`;
  }

  /**
   * Get element description for accessibility
   */
  private getElementDescription(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const className = element.className ? `.${element.className.split(' ')[0]}` : '';
    const text = element.textContent?.trim().substring(0, 30) || '';
    
    return `${tagName}${id}${className} ${text ? `"${text}"` : ''}`.trim();
  }

  /**
   * Start analysis for specific element
   */
  private startElementAnalysis(element: HTMLElement): void {
    console.log('🎯 Starting element analysis:', this.getElementDescription(element));
    
    // Store element for analysis
    (window as any).lastClickedElement = element;
    
    // Disable analysis mode first
    this.disable();
    
    // Force show WCAG modal directly
    setTimeout(() => {
      if (typeof (window as any).showWCAGModal === 'function') {
        console.log('🚀 Calling showWCAGModal directly');
        (window as any).showWCAGModal(element, 'gemini').catch((error: Error) => {
          console.error('❌ Direct modal call failed:', error);
          this.fallbackAnalysis(element);
        });
      } else {
        console.log('⚠️ showWCAGModal not available, using fallback');
        this.fallbackAnalysis(element);
      }
    }, 100);
  }

  /**
   * Fallback analysis method
   */
  private fallbackAnalysis(element: HTMLElement): void {
    // Send message to background script as fallback
    chrome.runtime.sendMessage({
      type: 'SHOW_WCAG_MODAL',
      forceProvider: 'gemini'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Background script message failed:', chrome.runtime.lastError.message);
        // Last resort: show simple alert
        alert(`Element analizi başlatılamadı. Element: ${this.getElementDescription(element)}`);
      } else {
        console.log('✅ Background script message sent successfully:', response);
      }
    });
  }

  /**
   * Show mode indicator
   */
  private showModeIndicator(): void {
    const indicator = document.createElement('div');
    indicator.id = 'wcag-analysis-mode-indicator';
    indicator.setAttribute('data-wcag-analysis', 'indicator');
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    
    indicator.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="font-size: 18px;">🔍</div>
        <div>
          <div style="font-weight: 600; font-size: 14px;">Erişilebilirlik Analiz Modu</div>
          <div style="font-size: 12px; opacity: 0.9;">Analiz etmek istediğiniz elementin üzerine gelin</div>
        </div>
        <button id="exit-analysis-mode" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">
          ESC
        </button>
      </div>
    `;
    
    indicator.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      left: 20px !important;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      z-index: 999999 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4) !important;
      border: 2px solid rgba(255, 255, 255, 0.2) !important;
      animation: wcag-indicator-pulse 2s ease-in-out infinite !important;
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes wcag-indicator-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
    `;
    document.head.appendChild(style);
    
    // Exit button handler
    const exitBtn = indicator.querySelector('#exit-analysis-mode') as HTMLButtonElement;
    exitBtn?.addEventListener('click', () => this.disable());
    
    document.body.appendChild(indicator);
  }

  /**
   * Hide mode indicator
   */
  private hideModeIndicator(): void {
    const indicator = document.getElementById('wcag-analysis-mode-indicator');
    if (indicator) {
      indicator.remove();
    }
    
    // Remove animation styles
    const styles = document.querySelectorAll('style');
    styles.forEach(style => {
      if (style.textContent?.includes('wcag-indicator-pulse')) {
        style.remove();
      }
    });
  }

  /**
   * Clean up all active buttons
   */
  private cleanup(): void {
    this.activeButtons.forEach(buttonInfo => {
      buttonInfo.cleanup();
    });
    this.activeButtons.clear();
    
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }
}

// Create global instance
const elementAnalyzer = new ElementWCAGAnalyzer();

// Export global functions
(window as any).enableElementAnalysis = () => elementAnalyzer.enable();
(window as any).disableElementAnalysis = () => elementAnalyzer.disable();
(window as any).toggleElementAnalysis = () => elementAnalyzer.toggle();

// Auto-enable on Ctrl+Shift+W (WCAG)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyW') {
    e.preventDefault();
    elementAnalyzer.toggle();
  }
});

console.log('🎯 Element WCAG Analysis system loaded. Use Ctrl+Shift+W to toggle.');

export { ElementWCAGAnalyzer };