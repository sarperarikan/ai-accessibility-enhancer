// Enhanced Elements Tab Component
// Gelişmiş analiz görüntüleme ve HTML kod görüntüleyici ile
// WCAG 2.2-AA uyumlu tasarım

import React, { useState } from 'react';
import type { ElementAnalysis, AlertConfig } from './types';
import { Icons } from './Icons';
import { formatElementInfo } from './utils';
import { useTheme } from './themeContext';
import { getThemedColors, cssAnimations } from './styles';
import AnalysisViewer from './AnalysisViewer';
import ElementCodeViewer from './ElementCodeViewer';

interface EnhancedElementsTabProps {
  elementAnalyses: ElementAnalysis[];
  onShowContextMenuInfo: () => void;
  onClearAnalyses: () => void;
  showAlert: (config: AlertConfig) => void;
}

const EnhancedElementsTab: React.FC<EnhancedElementsTabProps> = ({
  elementAnalyses,
  onShowContextMenuInfo,
  onClearAnalyses,
  showAlert,
}) => {
  const { currentTheme } = useTheme();
  const colors = getThemedColors(currentTheme === 'dark');
  const isDark = currentTheme === 'dark';
  const [selectedAnalysis, setSelectedAnalysis] = useState<ElementAnalysis | null>(null);
  const [viewMode, setViewMode] = useState<'analysis' | 'code' | 'both'>('analysis');

  // Analiz seçme işlemi
  const handleSelectAnalysis = (analysis: ElementAnalysis) => {
    setSelectedAnalysis(analysis);
    setViewMode('analysis');
  };

  // Görüntüleme modu değiştirme
  const handleViewModeChange = (mode: 'analysis' | 'code' | 'both') => {
    setViewMode(mode);
  };

  return (
    <div style={{ 
      padding: '24px',
      animation: 'fadeIn 0.3s ease-in-out'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '50%',
          color: 'white',
          marginBottom: '16px'
        }}>
          <Icons.MousePointer />
        </div>
        <h2 style={{ 
          fontSize: '20px',
          fontWeight: 'bold',
          color: colors.text.primary,
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          Gelişmiş Element Analizi
        </h2>
        <p style={{ 
          fontSize: '14px', 
          color: colors.text.secondary,
          margin: 0
        }}>
          AI destekli erişilebilirlik analizi ve HTML kod görüntüleyici
        </p>
      </div>

      {/* Context Menu Kullanım Rehberi */}
      <div style={{
        background: isDark 
          ? 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)'
          : 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
        border: `1px solid ${isDark ? '#3730a3' : '#c7d2fe'}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        color: isDark ? 'white' : '#1e40af'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <Icons.MousePointer />
          <h3 style={{
            fontWeight: '600',
            marginLeft: '8px',
            margin: '0 0 0 8px',
          }}>
            Analiz Başlatma
          </h3>
        </div>
        <p style={{
          fontSize: '14px',
          marginBottom: '16px',
          lineHeight: '1.5',
          opacity: 0.9,
          margin: '0 0 16px 0'
        }}>
          Web sayfasında herhangi bir elemente sağ tıklayıp{' '}
          <strong>"Erişilebilirlik Analizini Başlat"</strong> seçeneğini kullanarak
          instant AI analizi başlatın.
        </p>

        <button
          onClick={onShowContextMenuInfo}
          style={{
            width: '100%',
            background: isDark
              ? 'rgba(255, 255, 255, 0.2)'
              : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white',
            borderRadius: '8px',
            padding: '12px 16px',
            fontWeight: '500',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ marginRight: '8px', fontSize: '16px' }}>✅</span>
          Context Menu Kullanımını Göster
        </button>
      </div>

      {/* Ana İçerik Alanı */}
      <div style={{ display: 'flex', gap: '24px', minHeight: '500px' }}>
        {/* Sol Panel - Analiz Listesi */}
        <div style={{
          flex: '0 0 320px',
          background: colors.background.primary,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {/* Liste Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.border}`,
            background: colors.background.secondary,
          }}>
            <h3 style={{
              fontWeight: '600',
              color: colors.text.primary,
              margin: 0,
              fontSize: '16px'
            }}>
              Analiz Geçmişi
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontSize: '12px',
                color: colors.text.secondary,
                fontWeight: '500',
              }}>
                {elementAnalyses.length > 0 ? `${elementAnalyses.length} analiz` : 'Henüz analiz yok'}
              </span>
              
              {elementAnalyses.length > 0 && (
                <button
                  onClick={onClearAnalyses}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                  }}
                  title="Tüm analiz sonuçlarını temizle"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>

          {/* Analiz Listesi */}
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            padding: elementAnalyses.length === 0 ? '40px 20px' : '0'
          }}>
            {elementAnalyses.length > 0 ? (
              elementAnalyses.map((analysis, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectAnalysis(analysis)}
                  style={{
                    padding: '16px 20px',
                    borderBottom:
                      index < elementAnalyses.length - 1
                        ? `1px solid ${colors.border}`
                        : 'none',
                    cursor: 'pointer',
                    background: selectedAnalysis === analysis
                      ? colors.primary
                      : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAnalysis !== analysis) {
                      e.currentTarget.style.background = colors.background.tertiary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAnalysis !== analysis) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      background: selectedAnalysis === analysis
                        ? 'rgba(255, 255, 255, 0.2)'
                        : (isDark ? '#4338ca' : '#dbeafe'),
                      color: selectedAnalysis === analysis
                        ? 'white'
                        : (isDark ? '#a5b4fc' : '#1e40af'),
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      fontFamily: 'monospace'
                    }}>
                      {formatElementInfo(analysis)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: selectedAnalysis === analysis
                      ? 'rgba(255, 255, 255, 0.8)'
                      : colors.text.secondary,
                    marginBottom: '4px'
                  }}>
                    {analysis.timestamp}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: selectedAnalysis === analysis
                      ? 'rgba(255, 255, 255, 0.9)'
                      : colors.text.primary,
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {analysis.analysis.slice(0, 100)}...
                  </div>
                  {analysis.suggestions.length > 0 && (
                    <div style={{
                      fontSize: '11px',
                      color: selectedAnalysis === analysis
                        ? '#fde047'
                        : '#059669',
                      marginTop: '4px',
                      fontWeight: '500'
                    }}>
                      💡 {analysis.suggestions.length} öneri
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                color: colors.text.secondary,
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>
                  Henüz analiz yapılmadı
                </p>
                <p style={{ margin: 0, fontSize: '12px' }}>
                  Sağ tık menüsünden analiz başlatın
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sağ Panel - Detay Görünümü */}
        <div style={{ flex: 1 }}>
          {selectedAnalysis ? (
            <div>
              {/* Görüntüleme Modu Seçici */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '20px',
                padding: '4px',
                background: colors.background.tertiary,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`
              }}>
                {[
                  { key: 'analysis', label: '🧠 AI Analizi', disabled: false },
                  { key: 'code', label: '🏷️ HTML Kodu', disabled: !selectedAnalysis.htmlContent },
                  { key: 'both', label: '👥 Birlikte', disabled: !selectedAnalysis.htmlContent }
                ].map(mode => (
                  <button
                    key={mode.key}
                    onClick={() => !mode.disabled && handleViewModeChange(mode.key as any)}
                    disabled={mode.disabled}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      background: viewMode === mode.key
                        ? colors.primary
                        : 'transparent',
                      color: viewMode === mode.key
                        ? 'white'
                        : (mode.disabled 
                            ? colors.text.tertiary
                            : colors.text.primary),
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: mode.disabled ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: mode.disabled ? 0.5 : 1
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* İçerik Görüntüleme */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {(viewMode === 'analysis' || viewMode === 'both') && (
                  <AnalysisViewer
                    analysis={selectedAnalysis.analysis}
                    title={`${formatElementInfo(selectedAnalysis)} - AI Analizi`}
                    showCopyButton={true}
                    showAlert={showAlert}
                  />
                )}

                {(viewMode === 'code' || viewMode === 'both') && selectedAnalysis.htmlContent && (
                  <ElementCodeViewer
                    htmlContent={selectedAnalysis.htmlContent}
                    elementSelector={selectedAnalysis.elementSelector}
                    elementType={selectedAnalysis.elementType}
                    showAlert={showAlert}
                    analysisMetadata={{
                      timestamp: selectedAnalysis.timestamp,
                      url: selectedAnalysis.url,
                      domain: selectedAnalysis.domain,
                      elementId: selectedAnalysis.elementId,
                      elementClass: selectedAnalysis.elementClass,
                      wcagScore: selectedAnalysis.wcagScore,
                      aiScore: selectedAnalysis.aiScore,
                      issuesFound: selectedAnalysis.issuesFound
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            // Analiz seçilmediğinde placeholder
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              background: colors.background.primary,
              border: `2px dashed ${colors.border}`,
              borderRadius: '12px',
              color: colors.text.secondary,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                margin: '0 0 8px 0',
                color: colors.text.primary
              }}>
                Analiz Detayını Görüntüle
              </h3>
              <p style={{ fontSize: '14px', margin: 0, maxWidth: '300px', lineHeight: '1.5' }}>
                Sol panelden bir analiz sonucu seçerek detaylı görünümü ve HTML kodlarını inceleyin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{cssAnimations}</style>
    </div>
  );
};

export default EnhancedElementsTab;