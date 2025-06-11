// Elements Tab Component
// WCAG 2.2-AA uyumlu element analizleri sekmesi

import React from 'react';
import type { ElementAnalysis, AlertConfig } from './types';
import { Icons } from './Icons';
import { renderMarkdown, copyAnalysisToClipboard } from './utils';
import { useTheme } from './themeContext';
import { getThemedCommonStyles, cssAnimations } from './styles';

interface ElementsTabProps {
  elementAnalyses: ElementAnalysis[];
  onShowContextMenuInfo: () => void;
  onClearAnalyses: () => void;
  showAlert: (config: AlertConfig) => void;
}

const ElementsTab: React.FC<ElementsTabProps> = ({
  elementAnalyses,
  onShowContextMenuInfo,
  onClearAnalyses,
  showAlert,
}) => {
  const { currentTheme } = useTheme();
  const commonStyles = getThemedCommonStyles(currentTheme === 'dark');

  // Tek analiz sonucu için panoya kopyalama
  const handleCopyAnalysis = async (analysisText: string) => {
    const success = await copyAnalysisToClipboard(analysisText);
    if (success) {
      showAlert({
        type: 'success',
        title: '📋 Analiz Panoya Kopyalandı',
        message: '✅ AI analiz sonucu başarıyla panoya kopyalandı\n📝 Herhangi bir uygulamaya yapıştırabilirsiniz (Ctrl+V)',
        duration: 3000,
      });
    } else {
      showAlert({
        type: 'error',
        title: '❌ Kopyalama Hatası',
        message: 'Panoya kopyalama başarısız oldu.\nTarayıcınız clipboard erişimini desteklemiyor olabilir.',
        duration: 4000,
      });
    }
  };

  return (
    <div style={{ padding: '24px', ...commonStyles.animations.fadeIn }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={commonStyles.iconContainer(64, commonStyles.gradients.blue)}>
          <Icons.MousePointer />
        </div>
        <h2 style={{ ...commonStyles.text.heading, marginBottom: '8px' }}>
          Element Analysis
        </h2>
        <p style={commonStyles.text.subheading}>
          AI-powered accessibility insights for web elements
        </p>
      </div>

      {/* Context Menu Kullanım Rehberi */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
        border: '1px solid #c7d2fe',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <Icons.MousePointer />
          <h3 style={{
            fontWeight: '600',
            color: '#1e40af',
            marginLeft: '8px',
            margin: 0,
          }}>
            Context Menu Analysis
          </h3>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#3730a3',
          marginBottom: '16px',
          lineHeight: '1.5',
        }}>
          Right-click on any web element and select{' '}
          <strong>"Accessibility Check"</strong> for instant AI-powered
          accessibility analysis.
        </p>

        <div style={{
          background: 'rgba(37, 99, 235, 0.1)',
          border: '1px solid rgba(37, 99, 235, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
        }}>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: '#1e40af',
          }}>
            📋 Kullanım Adımları:
          </h4>
          <ol style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '13px',
            color: '#3730a3',
            lineHeight: '1.4',
          }}>
            <li>Analiz etmek istediğiniz elementin üzerine sağ tıklayın</li>
            <li>"AI ile Denetle → Erişilebilirlik" seçeneğini tıklayın</li>
            <li>AI analiz sonuçlarını modal pencerede görüntüleyin</li>
            <li>Önerileri uygulayın ve "Kapat" ile sayfaya dönün</li>
          </ol>
        </div>

        <button
          onClick={onShowContextMenuInfo}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white',
            borderRadius: '8px',
            padding: '12px 16px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ marginRight: '8px', fontSize: '16px' }}>✅</span>
          Context Menu Aktif - Kullanımı Göster
        </button>
      </div>

      {/* Analiz Sonuçları */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
        }}>
          <h3 style={{
            fontWeight: '600',
            color: '#1f2937',
            margin: 0,
          }}>
            Son Element Analizleri
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500',
            }}>
              {elementAnalyses.length > 0 ? `${elementAnalyses.length} analiz` : 'Analiz yok'}
            </span>
            
            {elementAnalyses.length > 0 && (
              <button
                onClick={onClearAnalyses}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                }}
                title="Tüm analiz sonuçlarını temizle"
              >
                🗑️ Temizle
              </button>
            )}
          </div>
        </div>

        {/* Analiz Listesi */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {elementAnalyses.length > 0 ? (
            elementAnalyses.map((analysis, index) => (
              <div
                key={index}
                style={{
                  padding: '16px 20px',
                  borderBottom:
                    index < elementAnalyses.length - 1
                      ? '1px solid #e5e7eb'
                      : 'none',
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <span style={{
                    background: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}>
                    {analysis.elementType}
                    {analysis.elementId && `#${analysis.elementId}`}
                    {analysis.elementClass &&
                      `.${analysis.elementClass.split(' ')[0]}`}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginLeft: '8px',
                  }}>
                    {analysis.timestamp}
                  </span>
                  <button
                    onClick={() => handleCopyAnalysis(analysis.analysis)}
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      marginLeft: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                    }}
                    title="Bu analizi panoya kopyala"
                  >
                    📋 Kopyala
                  </button>
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.5',
                    marginBottom: '8px',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(analysis.analysis, currentTheme === 'dark')
                  }}
                />
                {analysis.suggestions.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#059669' }}>
                    💡 {analysis.suggestions.join(' • ')}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#6b7280',
              padding: '64px 20px',
            }}>
              Henüz element analizi yapılmadı.
              <br />
              <span style={{ fontSize: '14px' }}>
                Sağ tuş menüsünden "AI ile Denetle → Erişilebilirlik" seçeneğini
                kullanın.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bilgi Notu */}
      <div style={{
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Icons.AlertCircle />
          <div style={{ marginLeft: '12px' }}>
            <h4 style={{
              fontWeight: '500',
              color: '#92400e',
              fontSize: '14px',
              margin: '0 0 4px 0',
            }}>
              Kullanım Bilgileri
            </h4>
            <ul style={{
              fontSize: '12px',
              color: '#78350f',
              margin: 0,
              paddingLeft: '16px',
            }}>
              <li>Her düğme hangi elementi analiz edeceğini açıkça gösterir</li>
              <li>AI önerileri için Ayarlar'dan API anahtarını yapılandırın</li>
              <li>Analizler otomatik olarak saklanır</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{cssAnimations}</style>
    </div>
  );
};

export default ElementsTab;