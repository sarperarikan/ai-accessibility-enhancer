// Element Code Viewer Component
// Salt okunur HTML kod görüntüleyici
// WCAG 2.2-AA uyumlu tasarım

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './themeContext';
import { getThemedColors } from './styles';
import type { AlertConfig } from './types';

interface ElementCodeViewerProps {
  htmlContent: string;
  elementSelector?: string;
  elementType?: string;
  showAlert?: (config: AlertConfig) => void;
  className?: string;
  analysisMetadata?: {
    timestamp?: string;
    url?: string;
    domain?: string;
    elementId?: string;
    elementClass?: string;
    wcagScore?: number;
    aiScore?: number;
    issuesFound?: number;
  };
}

const ElementCodeViewer: React.FC<ElementCodeViewerProps> = ({
  htmlContent,
  elementSelector = '',
  elementType = 'Element',
  showAlert,
  className = '',
  analysisMetadata
}) => {
  const { currentTheme } = useTheme();
  const colors = getThemedColors(currentTheme === 'dark');
  const [isExpanded, setIsExpanded] = useState(false);
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const codeRef = useRef<HTMLPreElement>(null);

  // HTML içeriğini güzelleştir ve satır numaralarını hesapla
  useEffect(() => {
    if (htmlContent) {
      const formatted = formatHTML(htmlContent);
      const lines = formatted.split('\n');
      setLineNumbers(lines.map((_, index) => (index + 1).toString().padStart(2, '0')));
    }
  }, [htmlContent]);

  // HTML güzelleştirme fonksiyonu
  const formatHTML = (html: string): string => {
    let formatted = html;
    let indent = 0;
    const indentSize = 2;
    
    // HTML etiketlerini bul ve girintile
    formatted = formatted
      .replace(/></g, '>\n<')
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        
        // Kapanış etiketleri için girinti azalt
        if (trimmed.startsWith('</')) {
          indent = Math.max(0, indent - indentSize);
        }
        
        const indentedLine = ' '.repeat(indent) + trimmed;
        
        // Açılış etiketleri için girinti artır (self-closing değilse)
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
          indent += indentSize;
        }
        
        return indentedLine;
      })
      .join('\n');
    
    return formatted;
  };

  // HTML syntax highlighting
  const highlightHTML = (html: string): string => {
    const isDark = currentTheme === 'dark';
    
    return html
      // HTML etiketleri
      .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)(.*?)(&gt;)/g, 
        `<span style="color: ${isDark ? '#fbbf24' : '#dc2626'}">&lt;$1</span><span style="color: ${isDark ? '#60a5fa' : '#2563eb'}">$2</span><span style="color: ${isDark ? '#a78bfa' : '#7c3aed'}">$3</span><span style="color: ${isDark ? '#fbbf24' : '#dc2626'}">&gt;</span>`)
      // Attribute names
      .replace(/(\s)([a-zA-Z-]+)(=)/g, 
        `$1<span style="color: ${isDark ? '#34d399' : '#059669'}">$2</span><span style="color: ${isDark ? '#f87171' : '#dc2626'}">=</span>`)
      // Attribute values
      .replace(/(=)(".*?")/g, 
        `$1<span style="color: ${isDark ? '#fde047' : '#ca8a04'}">$2</span>`)
      // Comments
      .replace(/(&lt;!--.*?--&gt;)/g, 
        `<span style="color: ${isDark ? '#9ca3af' : '#6b7280'}; font-style: italic;">$1</span>`);
  };

  // Kopyalama işlemi
  const handleCopyCode = async () => {
    if (!showAlert) return;
    
    try {
      await navigator.clipboard.writeText(htmlContent);
      showAlert({
        type: 'success',
        title: '📋 HTML Kod Kopyalandı',
        message: '✅ Element HTML kodu başarıyla panoya kopyalandı',
        duration: 2000,
      });
    } catch {
      showAlert({
        type: 'error',
        title: '❌ Kopyalama Hatası',
        message: 'HTML kod kopyalama başarısız oldu',
        duration: 3000,
      });
    }
  };

  // HTML içeriğini escape et
  const escapeHtml = (html: string): string => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  };

  const formattedHTML = formatHTML(htmlContent);
  const escapedHTML = escapeHtml(formattedHTML);
  const _highlightedHTML = highlightHTML(escapedHTML);
  
  const isLongContent = formattedHTML.split('\n').length > 20;
  const displayLines = isExpanded ? formattedHTML.split('\n') : formattedHTML.split('\n').slice(0, 20);
  const displayHTML = displayLines.join('\n');
  const displayHighlighted = highlightHTML(escapeHtml(displayHTML));

  return (
    <div 
      className={`element-code-viewer ${className}`}
      style={{
        background: currentTheme === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        border: `2px solid ${currentTheme === 'dark' ? '#334155' : '#cbd5e1'}`,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: currentTheme === 'dark'
          ? '0 4px 6px rgba(0, 0, 0, 0.4)'
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontFamily: '\'Fira Code\', \'Monaco\', \'Consolas\', monospace',
      }}
    >
      {/* Header */}
      <div style={{
        background: currentTheme === 'dark'
          ? 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)'
          : 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
        color: 'white',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Ana başlık ve element bilgisi */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🏷️</span>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '16px', 
                fontWeight: '600',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}>
                Element HTML Kodu
              </h3>
              {elementSelector && (
                <p style={{ 
                  margin: '2px 0 0 0', 
                  fontSize: '12px', 
                  opacity: 0.9,
                  fontFamily: '\'Fira Code\', monospace'
                }}>
                  {elementType} {elementSelector}
                </p>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Salt Okunur
            </span>
          </div>
        </div>

        {/* Metadata bilgileri */}
        {analysisMetadata && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            fontSize: '12px'
          }}>
            {analysisMetadata.url && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🌐</span>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kaynak</div>
                  <div style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {analysisMetadata.domain || new URL(analysisMetadata.url).hostname}
                  </div>
                </div>
              </div>
            )}
            
            {analysisMetadata.timestamp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🕒</span>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Analiz Zamanı</div>
                  <div>{analysisMetadata.timestamp}</div>
                </div>
              </div>
            )}

            {typeof analysisMetadata.wcagScore === 'number' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>♿</span>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WCAG Skoru</div>
                  <div style={{
                    fontWeight: 'bold',
                    color: analysisMetadata.wcagScore >= 80 ? '#22c55e' : 
                          analysisMetadata.wcagScore >= 60 ? '#eab308' : '#ef4444'
                  }}>
                    {analysisMetadata.wcagScore}/100
                  </div>
                </div>
              </div>
            )}

            {typeof analysisMetadata.aiScore === 'number' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🤖</span>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Skoru</div>
                  <div style={{
                    fontWeight: 'bold',
                    color: analysisMetadata.aiScore >= 80 ? '#22c55e' : 
                          analysisMetadata.aiScore >= 60 ? '#eab308' : '#ef4444'
                  }}>
                    {analysisMetadata.aiScore}/100
                  </div>
                </div>
              </div>
            )}

            {typeof analysisMetadata.issuesFound === 'number' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠️</span>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tespit Edilen Sorun</div>
                  <div style={{
                    fontWeight: 'bold',
                    color: analysisMetadata.issuesFound === 0 ? '#22c55e' : 
                          analysisMetadata.issuesFound <= 3 ? '#eab308' : '#ef4444'
                  }}>
                    {analysisMetadata.issuesFound} adet
                  </div>
                </div>
              </div>
            )}

            {(analysisMetadata.elementId || analysisMetadata.elementClass) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', gridColumn: 'span 2' }}>
                <span>🎯</span>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Element Özellikleri</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                    {analysisMetadata.elementId && <span style={{ color: '#60a5fa' }}>#{analysisMetadata.elementId}</span>}
                    {analysisMetadata.elementId && analysisMetadata.elementClass && ' '}
                    {analysisMetadata.elementClass && <span style={{ color: '#34d399' }}>.{analysisMetadata.elementClass.split(' ')[0]}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aksiyon butonları */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>          
          {showAlert && (
            <button
              onClick={handleCopyCode}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(4px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              title="HTML kodunu panoya kopyala"
              aria-label="Element HTML kodunu panoya kopyala"
            >
              📋 Kopyala
            </button>
          )}
          
          {isLongContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(4px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Kodu kısalt' : 'Tüm kodu göster'}
            >
              {isExpanded ? '📉 Kısalt' : '📈 Tümünü Göster'}
            </button>
          )}
        </div>
      </div>

      {/* Code Content */}
      <div style={{
        background: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
        maxHeight: isExpanded ? '600px' : '400px',
        overflowY: 'auto',
        overflowX: 'auto',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', minHeight: '100%' }}>
          {/* Line Numbers */}
          <div style={{
            background: currentTheme === 'dark' ? '#1e293b' : '#f1f5f9',
            borderRight: `1px solid ${currentTheme === 'dark' ? '#334155' : '#e2e8f0'}`,
            padding: '16px 12px',
            minWidth: '60px',
            textAlign: 'right',
            fontSize: '13px',
            lineHeight: '1.5',
            color: currentTheme === 'dark' ? '#64748b' : '#94a3b8',
            userSelect: 'none',
            position: 'sticky',
            left: 0,
            zIndex: 1
          }}>
            {(isExpanded ? lineNumbers : lineNumbers.slice(0, 20)).map((num, index) => (
              <div key={index} style={{ whiteSpace: 'nowrap' }}>
                {num}
              </div>
            ))}
          </div>
          
          {/* Code Content */}
          <pre
            ref={codeRef}
            style={{
              flex: 1,
              margin: 0,
              padding: '16px',
              fontSize: '13px',
              lineHeight: '1.5',
              color: colors.text.primary,
              userSelect: 'text',
              WebkitUserSelect: 'text',
              MozUserSelect: 'text',
              msUserSelect: 'text',
              whiteSpace: 'pre',
              wordWrap: 'break-word',
              background: 'transparent'
            }}
            tabIndex={0}
            role="textbox"
            aria-label="Element HTML kodu - salt okunur"
            aria-readonly="true"
            dangerouslySetInnerHTML={{ __html: displayHighlighted }}
          />
        </div>
        
        {isLongContent && !isExpanded && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: currentTheme === 'dark' 
              ? 'linear-gradient(transparent, #0f172a)'
              : 'linear-gradient(transparent, #ffffff)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '16px'
          }}>
            <button
              onClick={() => setIsExpanded(true)}
              style={{
                background: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              {lineNumbers.length - 20} satır daha göster...
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElementCodeViewer;