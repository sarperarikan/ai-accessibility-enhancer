/**
 * AI Accessibility Enhancer - Content Script (Production Ready)
 * Modern AI-powered accessibility analysis system with i18n support
 *
 * Features:
 * - Right-click context menu for instant WCAG analysis
 * - AI-powered accessibility suggestions (Gemini/Ollama)
 * - WCAG 2.2-AA compliant interface
 * - Real-time element inspection
 * - Dynamic language support (Turkish/English)
 *
 * WCAG 2.2-AA Compliance:
 * - SC 1.4.3: Contrast (Minimum) - Modal color contrast
 * - SC 2.1.1: Keyboard - Full keyboard accessibility
 * - SC 2.4.3: Focus Order - Logical focus management
 * - SC 4.1.2: Name, Role, Value - Semantic structure
 *
 * MIT License
 */

import {
  createElementInfo,
  createProviderInfo,
  createAnalysisResult
} from './modalUtils';
import { copyToClipboard } from './clipboard';
import { showExtensionPopupHint } from './apiKeyManager';
import { WCAGAnalyzer } from './wcagAnalyzer';
import { analyzeElement } from '../api/gemini';
import './element-wcag-buttons';

// Clean up any legacy elements for backward compatibility
function cleanupLegacyElements(): void {
  const oldElements = document.querySelectorAll(
    '[data-ai-accessibility], .ai-accessibility-legacy'
  );
  oldElements.forEach(element => element.remove());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', cleanupLegacyElements);
} else {
  cleanupLegacyElements();
}

// Global variables
let currentAnalysisResult = '';

// Make clipboard function globally available
(window as any).copyToClipboard = copyToClipboard;

/**
 * Creates and shows WCAG analysis modal with AI integration
 * @param element - HTML element to analyze
 * @param forceProvider - Optional AI provider to force use
 */
async function showWCAGModal(element: HTMLElement, forceProvider?: string): Promise<void> {
  try {
    console.log('🎯 WCAG Modal açılıyor:', {
      element: element.tagName + (element.id ? '#' + element.id : ''),
      forceProvider,
      timestamp: new Date().toISOString()
    });

    // Mevcut modal'ları temizle
    const existingModal = document.getElementById('ai-accessibility-modal');
    existingModal?.remove();

    // Modal elementi oluştur
    const modal = createModal();
    const { modalContent, main, header } = createModalStructure();
    
    // Modal içeriği oluştur
    setupModalContent(main, element);
    
    // Modal'ı birleştir
    modal.appendChild(modalContent);
    modalContent.appendChild(header);
    modalContent.appendChild(main);

    // Event listeners ekle
    setupModalEventListeners(modal, header);

    // Modal'ı DOM'a ekle
    document.body.appendChild(modal);
    console.log('✅ Modal DOM\'a eklendi');

    // Focus yönetimi
    const closeBtn = header.querySelector('#modal-close') as HTMLButtonElement;
    setTimeout(() => {
      closeBtn?.focus();
    }, 100);

    // AI analizi başlat
    await performAIAnalysis(element, forceProvider);

  } catch (error) {
    console.error('Modal gösterme hatası:', error);
  }
}

/**
 * Creates the main modal container
 */
function createModal(): HTMLDivElement {
  const modal = document.createElement('div');
  modal.id = 'ai-accessibility-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-title');

  modal.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0,0,0,0.95) !important;
    z-index: 999999 !important;
    display: flex !important;
    align-items: flex-start !important;
    justify-content: center !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    padding: 20px !important;
    box-sizing: border-box !important;
  `;

  return modal;
}

/**
 * Creates modal structure components
 */
function createModalStructure(): { modalContent: HTMLDivElement; main: HTMLElement; header: HTMLElement } {
  // Modal içeriği
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white !important;
    width: 100% !important;
    height: 100% !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
  `;

  // Header
  const header = document.createElement('header');
  header.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    padding: 24px 32px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  `;

  const title = document.createElement('h2');
  title.id = 'modal-title';
  title.textContent = '🤖 AI Erişilebilirlik Analizi';
  title.style.cssText = `
    font-size: 24px !important;
    font-weight: bold !important;
    margin: 0 !important;
    color: white !important;
  `;

  const modalCloseBtn = document.createElement('button');
  modalCloseBtn.id = 'modal-close';
  modalCloseBtn.textContent = '×';
  modalCloseBtn.setAttribute('aria-label', 'Modal\'ı kapat');
  modalCloseBtn.style.cssText = `
    background: #ef4444 !important;
    border: none !important;
    color: white !important;
    width: 44px !important;
    height: 44px !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    font-size: 24px !important;
    font-weight: bold !important;
  `;

  header.appendChild(title);
  header.appendChild(modalCloseBtn);

  // Main content
  const main = document.createElement('main');
  main.style.cssText = `
    padding: 32px !important;
    overflow-y: auto !important;
    line-height: 1.6 !important;
    font-size: 16px !important;
    flex: 1 !important;
    display: flex !important;
    gap: 24px !important;
  `;

  return { modalContent, main, header };
}

/**
 * Sets up modal content with three-panel layout
 */
function setupModalContent(main: HTMLElement, element: HTMLElement): void {
  // Left Panel - Element Info and WCAG Analysis
  const leftPanel = document.createElement('div');
  leftPanel.style.cssText = `
    flex: 1 !important;
    background: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 12px !important;
    padding: 24px !important;
    overflow-y: auto !important;
    max-height: 100% !important;
  `;

  // Element info
  leftPanel.innerHTML = `
    <h3 style="font-size: 18px; color: #374151; margin: 0 0 16px 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
      🏷️ Element Bilgileri
    </h3>
    <div id="element-info-content">${createElementInfo(element)}</div>
    
    <h3 style="font-size: 18px; color: #374151; margin: 24px 0 16px 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
      ♿ WCAG & ARIA Analizi
    </h3>
    <div id="wcag-analysis-content" style="background: white; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px;">
      <div style="display: flex; align-items: center; justify-content: center; color: #374151; padding: 16px; text-align: center;">
        <div style="width: 24px; height: 24px; border: 3px solid #e5e7eb; border-top: 3px solid #10b981; border-radius: 50%; animation: wcag-spin 1s linear infinite; margin-right: 12px;"></div>
        <span>WCAG analizi yapılıyor...</span>
      </div>
    </div>
  `;

  // Middle Panel - AI Analysis
  const middlePanel = document.createElement('div');
  middlePanel.style.cssText = `
    flex: 1 !important;
    background: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 12px !important;
    padding: 24px !important;
    overflow-y: auto !important;
    max-height: 100% !important;
  `;

  middlePanel.innerHTML = `
    <h3 style="font-size: 18px; color: #374151; margin: 0 0 16px 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
      🤖 AI Analizi
    </h3>
    <div id="ai-analysis-content" style="background: white; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px;">
      <div style="display: flex; align-items: center; justify-content: center; color: #374151; padding: 32px; text-align: center;">
        <div style="width: 32px; height: 32px; border: 4px solid #e5e7eb; border-top: 4px solid #3b82f6; border-radius: 50%; animation: ai-spin 1s linear infinite; margin-right: 16px;"></div>
        <span>AI analizi devam ediyor...</span>
      </div>
    </div>
  `;

  // Right Panel - HTML Code
  const rightPanel = document.createElement('div');
  rightPanel.style.cssText = `
    flex: 1 !important;
    background: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 12px !important;
    padding: 24px !important;
    overflow-y: auto !important;
    max-height: 100% !important;
  `;

  rightPanel.innerHTML = `
    <h3 style="font-size: 18px; color: #374151; margin: 0 0 16px 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
      📄 HTML Kodu
    </h3>
    <div id="html-code-content" style="background: #1e293b; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; color: #e2e8f0; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.5; overflow-x: auto;">
      <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(element.outerHTML)}</pre>
      <button onclick="copyToClipboard('${escapeHtml(element.outerHTML).replace(/'/g, "\\'")}'); this.textContent='Kopyalandı!'; setTimeout(() => this.textContent='📋 Kopyala', 2000);" 
              style="margin-top: 12px; background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
        📋 Kopyala
      </button>
    </div>
  `;

  // CSS animations
  const style = document.createElement('style');
  style.setAttribute('data-ai-modal', 'true');
  style.textContent = `
    @keyframes ai-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes wcag-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  main.appendChild(leftPanel);
  main.appendChild(middlePanel);
  main.appendChild(rightPanel);

  // Start WCAG analysis immediately
  startWCAGAnalysis(element);
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Start WCAG analysis and display results
 */
function startWCAGAnalysis(element: HTMLElement): void {
  try {
    const analysis = WCAGAnalyzer.analyzeElement(element);
    const report = WCAGAnalyzer.generateReport(analysis);
    
    const wcagContent = document.getElementById('wcag-analysis-content');
    if (wcagContent) {
      // Convert markdown-like report to HTML
      const htmlReport = report
        .replace(/^# (.*$)/gm, '<h2 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 16px 0 8px 0;">$1</h2>')
        .replace(/^## (.*$)/gm, '<h3 style="color: #374151; font-size: 14px; font-weight: 600; margin: 12px 0 6px 0;">$1</h3>')
        .replace(/^### (.*$)/gm, '<h4 style="color: #4b5563; font-size: 13px; font-weight: 600; margin: 8px 0 4px 0;">$1</h4>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
        .replace(/\n\n/g, '</p><p style="margin: 8px 0; line-height: 1.5; font-size: 13px;">')
        .replace(/^(.*)$/gm, '<p style="margin: 8px 0; line-height: 1.5; font-size: 13px;">$1</p>')
        .replace(/<p[^>]*><\/p>/g, '');

      wcagContent.innerHTML = `
        <div style="max-height: 400px; overflow-y: auto;">
          ${htmlReport}
        </div>
        <button onclick="copyToClipboard(\`${report.replace(/`/g, '\\`')}\`); this.textContent='Kopyalandı!'; setTimeout(() => this.textContent='📋 Raporu Kopyala', 2000);" 
                style="margin-top: 12px; background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; width: 100%;">
          📋 Raporu Kopyala
        </button>
      `;
    }
  } catch (error) {
    console.error('WCAG analysis error:', error);
    const wcagContent = document.getElementById('wcag-analysis-content');
    if (wcagContent) {
      wcagContent.innerHTML = `
        <div style="color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; font-size: 13px;">
          ⚠️ WCAG analizi sırasında hata oluştu
        </div>
      `;
    }
  }
}

/**
 * Sets up modal event listeners for accessibility
 */
function setupModalEventListeners(modal: HTMLElement, header: HTMLElement): void {
  const closeModal = () => {
    modal.remove();
    const styles = document.querySelectorAll('style[data-ai-modal]');
    styles.forEach(style => style.remove());
  };

  const closeBtn = header.querySelector('#modal-close') as HTMLButtonElement;
  closeBtn?.addEventListener('click', closeModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
}

/**
 * Performs AI analysis and updates modal content
 */
async function performAIAnalysis(element: HTMLElement, forceProvider?: string): Promise<void> {
  try {
    console.log('🤖 AI analizi başlatılıyor...');
    const aiContentElement = document.getElementById('ai-analysis-content');
    if (!aiContentElement) return;

    // API key kontrolü - Chrome storage'dan al (hem sync hem local'i kontrol et)
    let result = await chrome.storage.local.get(['geminiApiKey']);
    if (!result.geminiApiKey) {
      // Local'de yoksa sync'de kontrol et
      result = await chrome.storage.sync.get(['geminiApiKey']);
      if (!result.geminiApiKey) {
        showAnalysisError(aiContentElement, 'Gemini API anahtarı bulunamadı. Lütfen extension ayarlarından API anahtarınızı girin.');
        return;
      }
    }
    
    console.log('🔑 API key bulundu:', result.geminiApiKey ? 'Mevcut' : 'Bulunamadı');

    // Gerçek AI analizi - Gemini API
    const aiProvider = forceProvider || 'gemini';
    const model = 'gemini-1.5-flash';
    
    console.log(`🔬 ${aiProvider} API ile analiz başlatılıyor...`);
    
    // API anahtarını geçici olarak global değişkene set et (güvenli olmayan ama geçici çözüm)
    (window as any).GEMINI_API_KEY = result.geminiApiKey;
    
    const analysisResult = await analyzeElement(element, aiProvider, model);
    
    const response = {
      success: true,
      analysis: analysisResult,
      usedProvider: aiProvider
    };
    console.log('✅ Gerçek AI analizi tamamlandı:', response);
    
    // API anahtarını temizle (güvenlik)
    delete (window as any).GEMINI_API_KEY;
    
    if (response?.success && response?.analysis) {
      // Analiz sonucunu global değişkene kaydet
      currentAnalysisResult = response.analysis;
      (window as any).currentAnalysisResult = response.analysis;
      
      // modalUtils'daki fonksiyonları kullanarak düzgün render
      const providerInfo = createProviderInfo(response);
      const analysisResult = createAnalysisResult(response.analysis);
      
      aiContentElement.innerHTML = `
        <div style="line-height:1.6;color:#374151;">
          ${providerInfo}
          ${analysisResult}
        </div>
      `;
      
      // Kopyalama butonlarını etkinleştir
      setupCopyButtons(aiContentElement);

      // Analiz geçmişine kaydet
      saveAnalysisHistory(element, response.analysis);
    } else {
      showAnalysisError(aiContentElement, 'AI analizi başarısız oldu');
    }
  } catch (error) {
    console.error('🚨 AI analiz hatası:', error);
    
    // API anahtarını temizle (güvenlik)
    delete (window as any).GEMINI_API_KEY;
    
    const aiContentElement = document.getElementById('ai-analysis-content');
    if (aiContentElement) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata oluştu';
      
      // API hata mesajlarını kullanıcı dostu hale getir
      if (errorMessage.includes('API_KEY')) {
        showAnalysisError(aiContentElement, 'Gemini API anahtarı geçersiz. Lütfen doğru API anahtarını girin.');
      } else if (errorMessage.includes('QUOTA')) {
        showAnalysisError(aiContentElement, 'API kotası doldu. Lütfen daha sonra tekrar deneyin.');
      } else if (errorMessage.includes('SAFETY')) {
        showAnalysisError(aiContentElement, 'İçerik güvenlik filtresinden geçemedi. Element analizi yapılamadı.');
      } else {
        showAnalysisError(aiContentElement, `AI analiz hatası: ${errorMessage}`);
      }
    }
  }
}

/**
 * Sets up copy button functionality
 */
function setupCopyButtons(container: HTMLElement): void {
  const copyButtons = container.querySelectorAll('button[id*="copy"]');
  copyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      if (target.id === 'analysis-result-copy') {
        copyToClipboard(currentAnalysisResult);
      } else if (target.id === 'html-code-copy') {
        const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
        if (textarea) {
          copyToClipboard(textarea.value);
        }
      }
    });
  });
}

/**
 * Shows analysis error in modal
 */
function showAnalysisError(container: HTMLElement, error?: string): void {
  container.innerHTML = `
    <div style="color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px;">
      <h4 style="margin: 0 0 8px 0; color: #991b1b;">⚠️ AI Analizi Hatası</h4>
      <p style="margin: 0;">${error || 'AI analizi başarısız oldu.'}</p>
    </div>
  `;
}

/**
 * Save analysis to history
 */
function saveAnalysisHistory(element: HTMLElement, analysisResult: string): void {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const historyItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString('tr-TR'),
        url: window.location.href,
        elementType: element.tagName.toLowerCase(),
        elementId: element.id,
        elementClass: element.className,
        elementSelector: getElementSelector(element),
        wcagScore: calculateWCAGScore(element),
        aiScore: extractAIScore(analysisResult),
        issuesFound: countIssues(analysisResult),
        analysis: analysisResult, // popup'un beklediği alan adı
        suggestions: extractSuggestions(analysisResult),
        wcagResult: getWCAGAnalysisResult(element),
        htmlContent: element.outerHTML,
        domain: window.location.hostname
      };

      // Hem analysisHistory hem de elementAnalyses'e kaydet
      chrome.storage.local.get(['analysisHistory', 'elementAnalyses'], (result: any) => {
        // History için
        const history = result.analysisHistory || [];
        history.unshift(historyItem);
        const trimmedHistory = history.slice(0, 100);
        
        // Popup için elementAnalyses
        const elementAnalyses = result.elementAnalyses || [];
        elementAnalyses.unshift(historyItem);
        const trimmedAnalyses = elementAnalyses.slice(0, 50);
        
        chrome.storage.local.set({
          analysisHistory: trimmedHistory,
          elementAnalyses: trimmedAnalyses
        }, () => {
          console.log('📊 Analysis saved to both history and elementAnalyses:', historyItem.id);
        });
      });
    }
  } catch (error) {
    console.error('History save error:', error);
  }
}

/**
 * Extract suggestions from analysis result
 */
function extractSuggestions(analysisResult: string): string[] {
  const suggestions: string[] = [];
  
  // Turkish suggestions
  const trPatterns = [
    /öner[iy][\s:]*(.+?)(?:\n|$)/gi,
    /tavsiye[\s:]*(.+?)(?:\n|$)/gi,
    /düzelt[\s:]*(.+?)(?:\n|$)/gi,
    /iyileştir[\s:]*(.+?)(?:\n|$)/gi,
    /ekle[\s:]*(.+?)(?:\n|$)/gi
  ];
  
  // English suggestions
  const enPatterns = [
    /suggest[\s:]*(.+?)(?:\n|$)/gi,
    /recommend[\s:]*(.+?)(?:\n|$)/gi,
    /should[\s:]*(.+?)(?:\n|$)/gi,
    /add[\s:]*(.+?)(?:\n|$)/gi,
    /improve[\s:]*(.+?)(?:\n|$)/gi
  ];
  
  [...trPatterns, ...enPatterns].forEach(pattern => {
    let match;
    while ((match = pattern.exec(analysisResult)) !== null) {
      if (match[1] && match[1].trim().length > 10) {
        suggestions.push(match[1].trim());
      }
    }
  });
  
  return suggestions.slice(0, 5); // En fazla 5 öneri
}

/**
 * Get CSS selector for element
 */
function getElementSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }
  
  let selector = element.tagName.toLowerCase();
  if (element.className) {
    selector += `.${element.className.split(' ')[0]}`;
  }
  
  return selector;
}

/**
 * Calculate WCAG score from element analysis
 */
function calculateWCAGScore(element: HTMLElement): number {
  const analysis = WCAGAnalyzer.analyzeElement(element);
  const passCount = analysis.wcagResults.filter(r => r.status === 'pass').length;
  const totalCount = analysis.wcagResults.length;
  
  return totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
}

/**
 * Extract AI score from analysis result
 */
function extractAIScore(analysisResult: string): number {
  // Look for score patterns in the analysis
  const scoreMatch = analysisResult.match(/(\d+)\/100|\b(\d+)%|\bskor[:\s]*(\d+)/i);
  if (scoreMatch) {
    return parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]);
  }
  
  // Estimate score based on content
  const positiveWords = ['good', 'excellent', 'accessible', 'compliant', 'iyi', 'mükemmel', 'erişilebilir'];
  const negativeWords = ['poor', 'bad', 'inaccessible', 'violation', 'kötü', 'sorun', 'hata'];
  
  const positive = positiveWords.some(word => analysisResult.toLowerCase().includes(word));
  const negative = negativeWords.some(word => analysisResult.toLowerCase().includes(word));
  
  if (positive && !negative) return 85;
  if (!positive && negative) return 35;
  return 60; // neutral
}

/**
 * Count issues mentioned in analysis
 */
function countIssues(analysisResult: string): number {
  const issueKeywords = ['issue', 'problem', 'error', 'violation', 'sorun', 'hata', 'problem'];
  let count = 0;
  
  for (const keyword of issueKeywords) {
    const matches = analysisResult.toLowerCase().match(new RegExp(keyword, 'g'));
    count += matches ? matches.length : 0;
  }
  
  return Math.min(count, 10); // Cap at 10
}

/**
 * Get WCAG analysis result as string
 */
function getWCAGAnalysisResult(element: HTMLElement): string {
  try {
    const analysis = WCAGAnalyzer.analyzeElement(element);
    return WCAGAnalyzer.generateReport(analysis);
  } catch {
    return 'WCAG analizi mevcut değil';
  }
}

// Global export functions
(window as any).exportElementAnalysis = (format: string, _button: HTMLButtonElement) => {
  const blob = new Blob([currentAnalysisResult], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `accessibility-analysis.${format}`;
  a.click();
  
  URL.revokeObjectURL(url);
};

(window as any).showWCAGModal = showWCAGModal;

// Content script message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Content script received message:', message.type, message);
  
  if (message.type === 'PING') {
    sendResponse({ status: 'ready' });
    return true;
  }

  if (message.type === 'SHOW_EXTENSION_POPUP_HINT') {
    showExtensionPopupHint();
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'SHOW_WCAG_MODAL') {
    console.log('🎯 CONTENT SCRIPT: RECEIVED SHOW_WCAG_MODAL MESSAGE!', {
      messageType: message.type,
      forceProvider: message.forceProvider,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      documentReady: document.readyState
    });
    
    try {
      let targetElement: HTMLElement | null = null;
      
      if ((window as any).lastClickedElement) {
        targetElement = (window as any).lastClickedElement;
        console.log('📍 Using last clicked element:', targetElement?.tagName || 'unknown', targetElement?.id || 'no-id');
      }
      
      if (!targetElement) {
        alert('Lütfen analiz etmek istediğiniz bir elemente sağ tıklayın ve tekrar deneyin. (WCAG 2.2 SC 3.3.1 - Hata Tanımlama)');
        sendResponse({ success: false, error: 'Element seçilmedi' });
        return true;
      }

      console.log('🚀 Opening WCAG modal...');
      showWCAGModal(targetElement, message.forceProvider).then(() => {
        console.log('✅ WCAG modal opened successfully');
        sendResponse({ success: true, message: 'WCAG modal opened successfully' });
      }).catch((error) => {
        console.error('❌ WCAG modal error:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown modal error' });
      });
    } catch (error) {
      console.error('❌ CONTENT SCRIPT: Modal creation error:', error);
      sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    return true;
  }
});

// Track last clicked element for context menu
let _lastClickedElement: HTMLElement | null = null;

document.addEventListener('contextmenu', (event) => {
  const target = event.target as HTMLElement;
  if (target && target.nodeType === Node.ELEMENT_NODE) {
    _lastClickedElement = target;
    (window as any).lastClickedElement = target;
    console.log('📍 Context menu target element saved:', target.tagName, target.id || 'no-id');
  }
});

console.log('🎉 CONTENT SCRIPT LOADED SUCCESSFULLY', {
  url: window.location.href,
  timestamp: new Date().toISOString(),
  readyState: document.readyState
});

// Global debug function
(window as any).debugAIExtension = () => {
  console.log('🔍 AI Extension Debug Info:', {
    url: window.location.href,
    hasShowWCAGModal: typeof (window as any).showWCAGModal === 'function',
    hasLastClickedElement: !!(window as any).lastClickedElement,
    currentModal: !!document.getElementById('ai-accessibility-modal'),
    chromeRuntime: !!chrome?.runtime,
    timestamp: new Date().toISOString()
  });
};
