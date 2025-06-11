// Modal Utilities - UI Component Generators
// MIT License

import { t } from '../utils/i18n.js';

/**
 * Markdown'ı HTML'e çeviren basit parser
 */
export const parseMarkdown = (markdown: string): string => {
  return markdown
    // Başlıklar
    .replace(
      /^### (.*$)/gm,
      '<h3 style="font-size:1.125rem;font-weight:600;color:#1f2937;margin:1.5rem 0 0.75rem 0;">$1</h3>'
    )
    .replace(
      /^## (.*$)/gm,
      '<h2 style="font-size:1.25rem;font-weight:700;color:#1f2937;margin:1.75rem 0 1rem 0;">$1</h2>'
    )
    .replace(
      /^# (.*$)/gm,
      '<h1 style="font-size:1.5rem;font-weight:800;color:#1f2937;margin:2rem 0 1rem 0;">$1</h1>'
    )
    // Kalın metin
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong style="font-weight:600;color:#374151;">$1</strong>'
    )
    // İtalik metin
    .replace(
      /\*(.*?)\*/g,
      '<em style="font-style:italic;color:#4b5563;">$1</em>'
    )
    // Kod blokları - Salt okunur alan
    .replace(
      /```(\w+)?\n?([\s\S]*?)```/g,
      '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:12px 0;overflow:hidden;"><div style="background:#e2e8f0;padding:8px 12px;font-size:12px;color:#475569;font-weight:500;border-bottom:1px solid #cbd5e1;">$1 Kod Bloğu (Salt Okunur)</div><pre style="background:#f8fafc;padding:16px;margin:0;overflow-x:auto;font-family:\'Monaco\',\'Menlo\',\'Ubuntu Mono\',monospace;font-size:13px;line-height:1.5;color:#334155;user-select:text;-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;"><code>$2</code></pre></div>'
    )
    // Inline kod
    .replace(
      /`(.*?)`/g,
      "<code style=\"background:#f3f4f6;border:1px solid #e5e7eb;padding:0.125rem 0.375rem;border-radius:4px;font-family:'Monaco','Menlo','Ubuntu Mono',monospace;font-size:0.875rem;color:#1f2937;\">$1</code>"
    )
    // Listeler
    .replace(
      /^[\s]*[-*+] (.*$)/gm,
      '<li style="margin:0.25rem 0;padding-left:0.5rem;color:#374151;">$1</li>'
    )
    .replace(
      /^[\s]*\d+\. (.*$)/gm,
      '<li style="margin:0.25rem 0;padding-left:0.5rem;color:#374151;">$1</li>'
    )
    // Liste wrapper'ları ekle
    .replace(
      /(<li[^>]*>.*<\/li>)/g,
      '<ul style="margin:0.75rem 0;padding-left:1.5rem;list-style:disc;">$1</ul>'
    )
    // Satır sonları
    .replace(
      /\n\n/g,
      '</p><p style="margin:0.75rem 0;line-height:1.6;color:#374151;">'
    )
    .replace(/\n/g, '<br>')
    // Paragraf wrap
    .replace(
      /^/,
      '<p style="margin:0.75rem 0;line-height:1.6;color:#374151;">'
    )
    .replace(/$/, '</p>');
};

/**
 * Yükleme göstergisi oluşturur
 */
export const createLoadingSpinner = (): string => `
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#374151;padding:2rem;text-align:center;" role="status" aria-live="polite">
    <div style="width:40px;height:40px;border:4px solid #e5e7eb;border-top:4px solid #3b82f6;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem;" aria-hidden="true"></div>
    <h3 style="font-size:1.125rem;font-weight:600;color:#1f2937;margin:0 0 0.5rem 0;">${t('modal.loading')}</h3>
    <p style="margin:0;color:#6b7280;font-size:0.875rem;">Analyzing accessibility patterns and generating intelligent recommendations...</p>
  </div>
`;

/**
 * Hata mesajı oluşturur
 */
export const createErrorMessage = (error: Error | string): string => `
  <div style="color:#dc2626;line-height:1.6;border:2px solid #fecaca;background:#fef2f2;padding:1.5rem;border-radius:8px;" role="alert" aria-live="assertive">
    <h4 style="font-weight:600;margin:0 0 1rem;color:#991b1b;">⚠️ AI Analizi Hatası</h4>
    <p style="margin:0 0 1rem;"><strong>Hata mesajı:</strong><br>
    ${error instanceof Error ? error.message : error}</p>
    
    <details style="margin-top:1rem;">
      <summary style="cursor:pointer;font-weight:600;color:#991b1b;">Çözüm önerileri</summary>
      <ul style="margin:0.5rem 0 0 1rem;color:#6b7280;">
        <li>Konsolu kontrol edin (F12)</li>
        <li>API ayarlarınızı gözden geçirin</li>
        <li>İnternet bağlantınızı kontrol edin</li>
        <li>Sayfayı yenilemeyi deneyin</li>
      </ul>
    </details>
  </div>
`;

/**
 * Provider bilgi kutusunu oluşturur
 */
export const createProviderInfo = (response: any): string => {
  if (!response.usedProvider) return '';
  
  const providerMap: Record<string, { icon: string; name: string; color: string }> = {
    gemini: { icon: '🤖', name: 'Google Gemini', color: '#4285f4' },
    ollama: { icon: '🦙', name: 'Ollama', color: '#10b981' },
    test: { icon: '🧪', name: 'Test Mode', color: '#f59e0b' }
  };
  
  const provider = providerMap[response.usedProvider] || providerMap.gemini;
  
  return `<div style="background:${provider.color}10;border:1px solid ${provider.color};padding:0.75rem;border-radius:6px;margin-bottom:1rem;font-size:0.875rem;">
    <strong>${provider.icon} AI Sağlayıcısı:</strong> ${provider.name}
  </div>`;
};

/**
 * Element bilgilerini gösterir
 */
export const createElementInfo = (element: HTMLElement): string => {
  const tagName = element.tagName.toLowerCase();
  const elementId = element.id || 'yok';
  const elementClass = element.className || 'yok';
  const role = element.getAttribute('role') || 'varsayılan';
  const ariaAttributes =
    Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('aria-'))
      .map(attr => `${attr.name}="${attr.value}"`)
      .join(', ') || 'yok';

  const textContent = element.textContent?.trim() || 'boş';
  const hasTabIndex = element.hasAttribute('tabindex');
  const tabIndexValue = element.getAttribute('tabindex') || 'yok';

  // Element'in tam HTML kodunu al (max 500 karakter)
  const outerHTML =
    element.outerHTML.length > 500
      ? element.outerHTML.substring(0, 500) + '...'
      : element.outerHTML;

  return `
    <section style="margin-bottom:2rem;" aria-labelledby="element-info-title">
      <h3 id="element-info-title" style="font-size:1.25rem;color:#1f2937;margin:0 0 1rem;font-weight:600;">
        📋 Element Yapısı
      </h3>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:1.5rem;border-radius:8px;font-family:'Monaco','Menlo','Ubuntu Mono',monospace;line-height:1.6;font-size:13px;">
        <dl style="margin:0;">
          <dt style="font-weight:600;color:#374151;margin-bottom:0.25rem;">HTML Etiketi:</dt>
          <dd style="margin:0 0 1rem 1rem;color:#1f2937;"><code style="background:#e5e7eb;padding:0.25rem 0.5rem;border-radius:4px;">&lt;${tagName}&gt;</code></dd>
          
          <dt style="font-weight:600;color:#374151;margin-bottom:0.25rem;">ID:</dt>
          <dd style="margin:0 0 1rem 1rem;color:#1f2937;"><code style="background:#e5e7eb;padding:0.25rem 0.5rem;border-radius:4px;">${elementId}</code></dd>
          
          <dt style="font-weight:600;color:#374151;margin-bottom:0.25rem;">Class:</dt>
          <dd style="margin:0 0 1rem 1rem;color:#1f2937;"><code style="background:#e5e7eb;padding:0.25rem 0.5rem;border-radius:4px;">${elementClass}</code></dd>
          
          <dt style="font-weight:600;color:#374151;margin-bottom:0.25rem;">Semantik Rol:</dt>
          <dd style="margin:0 0 1rem 1rem;color:#1f2937;"><code style="background:#e5e7eb;padding:0.25rem 0.5rem;border-radius:4px;">${role}</code></dd>
          
          <dt style="font-weight:600;color:#374151;margin-bottom:0.25rem;">Metin İçeriği:</dt>
          <dd style="margin:0 0 1rem 1rem;color:#1f2937;max-width:100%;word-wrap:break-word;">"${textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent}"</dd>
          
          ${
            hasTabIndex
              ? `
          <dt style="font-weight:600;color:#374151;margin-bottom:0.25rem;">Tab Index:</dt>
          <dd style="margin:0 0 1rem 1rem;color:#1f2937;"><code style="background:#e5e7eb;padding:0.25rem 0.5rem;border-radius:4px;">${tabIndexValue}</code></dd>
          `
              : ''
          }
          
          <dt style="font-weight:600;color:#374151;margin-bottom:0.25rem;">ARIA Özellikleri:</dt>
          <dd style="margin:0 0 1rem 1rem;color:#1f2937;word-wrap:break-word;">
            ${
              ariaAttributes === 'yok'
                ? '<span style="color:#6b7280;font-style:italic;">Hiç ARIA özniteliği bulunamadı</span>'
                : `<code style="background:#e5e7eb;padding:0.25rem 0.5rem;border-radius:4px;white-space:pre-wrap;">${ariaAttributes}</code>`
            }
          </dd>
          
          <dt style="font-weight:600;color:#374151;margin-bottom:0.25rem;">${t('modal.htmlCode')}</dt>
          <dd style="margin:0 0 0 1rem;color:#1f2937;">
            <div style="position:relative;margin:8px 0;">
              <textarea
                readonly
                onclick="this.select()"
                style="width:100%;height:120px;background:#f8f9fa;border:1px solid #d1d5db;border-radius:6px;padding:12px;font-family:'Courier New',Monaco,monospace;font-size:12px;resize:vertical;color:#212529;outline:none;white-space:pre;"
              >${outerHTML}</textarea>
              <div style="position:absolute;top:8px;right:8px;">
                <button
                  onclick="copyToClipboard(this.previousElementSibling.value)"
                  style="background:#0ea5e9;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:11px;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.2);display:flex;align-items:center;gap:4px;"
                  title="HTML kodunu panoya kopyala"
                >📋 Kopyala</button>
              </div>
            </div>
          </dd>
        </dl>
      </div>
    </section>
  `;
};

/**
 * AI analiz sonucu için kopyala butonlu kapsayıcı oluşturur
 */
export const createAnalysisResult = (analysisText: string): string => {
  // Markdown'ı HTML'e çevir
  const formattedAnalysis = parseMarkdown(analysisText);

  // HTML önerisini bul (```html tag'leri arasındaki kod)
  const codeMatch = analysisText.match(/```html\n([\s\S]*?)```/);
  const improvedHtml = codeMatch ? codeMatch[1].trim() : '';

  return `
    <section style="margin-bottom:2rem;" aria-labelledby="analysis-result-title">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <h3 id="analysis-result-title" style="font-size:1.25rem;color:#1f2937;margin:0;font-weight:600;">
          🤖 AI Erişilebilirlik Analizi
        </h3>
        <button
          id="analysis-result-copy"
          style="background:#0ea5e9;color:white;border:none;padding:8px 16px;border-radius:6px;font-size:12px;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.1);display:flex;align-items:center;gap:6px;font-weight:500;"
          title="AI analiz sonucunu panoya kopyala"
        >📋 Analizi Kopyala</button>
      </div>
      
      <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:1.5rem;border-radius:8px;line-height:1.6;margin-bottom:1rem;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        ${formattedAnalysis}
      </div>

      ${improvedHtml ? `
        <div style="margin-top:1.5rem;">
          <h4 style="font-size:1.1rem;color:#1f2937;margin:0 0 0.5rem 0;font-weight:600;">
            🔧 İyileştirilmiş HTML Kodu
          </h4>
          <div style="position:relative;">
            <textarea
              readonly
              onclick="this.select()"
              style="width:100%;height:200px;font-family:Consolas,'Courier New',monospace;font-size:13px;padding:12px;border:1px solid #d1d5db;border-radius:6px;background:#f9fafb;color:#374151;resize:vertical;line-height:1.4;cursor:text;"
              aria-label="İyileştirilmiş HTML kodu (salt okunur)"
            >${improvedHtml}</textarea>
            <div style="position:absolute;top:8px;right:8px;">
              <button
                id="html-code-copy"
                style="background:#059669;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:11px;cursor:pointer;"
                title="İyileştirilmiş HTML kodunu panoya kopyala"
              >📋 HTML'i Kopyala</button>
            </div>
          </div>
          <small style="display:block;margin-top:8px;color:#6b7280;">
            ↑ Bu kod WCAG 2.2-AA uyumlu hale getirilmiş versiyondur
          </small>
        </div>
      ` : ''}
    </section>
  `;
};

/**
 * HTML kodunu HTML markup'ından çıkarır
 * WCAG 2.2 SC 4.1.1: HTML parsing için yardımcı fonksiyon
 */
const extractHtmlCode = (text: string): string => {
  // <code> tagları içindeki HTML'i bul
  const codeMatches = text.match(/<code[^>]*>&lt;[\s\S]*?&gt;<\/code>/g);
  if (codeMatches && codeMatches.length > 0) {
    // En uzun HTML snippet'i al
    const htmlSnippets = codeMatches.map(match => {
      const content = match.replace(/<\/?code[^>]*>/g, '');
      return content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    });
    
    return htmlSnippets.reduce((longest, current) =>
      current.length > longest.length ? current : longest, ''
    );
  }
  
  return '';
};