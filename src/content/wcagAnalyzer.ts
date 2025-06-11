/**
 * WCAG and ARIA Analyzer Module
 * Comprehensive accessibility analysis and reporting
 * 
 * WCAG 2.2-AA Compliance:
 * - SC 1.3.1: Info and Relationships - Semantic structure analysis
 * - SC 2.4.6: Headings and Labels - Heading hierarchy check
 * - SC 4.1.2: Name, Role, Value - ARIA analysis
 * 
 * MIT License
 */

interface WCAGResult {
  criterion: string;
  level: 'A' | 'AA' | 'AAA';
  status: 'pass' | 'fail' | 'warning';
  description: string;
  suggestion: string;
}

interface ARIAResult {
  attribute: string;
  status: 'pass' | 'fail' | 'warning' | 'missing';
  current: string;
  expected: string;
  suggestion: string;
}

interface AccessibilityAnalysis {
  wcagResults: WCAGResult[];
  ariaResults: ARIAResult[];
  colorContrast: {
    ratio: number;
    status: 'pass' | 'fail';
    requirement: number;
  } | null;
  keyboardAccessible: boolean;
  focusManagement: {
    focusable: boolean;
    tabIndex: number | null;
    focusVisible: boolean;
  };
  semanticStructure: {
    hasValidRole: boolean;
    hasAccessibleName: boolean;
    hasDescription: boolean;
  };
}

export class WCAGAnalyzer {
  /**
   * Perform comprehensive accessibility analysis on element
   */
  public static analyzeElement(element: HTMLElement): AccessibilityAnalysis {
    return {
      wcagResults: this.analyzeWCAG(element),
      ariaResults: this.analyzeARIA(element),
      colorContrast: this.analyzeColorContrast(element),
      keyboardAccessible: this.analyzeKeyboardAccessibility(element),
      focusManagement: this.analyzeFocusManagement(element),
      semanticStructure: this.analyzeSemanticStructure(element)
    };
  }

  /**
   * Analyze WCAG 2.2 criteria
   */
  private static analyzeWCAG(element: HTMLElement): WCAGResult[] {
    const results: WCAGResult[] = [];

    // SC 1.1.1: Non-text Content
    if (element.tagName === 'IMG') {
      const alt = element.getAttribute('alt');
      results.push({
        criterion: '1.1.1 Non-text Content',
        level: 'A',
        status: alt !== null ? 'pass' : 'fail',
        description: 'Images must have alternative text',
        suggestion: alt ? 'Alt text is present' : 'Add meaningful alt attribute to describe the image'
      });
    }

    // SC 1.3.1: Info and Relationships
    const hasValidStructure = this.checkStructuralIntegrity(element);
    results.push({
      criterion: '1.3.1 Info and Relationships',
      level: 'A',
      status: hasValidStructure ? 'pass' : 'warning',
      description: 'Information and relationships conveyed through presentation can be programmatically determined',
      suggestion: hasValidStructure ? 'Semantic structure is appropriate' : 'Consider using more semantic HTML elements'
    });

    // SC 1.4.3: Contrast (Minimum)
    const contrast = this.analyzeColorContrast(element);
    if (contrast) {
      results.push({
        criterion: '1.4.3 Contrast (Minimum)',
        level: 'AA',
        status: contrast.status,
        description: 'Text and background colors must have sufficient contrast',
        suggestion: contrast.status === 'pass' 
          ? `Contrast ratio ${contrast.ratio.toFixed(2)}:1 meets requirements`
          : `Contrast ratio ${contrast.ratio.toFixed(2)}:1 is insufficient. Minimum required: ${contrast.requirement}:1`
      });
    }

    // SC 2.1.1: Keyboard
    results.push({
      criterion: '2.1.1 Keyboard',
      level: 'A',
      status: this.analyzeKeyboardAccessibility(element) ? 'pass' : 'fail',
      description: 'All functionality available from keyboard',
      suggestion: this.analyzeKeyboardAccessibility(element) 
        ? 'Element is keyboard accessible'
        : 'Add tabindex or use focusable element for keyboard access'
    });

    // SC 2.4.3: Focus Order
    const focusManagement = this.analyzeFocusManagement(element);
    results.push({
      criterion: '2.4.3 Focus Order',
      level: 'A',
      status: focusManagement.focusable ? 'pass' : 'warning',
      description: 'Focusable components receive focus in order that preserves meaning',
      suggestion: focusManagement.focusable 
        ? 'Element participates in focus order'
        : 'Consider if this element should be focusable'
    });

    // SC 4.1.2: Name, Role, Value
    const semantic = this.analyzeSemanticStructure(element);
    results.push({
      criterion: '4.1.2 Name, Role, Value',
      level: 'A',
      status: semantic.hasValidRole && semantic.hasAccessibleName ? 'pass' : 'fail',
      description: 'Elements have accessible names and roles',
      suggestion: semantic.hasValidRole && semantic.hasAccessibleName
        ? 'Element has proper name and role'
        : 'Add aria-label, accessible name, or ensure proper semantic role'
    });

    return results;
  }

  /**
   * Analyze ARIA attributes and implementation
   */
  private static analyzeARIA(element: HTMLElement): ARIAResult[] {
    const results: ARIAResult[] = [];
    const _ariaAttributes = this.getARIAAttributes(element);

    // Check aria-label
    const ariaLabel = element.getAttribute('aria-label');
    results.push({
      attribute: 'aria-label',
      status: ariaLabel ? 'pass' : 'missing',
      current: ariaLabel || 'Not present',
      expected: 'Descriptive label',
      suggestion: ariaLabel ? 'Aria-label is present' : 'Consider adding aria-label for better accessibility'
    });

    // Check aria-describedby
    const ariaDescribedby = element.getAttribute('aria-describedby');
    if (ariaDescribedby) {
      const describedElement = document.getElementById(ariaDescribedby);
      results.push({
        attribute: 'aria-describedby',
        status: describedElement ? 'pass' : 'fail',
        current: ariaDescribedby,
        expected: 'Valid element ID',
        suggestion: describedElement ? 'References valid element' : 'Referenced element does not exist'
      });
    }

    // Check role attribute
    const role = element.getAttribute('role');
    if (role) {
      const validRoles = ['button', 'link', 'heading', 'banner', 'navigation', 'main', 'contentinfo', 'complementary', 'search', 'form', 'region', 'article', 'section', 'aside', 'header', 'footer'];
      results.push({
        attribute: 'role',
        status: validRoles.includes(role) ? 'pass' : 'warning',
        current: role,
        expected: 'Valid ARIA role',
        suggestion: validRoles.includes(role) ? 'Valid ARIA role' : 'Check if role is appropriate and valid'
      });
    }

    // Check aria-expanded for interactive elements
    if (this.isInteractiveElement(element)) {
      const ariaExpanded = element.getAttribute('aria-expanded');
      if (ariaExpanded !== null) {
        results.push({
          attribute: 'aria-expanded',
          status: ['true', 'false'].includes(ariaExpanded) ? 'pass' : 'fail',
          current: ariaExpanded,
          expected: 'true or false',
          suggestion: ['true', 'false'].includes(ariaExpanded) ? 'Valid boolean value' : 'Must be "true" or "false"'
        });
      }
    }

    return results;
  }

  /**
   * Analyze color contrast
   */
  private static analyzeColorContrast(element: HTMLElement): { ratio: number; status: 'pass' | 'fail'; requirement: number; } | null {
    try {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      if (!color || !backgroundColor || backgroundColor === 'rgba(0, 0, 0, 0)') {
        return null;
      }

      const ratio = this.calculateContrastRatio(color, backgroundColor);
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;
      
      // Determine requirement based on text size
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
      const requirement = isLargeText ? 3 : 4.5;

      return {
        ratio,
        status: ratio >= requirement ? 'pass' : 'fail',
        requirement
      };
    } catch {
      return null;
    }
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private static calculateContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    if (!rgb1 || !rgb2) return 1;

    const l1 = this.getRelativeLuminance(rgb1);
    const l2 = this.getRelativeLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Parse CSS color to RGB values
   */
  private static parseColor(color: string): { r: number; g: number; b: number; } | null {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

    return { r, g, b };
  }

  /**
   * Calculate relative luminance
   */
  private static getRelativeLuminance({ r, g, b }: { r: number; g: number; b: number; }): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Check keyboard accessibility
   */
  private static analyzeKeyboardAccessibility(element: HTMLElement): boolean {
    const focusableElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'DETAILS', 'SUMMARY'];
    const tabIndex = element.getAttribute('tabindex');
    
    return focusableElements.includes(element.tagName) || 
           (tabIndex !== null && parseInt(tabIndex) >= 0) ||
           element.hasAttribute('contenteditable');
  }

  /**
   * Analyze focus management
   */
  private static analyzeFocusManagement(element: HTMLElement): { focusable: boolean; tabIndex: number | null; focusVisible: boolean; } {
    const tabIndex = element.getAttribute('tabindex');
    const focusable = this.analyzeKeyboardAccessibility(element);
    
    return {
      focusable,
      tabIndex: tabIndex ? parseInt(tabIndex) : null,
      focusVisible: focusable && (tabIndex === null || parseInt(tabIndex) >= 0)
    };
  }

  /**
   * Analyze semantic structure
   */
  private static analyzeSemanticStructure(element: HTMLElement): { hasValidRole: boolean; hasAccessibleName: boolean; hasDescription: boolean; } {
    const role = element.getAttribute('role') || this.getImplicitRole(element);
    const hasAccessibleName = !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      element.getAttribute('alt') ||
      element.getAttribute('title')
    );
    const hasDescription = !!(
      element.getAttribute('aria-describedby') ||
      element.getAttribute('title')
    );

    return {
      hasValidRole: !!role,
      hasAccessibleName,
      hasDescription
    };
  }

  /**
   * Get implicit ARIA role for element
   */
  private static getImplicitRole(element: HTMLElement): string | null {
    const tagRoles: { [key: string]: string } = {
      'A': 'link',
      'BUTTON': 'button',
      'H1': 'heading',
      'H2': 'heading',
      'H3': 'heading',
      'H4': 'heading',
      'H5': 'heading',
      'H6': 'heading',
      'IMG': 'img',
      'INPUT': 'textbox',
      'NAV': 'navigation',
      'MAIN': 'main',
      'HEADER': 'banner',
      'FOOTER': 'contentinfo',
      'ASIDE': 'complementary',
      'SECTION': 'region',
      'ARTICLE': 'article'
    };

    return tagRoles[element.tagName] || null;
  }

  /**
   * Check structural integrity
   */
  private static checkStructuralIntegrity(element: HTMLElement): boolean {
    // Check for proper heading hierarchy
    if (element.tagName.match(/^H[1-6]$/)) {
      const level = parseInt(element.tagName[1]);
      const prevHeading = this.findPreviousHeading(element);
      if (prevHeading) {
        const prevLevel = parseInt(prevHeading.tagName[1]);
        return level <= prevLevel + 1;
      }
    }

    // Check for proper list structure
    if (element.tagName === 'LI') {
      const parent = element.parentElement;
      return parent?.tagName === 'UL' || parent?.tagName === 'OL';
    }

    return true;
  }

  /**
   * Find previous heading in document order
   */
  private static findPreviousHeading(element: HTMLElement): HTMLElement | null {
    const allHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];
    const currentIndex = allHeadings.indexOf(element);
    return currentIndex > 0 ? allHeadings[currentIndex - 1] : null;
  }

  /**
   * Get all ARIA attributes from element
   */
  private static getARIAAttributes(element: HTMLElement): { [key: string]: string } {
    const ariaAttrs: { [key: string]: string } = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (attr.name.startsWith('aria-')) {
        ariaAttrs[attr.name] = attr.value;
      }
    }
    return ariaAttrs;
  }

  /**
   * Check if element is interactive
   */
  private static isInteractiveElement(element: HTMLElement): boolean {
    const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'DETAILS'];
    const role = element.getAttribute('role');
    const interactiveRoles = ['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio'];
    
    return interactiveElements.includes(element.tagName) ||
           (role && interactiveRoles.includes(role)) ||
           element.hasAttribute('onclick') ||
           this.analyzeKeyboardAccessibility(element);
  }

  /**
   * Generate comprehensive accessibility report
   */
  public static generateReport(analysis: AccessibilityAnalysis): string {
    let report = '# 🔍 Kapsamlı Erişilebilirlik Analizi\n\n';

    // WCAG Results
    report += '## 📋 WCAG 2.2 Kriterleri\n\n';
    analysis.wcagResults.forEach(result => {
      const statusIcon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      report += `### ${statusIcon} ${result.criterion} (Seviye ${result.level})\n`;
      report += `**Durum:** ${result.status === 'pass' ? 'Başarılı' : result.status === 'fail' ? 'Başarısız' : 'Uyarı'}\n`;
      report += `**Açıklama:** ${result.description}\n`;
      report += `**Öneri:** ${result.suggestion}\n\n`;
    });

    // ARIA Results
    report += '## 🏷️ ARIA Analizi\n\n';
    analysis.ariaResults.forEach(result => {
      const statusIcon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : result.status === 'warning' ? '⚠️' : '➖';
      report += `### ${statusIcon} ${result.attribute}\n`;
      report += `**Mevcut:** ${result.current}\n`;
      report += `**Beklenen:** ${result.expected}\n`;
      report += `**Öneri:** ${result.suggestion}\n\n`;
    });

    // Color Contrast
    if (analysis.colorContrast) {
      report += '## 🎨 Renk Kontrastı\n\n';
      const statusIcon = analysis.colorContrast.status === 'pass' ? '✅' : '❌';
      report += `${statusIcon} **Kontrast Oranı:** ${analysis.colorContrast.ratio.toFixed(2)}:1\n`;
      report += `**Gerekli Minimum:** ${analysis.colorContrast.requirement}:1\n`;
      report += `**Durum:** ${analysis.colorContrast.status === 'pass' ? 'Uygun' : 'Yetersiz'}\n\n`;
    }

    // Keyboard Accessibility
    report += '## ⌨️ Klavye Erişilebilirliği\n\n';
    const keyboardIcon = analysis.keyboardAccessible ? '✅' : '❌';
    report += `${keyboardIcon} **Klavye Erişimi:** ${analysis.keyboardAccessible ? 'Mevcut' : 'Mevcut değil'}\n`;
    report += `**Odaklanabilir:** ${analysis.focusManagement.focusable ? 'Evet' : 'Hayır'}\n`;
    report += `**Tab Sırası:** ${analysis.focusManagement.tabIndex !== null ? analysis.focusManagement.tabIndex : 'Belirtilmemiş'}\n\n`;

    // Semantic Structure
    report += '## 🏗️ Semantik Yapı\n\n';
    const roleIcon = analysis.semanticStructure.hasValidRole ? '✅' : '❌';
    const nameIcon = analysis.semanticStructure.hasAccessibleName ? '✅' : '❌';
    const descIcon = analysis.semanticStructure.hasDescription ? '✅' : '➖';
    
    report += `${roleIcon} **Geçerli Rol:** ${analysis.semanticStructure.hasValidRole ? 'Var' : 'Yok'}\n`;
    report += `${nameIcon} **Erişilebilir İsim:** ${analysis.semanticStructure.hasAccessibleName ? 'Var' : 'Yok'}\n`;
    report += `${descIcon} **Açıklama:** ${analysis.semanticStructure.hasDescription ? 'Var' : 'Yok'}\n\n`;

    return report;
  }
}