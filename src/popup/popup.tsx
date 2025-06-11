/**
 * AI Accessibility Enhancer - Main Popup Component
 * Modern React-based popup with WCAG 2.2-AA compliance
 * MIT License
 */

import React, { useState, useEffect } from 'react';
import EnhancedElementsTab from './EnhancedElementsTab';
import GeminiTab from './GeminiTab';
import SettingsTab from './SettingsTab';
import HistoryTab from './HistoryTab';
import KeyboardShortcutsTab from './KeyboardShortcutsTab';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider, useTheme } from './themeContext';
import { getThemedColors } from './styles';
import type { ActiveTab, ElementAnalysis, AlertConfig } from './types';

function PopupContent(): JSX.Element {
  const { currentTheme } = useTheme();
  const colors = getThemedColors(currentTheme === 'dark');
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('elements');
  const [elementAnalyses, setElementAnalyses] = useState<ElementAnalysis[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // Önce local'den dene
      chrome.storage.local.get(['elementAnalyses', 'geminiApiKey', 'geminiModel'], (result: any) => {
        if (result.elementAnalyses) setElementAnalyses(result.elementAnalyses);
        
        // API key yoksa sync'den dene
        if (result.geminiApiKey) {
          setGeminiApiKey(result.geminiApiKey);
          if (result.geminiModel) setGeminiModel(result.geminiModel);
        } else {
          // Local'de API key yoksa sync'den al
          chrome.storage.sync.get(['geminiApiKey', 'geminiModel'], (syncResult: any) => {
            if (syncResult.geminiApiKey) setGeminiApiKey(syncResult.geminiApiKey);
            if (syncResult.geminiModel) setGeminiModel(syncResult.geminiModel);
          });
        }
        
        if (result.geminiModel && result.geminiApiKey) setGeminiModel(result.geminiModel);
      });
    }
  }, []);

  const showAlert = (config: AlertConfig) => {
    console.log('Alert:', config.message);
  };

  const saveSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // Hem local hem sync'e kaydet (uyumluluk için)
      chrome.storage.local.set({ geminiApiKey, geminiModel });
      chrome.storage.sync.set({ geminiApiKey, geminiModel });
      console.log('🔑 API key kaydedildi:', geminiApiKey ? 'Başarılı' : 'Boş');
    }
  };

  return (
    <main style={{
      width: '640px',
      height: '720px',
      background: colors.background.primary,
      color: colors.text.primary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, #667eea 100%)`,
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
            AI Accessibility Enhancer
          </h1>
          <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
            WCAG 2.2-AA Uyumlu Erişilebilirlik Analizi
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* Tab Navigation */}
      <nav
        style={{
          display: 'flex',
          background: colors.background.primary,
          borderBottom: `1px solid ${colors.border}`
        }}
        role="tablist"
        aria-label="Ana navigasyon sekmeleri"
      >
        {[
          { key: 'elements', label: '📊 Analizler' },
          { key: 'history', label: '📈 Geçmiş' },
          { key: 'gemini', label: '🔮 AI API' },
          { key: 'shortcuts', label: '⌨️ Kısayollar' },
          { key: 'settings', label: '⚙️ Ayarlar' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as ActiveTab)}
            style={{
              flex: 1,
              padding: '10px 8px',
              border: 'none',
              background: activeTab === tab.key ? colors.primary : 'transparent',
              color: activeTab === tab.key ? 'white' : colors.text.secondary,
              fontWeight: '500',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            id={`tab-${tab.key}`}
            tabIndex={activeTab === tab.key ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const tabs = ['elements', 'history', 'gemini', 'shortcuts', 'settings'];
                const currentIndex = tabs.indexOf(activeTab);
                const direction = e.key === 'ArrowRight' ? 1 : -1;
                const newIndex = (currentIndex + direction + tabs.length) % tabs.length;
                setActiveTab(tabs[newIndex] as ActiveTab);
                
                // Focus'u yeni tab'a ver
                setTimeout(() => {
                  const newTab = document.getElementById(`tab-${tabs[newIndex]}`);
                  newTab?.focus();
                }, 0);
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'elements' && (
          <div
            role="tabpanel"
            id="tabpanel-elements"
            aria-labelledby="tab-elements"
            tabIndex={0}
            style={{ height: '100%', outline: 'none' }}
          >
            <EnhancedElementsTab
              elementAnalyses={elementAnalyses}
              onShowContextMenuInfo={() => showAlert({ type: 'info', title: 'Info', message: 'Context menu bilgisi' })}
              onClearAnalyses={() => setElementAnalyses([])}
              showAlert={showAlert}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div
            role="tabpanel"
            id="tabpanel-history"
            aria-labelledby="tab-history"
            tabIndex={0}
            style={{ height: '100%', outline: 'none' }}
          >
            <HistoryTab showAlert={showAlert} />
          </div>
        )}
        
        {activeTab === 'gemini' && (
          <div
            role="tabpanel"
            id="tabpanel-gemini"
            aria-labelledby="tab-gemini"
            tabIndex={0}
            style={{ height: '100%', outline: 'none' }}
          >
            <GeminiTab
              geminiApiKey={geminiApiKey}
              geminiModel={geminiModel}
              onGeminiApiKeyChange={setGeminiApiKey}
              onGeminiModelChange={setGeminiModel}
              onSaveSettings={saveSettings}
            />
          </div>
        )}

        {activeTab === 'shortcuts' && (
          <div
            role="tabpanel"
            id="tabpanel-shortcuts"
            aria-labelledby="tab-shortcuts"
            tabIndex={0}
            style={{ height: '100%', outline: 'none' }}
          >
            <KeyboardShortcutsTab showAlert={showAlert} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div
            role="tabpanel"
            id="tabpanel-settings"
            aria-labelledby="tab-settings"
            tabIndex={0}
            style={{ height: '100%', outline: 'none' }}
          >
            <SettingsTab showAlert={showAlert} />
          </div>
        )}
      </div>
    </main>
  );
}

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <PopupContent />
    </ThemeProvider>
  );
}

export default App;
