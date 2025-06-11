/**
 * History Tab Component
 * Analysis history, statistics and re-analysis functionality
 * 
 * WCAG 2.2-AA Compliance:
 * - SC 2.4.3: Focus Order - Logical focus management
 * - SC 4.1.2: Name, Role, Value - Proper table structure
 * - SC 1.3.1: Info and Relationships - Clear data relationships
 * 
 * MIT License
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from './themeContext';
import { getThemedColors } from './styles';
import { Icons } from './Icons';
import type { AlertConfig } from './types';

interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  url: string;
  elementType: string;
  elementId?: string;
  elementClass?: string;
  elementSelector: string;
  wcagScore: number;
  aiScore: number;
  issuesFound: number;
  analysisResult: string;
  wcagResult: string;
  htmlContent: string;
  domain: string;
}

interface HistoryTabProps {
  showAlert: (config: AlertConfig) => void;
}

interface AnalysisStats {
  totalAnalyses: number;
  averageWcagScore: number;
  averageAiScore: number;
  totalIssues: number;
  topDomains: { domain: string; count: number }[];
  topElementTypes: { type: string; count: number }[];
  analysisPerDay: { date: string; count: number }[];
}

const HistoryTab: React.FC<HistoryTabProps> = ({ showAlert }) => {
  const { currentTheme } = useTheme();
  const colors = getThemedColors(currentTheme === 'dark');

  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [_selectedItem, _setSelectedItem] = useState<AnalysisHistoryItem | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'stats' | 'detail'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, _setSortBy] = useState<'timestamp' | 'score' | 'issues'>('timestamp');
  const [sortOrder, _setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Load history from storage
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['analysisHistory'], (result: any) => {
        if (result.analysisHistory) {
          const historyData = result.analysisHistory as AnalysisHistoryItem[];
          setHistory(historyData);
          calculateStats(historyData);
        }
      });
    }
  };

  const calculateStats = (historyData: AnalysisHistoryItem[]) => {
    if (historyData.length === 0) {
      setStats(null);
      return;
    }

    const totalAnalyses = historyData.length;
    const averageWcagScore = historyData.reduce((sum, item) => sum + item.wcagScore, 0) / totalAnalyses;
    const averageAiScore = historyData.reduce((sum, item) => sum + item.aiScore, 0) / totalAnalyses;
    const totalIssues = historyData.reduce((sum, item) => sum + item.issuesFound, 0);

    // Top domains
    const domainCounts: { [key: string]: number } = {};
    historyData.forEach(item => {
      domainCounts[item.domain] = (domainCounts[item.domain] || 0) + 1;
    });
    const topDomains = Object.entries(domainCounts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top element types
    const typeCounts: { [key: string]: number } = {};
    historyData.forEach(item => {
      typeCounts[item.elementType] = (typeCounts[item.elementType] || 0) + 1;
    });
    const topElementTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Analysis per day (last 7 days)
    const analysisPerDay: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = historyData.filter(item => {
        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
        return itemDate === dateStr;
      }).length;
      analysisPerDay.push({ date: dateStr, count });
    }

    setStats({
      totalAnalyses,
      averageWcagScore,
      averageAiScore,
      totalIssues,
      topDomains,
      topElementTypes,
      analysisPerDay
    });
  };

  const filteredHistory = history
    .filter(item => 
      item.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.elementType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const order = sortOrder === 'desc' ? -1 : 1;
      switch (sortBy) {
        case 'timestamp':
          return order * (a.timestamp - b.timestamp);
        case 'score':
          return order * (a.wcagScore - b.wcagScore);
        case 'issues':
          return order * (a.issuesFound - b.issuesFound);
        default:
          return 0;
      }
    });

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const clearHistory = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ analysisHistory: [] }, () => {
        setHistory([]);
        setStats(null);
        showAlert({
          type: 'success',
          title: 'Başarılı',
          message: '📊 Analiz geçmişi temizlendi',
          duration: 3000
        });
      });
    }
  };

  const exportHistory = () => {
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showAlert({
      type: 'success',
      title: 'Başarılı',
      message: '📥 Geçmiş başarıyla dışa aktarıldı',
      duration: 3000
    });
  };

  return (
    <div style={{ 
      padding: '24px',
      animation: 'fadeIn 0.3s ease-in-out',
      minHeight: '500px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '50%',
          color: 'white',
          marginBottom: '16px'
        }}>
          <Icons.BarChart />
        </div>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          color: colors.text.primary,
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          Analiz Geçmişi & İstatistikler
        </h2>
        <p style={{ 
          fontSize: '14px', 
          color: colors.text.secondary,
          margin: 0
        }}>
          Geçmiş analizlerinizi görüntüleyin ve istatistikleri inceleyin
        </p>
      </div>

      {/* View Mode Toggle */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        padding: '4px',
        background: colors.background.tertiary,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`
      }}>
        {[
          { key: 'list', label: '📋 Liste' },
          { key: 'stats', label: '📊 İstatistikler' }
        ].map(mode => (
          <button
            key={mode.key}
            onClick={() => setViewMode(mode.key as any)}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: viewMode === mode.key ? colors.primary : 'transparent',
              color: viewMode === mode.key ? 'white' : colors.text.primary,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {viewMode === 'stats' && stats ? (
        // Statistics View
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Overall Stats */}
          <div style={{
            background: colors.background.primary,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ marginBottom: '16px', color: colors.text.primary }}>Genel İstatistikler</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary }}>
                  {stats.totalAnalyses}
                </div>
                <div style={{ fontSize: '12px', color: colors.text.secondary }}>Toplam Analiz</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: getScoreColor(stats.averageWcagScore) }}>
                  {Math.round(stats.averageWcagScore)}
                </div>
                <div style={{ fontSize: '12px', color: colors.text.secondary }}>Ortalama WCAG Skoru</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                  {stats.totalIssues}
                </div>
                <div style={{ fontSize: '12px', color: colors.text.secondary }}>Toplam Sorun</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {Math.round(stats.averageAiScore)}
                </div>
                <div style={{ fontSize: '12px', color: colors.text.secondary }}>Ortalama AI Skoru</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // List View
        <div>
          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            {/* Search */}
            <input
              type="text"
              placeholder="🔍 URL, element tipi veya domain ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                background: colors.background.secondary,
                color: colors.text.primary,
                fontSize: '14px'
              }}
            />

            {/* Actions */}
            <button
              onClick={exportHistory}
              disabled={history.length === 0}
              style={{
                background: colors.primary,
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: history.length > 0 ? 'pointer' : 'not-allowed',
                opacity: history.length > 0 ? 1 : 0.5
              }}
            >
              📥 Dışa Aktar
            </button>

            <button
              onClick={clearHistory}
              disabled={history.length === 0}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: history.length > 0 ? 'pointer' : 'not-allowed',
                opacity: history.length > 0 ? 1 : 0.5
              }}
            >
              🗑️ Temizle
            </button>
          </div>

          {/* History List */}
          {filteredHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: colors.background.primary,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <span style={{
                        background: colors.background.secondary,
                        color: colors.text.primary,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {item.elementType.toUpperCase()}
                      </span>
                      <span style={{ marginLeft: '8px', fontSize: '14px', color: colors.text.secondary }}>
                        {item.domain}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: getScoreColor(item.wcagScore)
                      }}>
                        {item.wcagScore}/100
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: colors.text.secondary
                      }}>
                        {new Date(item.timestamp).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: colors.text.primary,
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.url}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: colors.text.secondary }}>
                    <span>🔍 {item.issuesFound} sorun</span>
                    <span>🤖 AI: {item.aiScore}/100</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: colors.text.secondary,
              padding: '48px',
              background: colors.background.primary,
              borderRadius: '12px',
              border: `2px dashed ${colors.border}`
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>
                {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz analiz geçmişi yok'}
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {searchTerm ? 'Farklı anahtar kelimeler deneyin' : 'Bir element analiz ettiğinizde burada görünecek'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;