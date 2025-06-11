// AI Analyzer - Element Analysis Handler
// MIT License

import { createAnalysisResult, createProviderInfo } from './modalUtils.js';

/**
 * Element bilgilerini AI analizi için hazırlar
 */
export const prepareElementData = (element: HTMLElement, forceProvider?: string) => {
  const computedStyles = window.getComputedStyle(element);
  
  return {
    type: 'ANALYZE_ELEMENT',
    elementHTML: element.outerHTML,
    elementText: element.textContent?.trim() || '',
    tagName: element.tagName,
    id: element.id,
    className: element.className,
    role: element.getAttribute('role'),
    ariaLabel: element.getAttribute('aria-label'),
    ariaDescribedBy: element.getAttribute('aria-describedby'),
    tabIndex: element.tabIndex,
    isInteractive: element.matches('button, a, input, textarea, select, [tabindex], [onclick]'),
    hasClickHandler: element.onclick !== null,
    computedStyles: {
      display: computedStyles.display,
      visibility: computedStyles.visibility,
      color: computedStyles.color,
      backgroundColor: computedStyles.backgroundColor,
    },
    forceProvider: forceProvider, // Force provider parametresi
  };
};

/**
 * AI analiz yanıtını işler ve UI'ı günceller
 */
export const handleAnalysisResponse = (response: any, suggestionElement: HTMLElement) => {
  if (response?.success && response?.analysis) {
    // Provider bilgisini ve analiz sonucunu göster
    const providerInfo = createProviderInfo(response);
    const analysisResult = createAnalysisResult(response.analysis);
    
    suggestionElement.innerHTML = `
      <div style="line-height:1.6;color:#374151;">
        ${providerInfo}
        ${analysisResult}
      </div>
    `;
  } else {
    const errorMsg = response?.error || 'AI analizi başarısız oldu.';
    suggestionElement.innerHTML = `
      <div style="color:#dc2626;line-height:1.6;border:2px solid #fecaca;background:#fef2f2;padding:1.5rem;border-radius:8px;" role="alert" aria-live="assertive">
        <h4 style="font-weight:600;margin:0 0 1rem;color:#991b1b;">⚠️ AI Analizi Hatası</h4>
        <p style="margin:0;"><strong>Hata mesajı:</strong><br>${errorMsg}</p>
      </div>
    `;
  }
};

/**
 * AI analizini başlatır
 */
export const startAIAnalysis = (element: HTMLElement, forceProvider?: string): Promise<any> => {
  const elementData = prepareElementData(element, forceProvider);
  
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(elementData, (response: any) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
};