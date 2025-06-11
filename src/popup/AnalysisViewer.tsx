// Analysis Viewer Component
// Markdown formatında render edilmiş analiz sonuçları görüntüleyici
// WCAG 2.2-AA uyumlu tasarım

import React, { useState } from 'react';
import { useTheme } from './themeContext';
import { getThemedColors } from './styles';
import { renderMarkdown, copyAnalysisToClipboard } from './utils';
import type { AlertConfig } from './types';

interface AnalysisViewerProps {
  analysis: string;
  title?: string;
  showCopyButton?: boolean;
  showAlert?: (config: AlertConfig) => void;
  className?: string;
}

const AnalysisViewer: React.FC<AnalysisViewerProps> = ({
  analysis,
  title = 'AI Analiz Sonucu',
  showCopyButton = true,
  showAlert,
  className = ''
}) => {
  const { currentTheme } = useTheme();
  const colors = getThemedColors(currentTheme === 'dark');
  const [isExpanded, setIsExpanded] = useState(false);

  // Kopyalama işlemi
  const handleCopyAnalysis = async () => {
    if (!showAlert) return;
    
    const success = await copyAnalysisToClipboard(analysis);
    if (success) {
      showAlert({
        type: 'success',
        title: '📋 Analiz Kopyalandı',
        message: '✅ Analiz sonucu başarıyla panoya kopyalandı',
        duration: 2000,
      });
    } else {
      showAlert({
        type: 'error',
        title: '❌ Kopyalama Hatası',
        message: 'Panoya kopyalama başarısız oldu',
        duration: 3000,
      });
    }
  };

  // Analiz metninin uzunluğuna göre kısaltma
  const isLongContent = analysis.length > 500;
  const displayContent = isLongContent && !isExpanded 
    ? analysis.slice(0, 500) + '...'
    : analysis;

  return (
    <div 
      className={`analysis-viewer ${className}`}
      style={{
        background: currentTheme === 'dark' 
          ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: `2px solid ${currentTheme === 'dark' ? '#4b5563' : '#e2e8f0'}`,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: currentTheme === 'dark'
          ? '0 4px 6px rgba(0, 0, 0, 0.3)'
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div style={{
        background: currentTheme === 'dark'
          ? 'linear-gradient(135deg, #3730a3 0%, #1e40af 100%)'
          : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🧠</span>
          <h3 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '600',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}>
            {title}
          </h3>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showCopyButton && showAlert && (
            <button
              onClick={handleCopyAnalysis}
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
              title="Analizi panoya kopyala"
              aria-label="Analiz sonucunu panoya kopyala"
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
              aria-label={isExpanded ? 'Analizi kısalt' : 'Tüm analizi göster'}
            >
              {isExpanded ? '📉 Kısalt' : '📈 Tümünü Göster'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '20px',
        maxHeight: isExpanded ? 'none' : '400px',
        overflowY: isExpanded ? 'visible' : 'auto',
        color: colors.text.primary,
        lineHeight: '1.6',
        fontSize: '14px'
      }}>
        <div
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(displayContent, currentTheme === 'dark')
          }}
        />
        
        {isLongContent && !isExpanded && (
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            padding: '12px',
            background: currentTheme === 'dark' 
              ? 'rgba(59, 130, 246, 0.1)' 
              : 'rgba(59, 130, 246, 0.05)',
            borderRadius: '8px',
            border: `1px solid ${currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
          }}>
            <button
              onClick={() => setIsExpanded(true)}
              style={{
                background: 'transparent',
                color: colors.primary,
                border: 'none',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Devamını okumak için tıklayın...
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisViewer;