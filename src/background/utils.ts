// Background Utils - Helper functions and utilities
// MIT License

/**
 * Context menu başlığını al (i18n desteği ile)
 */
export function getContextMenuTitle(): string {
  // Browser dilini kontrol et
  const browserLanguage = chrome.i18n.getUILanguage();
  
  if (browserLanguage.startsWith('tr')) {
    return '📋 Erişilebilirlik Denetimi';
  } else {
    return '📋 Accessibility Check';
  }
}

/**
 * Element analizi için prompt oluştur
 */
export function createAnalysisPrompt(elementData: any): string {
  const prompt = `
SEN 20 YILLIK WCAG VE ARIA TEKNİKLERİ KONUSUNDA DİJİTAL ERİŞİLEBİLİRLİK UZMANI VE YAZILIM UZMANISSIN.

Bu eklenti Sarper ARIKAN tarafından geliştirilmiştir. © 2024 AI Accessibility Enhancer

GÖREV: Aşağıdaki HTML içeriğini WCAG 2.2-AA standartlarına göre profesyonel olarak analiz et.

UZMANLIK ALANLARIN:
- WCAG 2.1/2.2 Guidelines (20 yıllık deneyim)
- ARIA Authoring Practices Guide (APG)
- Section 508 Compliance
- EN 301 549 European Standard
- Modern web accessibility patterns
- Screen reader compatibility (NVDA, JAWS, VoiceOver)
- Keyboard navigation best practices
- Color contrast and visual accessibility
- Cognitive accessibility guidelines

ANALİZ EDİLECEK ELEMENT:

Element Bilgileri:
- HTML Etiketi: ${elementData.tagName}
- ID: ${elementData.id || 'yok'}
- Class: ${elementData.className || 'yok'}
- Role: ${elementData.role || 'varsayılan'}
- ARIA Label: ${elementData.ariaLabel || 'yok'}
- Tab Index: ${elementData.tabIndex}
- Etkileşimli: ${elementData.isInteractive ? 'Evet' : 'Hayır'}
- Metin İçeriği: "${elementData.elementText || 'boş'}"

HTML Kodu:
${elementData.elementHTML}

Computed Styles:
- Display: ${elementData.computedStyles?.display}
- Visibility: ${elementData.computedStyles?.visibility}
- Color: ${elementData.computedStyles?.color}
- Background: ${elementData.computedStyles?.backgroundColor}

UZMAN ANALİZ GEREKSİNİMLERİ:

1. **🔍 WCAG 2.2-AA Uyumluluk Analizi**
   - Success Criteria violations (detaylı referanslar ile)
   - Level A, AA, AAA sınıflandırması
   - Conformance düzeyi değerlendirmesi

2. **⚠️ Kritik Erişilebilirlik Sorunları**
   - Ekran okuyucu uyumluluğu
   - Klavye navigasyon problemleri
   - Focus management issues
   - Semantic markup eksiklikleri
   - ARIA kullanım hataları

3. **🎯 Önerilen Çözümler**
   - WCAG Techniques referansları
   - ARIA patterns önerileri
   - Best practice implementations
   - Alternative yaklaşımlar

4. **💻 Düzeltilmiş Kod Örnekleri**
   - Production-ready HTML/ARIA kodu
   - Progressive enhancement örnekleri
   - Cross-browser compatibility
   - Testing approaches

5. **📋 Doğrulama Adımları**
   - Screen reader test scenarios
   - Keyboard testing checklist
   - Automated testing tools
   - Manual testing procedures

ÇIKTI FORMATI: HTML formatında, teknik detaylarla dolu, uygulanabilir çözümler.
BAŞLIK YAPISı: <h2> ve <h3> etiketleri kullan
KOD ÖRNEKLERİ: <pre><code> bloklarında ver
REFERANSLAR: WCAG 2.2 Success Criteria numaraları ile
STİL: Inline CSS kullanarak modern ve okunabilir görünüm

ÇIKTI TEMPLATE'İ:
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d3748;">
  <h2 style="color: #2b6cb0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">🔍 WCAG 2.2-AA Uyumluluk Analizi</h2>
  <div style="background: #f7fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <!-- Analiz içeriği -->
  </div>
  
  <h2 style="color: #c53030; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">⚠️ Kritik Erişilebilirlik Sorunları</h2>
  <div style="background: #fed7d7; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <!-- Sorunlar -->
  </div>
  
  <h2 style="color: #38a169; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">🎯 Önerilen Çözümler</h2>
  <div style="background: #f0fff4; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <!-- Çözümler -->
  </div>
  
  <h2 style="color: #805ad5; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">💻 Düzeltilmiş Kod Örnekleri</h2>
  <div style="background: #faf5ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <pre style="background: #1a202c; color: #e2e8f0; padding: 16px; border-radius: 6px; overflow-x: auto;"><code><!-- Düzeltilmiş HTML kod --></code></pre>
  </div>
  
  <h2 style="color: #d69e2e; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">📋 Doğrulama Adımları</h2>
  <div style="background: #fffbeb; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <!-- Test adımları -->
  </div>
</div>

20 yıllık uzman deneyimini kullanarak, bu elementi kapsamlı olarak analiz et ve yukarıdaki HTML template'ini kullanarak profesyonel çözümler sun.
`;

  return prompt;
}

/**
 * Ayarları doğrula
 */
export function validateSettings(settings: any, activeProvider: string): { isValid: boolean; error?: string } {
  if (!activeProvider || activeProvider !== 'gemini') {
    return {
      isValid: false,
      error: 'AI sağlayıcısı olarak Gemini seçilmelidir.'
    };
  }

  if (!settings.geminiApiKey) {
    return {
      isValid: false,
      error: 'Gemini API anahtarı eksik. Ayarlardan girin.'
    };
  }

  return { isValid: true };
}

/**
 * Hata yanıtı oluştur
 */
export function createErrorResponse(error: string, analysis?: string): any {
  return {
    success: false,
    error: error,
    analysis: analysis || 'Lütfen popup ayarlarından AI sağlayıcısını seçin ve API anahtarını girin.',
  };
}

/**
 * Başarı yanıtı oluştur
 */
export function createSuccessResponse(analysis: string, usedProvider: string, isForced: boolean): any {
  return {
    success: true,
    analysis: analysis,
    usedProvider: usedProvider,
    isForced: isForced,
  };
}

/**
 * Debug log
 */
export function debugLog(message: string, data?: any): void {
  console.log(`🔧 Background Debug: ${message}`, data || '');
}