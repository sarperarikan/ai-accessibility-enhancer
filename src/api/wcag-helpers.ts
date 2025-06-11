/**
 * WCAG 2.2-AA Analiz Yardımcıları
 * 20 yıllık deneyim ışığında gelişmiş erişilebilirlik analizi
 */

// Gelişmiş tip tanımlamaları
export interface ElementStructure {
  tagName: string;
  id?: string;
  className?: string;
  role?: string;
  ariaAttributes: Record<string, string>;
  textContent?: string;
  children: string[];
  hasVisibleLabel: boolean;
  isInteractive: boolean;
  hasKeyboardFocus: boolean;
  // WCAG 2.2-AA için eklenen özellikler
  tabIndex: number;
  computedRole: string;
  hasVisibleText: boolean;
  parentContext: string;
  hasForm: boolean;
  inputType?: string;
  hasRequiredAttribute: boolean;
}

export interface SemanticAnalysis {
  semanticRole: string;
  hasValidLabel: boolean;
  labelType:
    | 'text'
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'none';
  hasDescription: boolean;
  keyboardAccessible: boolean;
  interactivePattern: string;
  potentialIssues: string[];
  // WCAG 2.2-AA için gelişmiş analiz
  wcagViolations: WCAGViolation[];
  contrastIssues: ContrastIssue[];
  keyboardNavigation: KeyboardNavigation;
  screenReaderSupport: ScreenReaderSupport;
}

// WCAG ihlalleri için detaylı tip
export interface WCAGViolation {
  criterion: string; // örn: "1.4.3"
  level: 'A' | 'AA' | 'AAA';
  title: string;
  description: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  technique?: string; // ARIA tekniği
}

// Kontrast analizi
export interface ContrastIssue {
  type: 'text' | 'ui-component' | 'graphic';
  currentRatio?: number;
  requiredRatio: number;
  recommendation: string;
}

// Klavye navigasyon analizi
export interface KeyboardNavigation {
  focusable: boolean;
  trapRisk: boolean;
  logicalOrder: boolean;
  visibleFocus: boolean;
  shortcuts: string[];
}

// Ekran okuyucu desteği
export interface ScreenReaderSupport {
  hasAccessibleName: boolean;
  hasAccessibleDescription: boolean;
  roleAppropriate: boolean;
  statesCommunicated: boolean;
  landmarkStructure: boolean;
}

// Yardımcı fonksiyonlar
const getDefaultRole = (tagName: string): string => {
  const roleMap: Record<string, string> = {
    a: 'link',
    button: 'button',
    input: 'textbox',
    select: 'combobox',
    textarea: 'textbox',
    img: 'img',
    nav: 'navigation',
    header: 'banner',
    footer: 'contentinfo',
    main: 'main',
    aside: 'complementary',
    article: 'article',
    section: 'region',
  };

  return roleMap[tagName] || '';
};

const getInteractionPattern = (element: HTMLElement): string => {
  const patterns: Record<string, string> = {
    button: 'click',
    a: 'click',
    input: 'input',
    select: 'select',
    textarea: 'input',
    checkbox: 'toggle',
    radio: 'select',
    menuitem: 'click',
    tab: 'select',
  };

  const role = element.getAttribute('role');
  const tagName = element.tagName.toLowerCase();

  return patterns[role || ''] || patterns[tagName] || 'none';
};

// Ana analiz fonksiyonları
/**
 * WCAG 2.2-AA uyumlu gelişmiş element yapı analizi
 * SC 4.1.2 Name, Role, Value kriterini destekler
 */
export const analyzeElementStructure = (
  element: HTMLElement
): ElementStructure => {
  const ariaAttributes: Record<string, string> = {};
  Array.from(element.attributes)
    .filter(attr => attr.name.startsWith('aria-'))
    .forEach(attr => {
      ariaAttributes[attr.name] = attr.value;
    });

  const interactiveElements = ['a', 'button', 'input', 'select', 'textarea'];
  const interactiveRoles = [
    'button',
    'link',
    'menuitem',
    'tab',
    'checkbox',
    'radio',
  ];

  const isInteractive = Boolean(
    interactiveElements.includes(element.tagName.toLowerCase()) ||
      (element.getAttribute('role') &&
        interactiveRoles.includes(element.getAttribute('role') || ''))
  );

  // WCAG 2.2-AA için gelişmiş analiz
  const computedRole =
    element.getAttribute('role') ||
    getDefaultRole(element.tagName.toLowerCase());
  const hasVisibleText = Boolean(element.textContent?.trim());
  const parentElement = element.parentElement;
  const parentContext = parentElement
    ? `${parentElement.tagName.toLowerCase()}${parentElement.className ? '.' + parentElement.className : ''}`
    : 'document';
  const hasForm = Boolean(element.closest('form'));
  const inputType =
    element.tagName.toLowerCase() === 'input'
      ? (element as HTMLInputElement).type
      : undefined;
  const hasRequiredAttribute =
    element.hasAttribute('required') ||
    element.getAttribute('aria-required') === 'true';

  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id || undefined,
    className: element.className || undefined,
    role: element.getAttribute('role') || undefined,
    ariaAttributes,
    textContent: element.textContent?.trim() || undefined,
    children: Array.from(element.children).map(child =>
      child.tagName.toLowerCase()
    ),
    hasVisibleLabel: Boolean(
      element.textContent?.trim() || element.getAttribute('aria-label')
    ),
    isInteractive,
    hasKeyboardFocus: Boolean(element.tabIndex >= 0),
    // WCAG 2.2-AA için yeni özellikler
    tabIndex: element.tabIndex,
    computedRole,
    hasVisibleText,
    parentContext,
    hasForm,
    inputType,
    hasRequiredAttribute,
  };
};

/**
 * WCAG 2.2-AA uyumlu kapsamlı semantik analiz
 * Multiple Success Criteria destekler: 1.3.1, 2.1.1, 4.1.2, 4.1.3
 */
export const analyzeSemanticStructure = (
  element: HTMLElement
): SemanticAnalysis => {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  const semanticRole = role || getDefaultRole(tagName);

  const hasText = Boolean(element.textContent?.trim());
  const hasAriaLabel = Boolean(element.getAttribute('aria-label'));
  const hasAriaLabelledby = Boolean(element.getAttribute('aria-labelledby'));
  const hasAriaDescribedby = Boolean(element.getAttribute('aria-describedby'));

  let labelType:
    | 'text'
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'none' = 'none';
  if (hasText) labelType = 'text';
  else if (hasAriaLabel) labelType = 'aria-label';
  else if (hasAriaLabelledby) labelType = 'aria-labelledby';
  else if (hasAriaDescribedby) labelType = 'aria-describedby';

  const issues: string[] = [];

  if (!semanticRole) {
    issues.push('Belirsiz semantik rol');
  }

  if (
    element.tabIndex >= 0 &&
    !hasText &&
    !hasAriaLabel &&
    !hasAriaLabelledby
  ) {
    issues.push('Odaklanabilir element etiketsiz');
  }

  // WCAG 2.2-AA için gelişmiş analiz
  const wcagViolations = analyzeWCAGViolations(element);
  const contrastIssues = analyzeContrastIssues(element);
  const keyboardNavigation = analyzeKeyboardNavigation(element);
  const screenReaderSupport = analyzeScreenReaderSupport(element);

  return {
    semanticRole,
    hasValidLabel: hasText || hasAriaLabel || hasAriaLabelledby,
    labelType,
    hasDescription: Boolean(
      element.getAttribute('aria-description') || hasAriaDescribedby
    ),
    keyboardAccessible: element.tabIndex >= 0,
    interactivePattern: getInteractionPattern(element),
    potentialIssues: issues,
    // WCAG 2.2-AA için yeni analizler
    wcagViolations,
    contrastIssues,
    keyboardNavigation,
    screenReaderSupport,
  };
};

/**
 * WCAG 2.2-AA ihlallerini analiz eder
 * Her ihlal için spesifik Success Criteria referansı sağlar
 */
const analyzeWCAGViolations = (element: HTMLElement): WCAGViolation[] => {
  const violations: WCAGViolation[] = [];
  const tagName = element.tagName.toLowerCase();
  const _role = element.getAttribute('role');

  // SC 1.1.1 Non-text Content
  if (tagName === 'img' && !element.getAttribute('alt')) {
    violations.push({
      criterion: '1.1.1',
      level: 'A',
      title: 'Non-text Content',
      description: 'Resim elementi alt özniteliği eksik',
      impact: 'serious',
      technique: 'H37',
    });
  }

  // SC 4.1.2 Name, Role, Value
  if (
    element.tabIndex >= 0 &&
    !element.getAttribute('aria-label') &&
    !element.textContent?.trim()
  ) {
    violations.push({
      criterion: '4.1.2',
      level: 'A',
      title: 'Name, Role, Value',
      description: 'Odaklanabilir element için erişilebilir ad eksik',
      impact: 'critical',
      technique: 'ARIA14',
    });
  }

  // SC 2.1.1 Keyboard
  if (['button', 'a', 'input'].includes(tagName) && element.tabIndex < 0) {
    violations.push({
      criterion: '2.1.1',
      level: 'A',
      title: 'Keyboard',
      description: 'Etkileşimli element klavye ile erişilebilir değil',
      impact: 'serious',
      technique: 'G202',
    });
  }

  return violations;
};

/**
 * Renk kontrastı sorunlarını analiz eder (SC 1.4.3, 1.4.11)
 */
const analyzeContrastIssues = (element: HTMLElement): ContrastIssue[] => {
  const issues: ContrastIssue[] = [];

  // Temel kontrast analizi (gerçek hesaplama için CSS'e ihtiyaç var)
  if (
    element.tagName.toLowerCase() === 'button' ||
    element.getAttribute('role') === 'button'
  ) {
    issues.push({
      type: 'ui-component',
      requiredRatio: 3.0, // AA seviyesi UI bileşenleri için
      recommendation:
        'UI bileşenleri minimum 3:1 kontrast oranı gerektirir (SC 1.4.11)',
    });
  }

  if (element.textContent?.trim()) {
    issues.push({
      type: 'text',
      requiredRatio: 4.5, // AA seviyesi normal metin için
      recommendation:
        'Normal metin minimum 4.5:1 kontrast oranı gerektirir (SC 1.4.3)',
    });
  }

  return issues;
};

/**
 * Klavye navigasyon analizi (SC 2.1.1, 2.1.2, 2.4.3, 2.4.7)
 */
const analyzeKeyboardNavigation = (
  element: HTMLElement
): KeyboardNavigation => {
  const interactiveElements = ['a', 'button', 'input', 'select', 'textarea'];
  const isFocusable =
    element.tabIndex >= 0 ||
    interactiveElements.includes(element.tagName.toLowerCase());

  return {
    focusable: isFocusable,
    trapRisk: false, // Modal içindeki elementler için dinamik analiz gerekli
    logicalOrder: element.tabIndex <= 0, // Pozitif tabindex mantıksal sırayı bozar
    visibleFocus: true, // CSS ile kontrol edilmeli
    shortcuts: [], // Element-specific klavye kısayolları
  };
};

/**
 * Ekran okuyucu desteği analizi (SC 4.1.2, 4.1.3)
 */
const analyzeScreenReaderSupport = (
  element: HTMLElement
): ScreenReaderSupport => {
  const hasAccessibleName = Boolean(
    element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim()
  );

  const hasAccessibleDescription = Boolean(
    element.getAttribute('aria-describedby') ||
      element.getAttribute('aria-description')
  );

  const role =
    element.getAttribute('role') ||
    getDefaultRole(element.tagName.toLowerCase());
  const roleAppropriate = Boolean(role);

  return {
    hasAccessibleName,
    hasAccessibleDescription,
    roleAppropriate,
    statesCommunicated: Boolean(
      element.getAttribute('aria-expanded') ||
        element.getAttribute('aria-checked')
    ),
    landmarkStructure: [
      'nav',
      'main',
      'header',
      'footer',
      'aside',
      'section',
    ].includes(element.tagName.toLowerCase()),
  };
};
