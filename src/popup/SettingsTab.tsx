/**
 * Settings Tab Component
 * Extension general settings and keyboard shortcuts configuration
 * 
 * WCAG 2.2-AA Compliance:
 * - SC 2.1.1: Keyboard - Full keyboard accessibility
 * - SC 2.4.3: Focus Order - Logical focus management
 * - SC 4.1.2: Name, Role, Value - Proper form controls
 * 
 * MIT License
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from './themeContext';
import { getThemedColors } from './styles';
import { Icons } from './Icons';
import type { AlertConfig } from './types';

interface SettingsTabProps {
  showAlert: (config: AlertConfig) => void;
}

interface ExtensionSettings {
  keyboardShortcut: string;
  enableHoverMode: boolean;
  autoAnalyzeOnClick: boolean;
  showNotifications: boolean;
  analysisTimeout: number;
  saveAnalysisHistory: boolean;
  maxHistoryItems: number;
  enableDebugMode: boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ showAlert }) => {
  const { currentTheme } = useTheme();
  const colors = getThemedColors(currentTheme === 'dark');
  const isDark = currentTheme === 'dark';

  const [settings, setSettings] = useState<ExtensionSettings>({
    keyboardShortcut: 'Ctrl+Shift+W',
    enableHoverMode: true,
    autoAnalyzeOnClick: false,
    showNotifications: true,
    analysisTimeout: 30,
    saveAnalysisHistory: true,
    maxHistoryItems: 50,
    enableDebugMode: false,
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Load settings from storage
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['extensionSettings'], (result: any) => {
        if (result.extensionSettings) {
          setSettings({ ...settings, ...result.extensionSettings });
        }
      });
    }
  }, []);

  // Handle setting changes
  const handleSettingChange = (key: keyof ExtensionSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  // Save settings
  const saveSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ extensionSettings: settings }, () => {
        setUnsavedChanges(false);
        showAlert({
          type: 'success',
          title: 'Başarılı',
          message: '✅ Ayarlar başarıyla kaydedildi!',
          duration: 3000
        });

        // Send message to content script to update settings
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'UPDATE_SETTINGS',
              settings: settings
            });
          }
        });
      });
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const defaultSettings: ExtensionSettings = {
      keyboardShortcut: 'Ctrl+Shift+W',
      enableHoverMode: true,
      autoAnalyzeOnClick: false,
      showNotifications: true,
      analysisTimeout: 30,
      saveAnalysisHistory: true,
      maxHistoryItems: 50,
      enableDebugMode: false,
    };
    setSettings(defaultSettings);
    setUnsavedChanges(true);
  };

  const shortcutOptions = [
    { value: 'Ctrl+Shift+W', label: 'Ctrl+Shift+W (WCAG)' },
    { value: 'Ctrl+Shift+A', label: 'Ctrl+Shift+A (Accessibility)' },
    { value: 'Ctrl+Alt+A', label: 'Ctrl+Alt+A' },
    { value: 'Ctrl+Alt+W', label: 'Ctrl+Alt+W' },
    { value: 'Alt+Shift+A', label: 'Alt+Shift+A' },
    { value: 'disabled', label: 'Devre Dışı' },
  ];

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
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '50%',
          color: 'white',
          marginBottom: '16px'
        }}>
          <Icons.Settings />
        </div>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          color: colors.text.primary,
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          Extension Ayarları
        </h2>
        <p style={{ 
          fontSize: '14px', 
          color: colors.text.secondary,
          margin: 0
        }}>
          Kısayollar, analiz seçenekleri ve genel ayarlar
        </p>
      </div>

      {/* Settings Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Keyboard Shortcuts Section */}
        <div style={{
          background: colors.background.primary,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: '16px',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⌨️ Klavye Kısayolları
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.text.primary,
              marginBottom: '8px'
            }}>
              Hover Analiz Modu Kısayolu
            </label>
            <select
              value={settings.keyboardShortcut}
              onChange={(e) => handleSettingChange('keyboardShortcut', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                background: colors.background.secondary,
                color: colors.text.primary,
                fontSize: '14px'
              }}
            >
              {shortcutOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{
            background: isDark ? '#1e3a8a' : '#eff6ff',
            border: `1px solid ${isDark ? '#3730a3' : '#c7d2fe'}`,
            borderRadius: '8px',
            padding: '12px',
            fontSize: '13px',
            color: isDark ? '#a5b4fc' : '#1e40af'
          }}>
            <strong>💡 İpucu:</strong> Kısayol tuşu ile hover analiz modunu etkinleştirin. 
            Elementin üzerine geldiğinizde "🔍 Analiz Et" butonu görünecektir.
          </div>
        </div>

        {/* Analysis Settings Section */}
        <div style={{
          background: colors.background.primary,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: '16px',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔍 Analiz Ayarları
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Enable Hover Mode */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.enableHoverMode}
                onChange={(e) => handleSettingChange('enableHoverMode', e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: colors.primary
                }}
              />
              <span style={{ fontSize: '14px', color: colors.text.primary }}>
                Hover analiz modunu etkinleştir
              </span>
            </label>

            {/* Auto Analyze on Click */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.autoAnalyzeOnClick}
                onChange={(e) => handleSettingChange('autoAnalyzeOnClick', e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: colors.primary
                }}
              />
              <span style={{ fontSize: '14px', color: colors.text.primary }}>
                Element'e tıklandığında otomatik analiz et
              </span>
            </label>

            {/* Show Notifications */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.showNotifications}
                onChange={(e) => handleSettingChange('showNotifications', e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: colors.primary
                }}
              />
              <span style={{ fontSize: '14px', color: colors.text.primary }}>
                Bildirimler göster
              </span>
            </label>

            {/* Analysis Timeout */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text.primary,
                marginBottom: '8px'
              }}>
                Analiz zaman aşımı (saniye): {settings.analysisTimeout}
              </label>
              <input
                type="range"
                min="10"
                max="120"
                value={settings.analysisTimeout}
                onChange={(e) => handleSettingChange('analysisTimeout', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: colors.primary
                }}
              />
            </div>
          </div>
        </div>

        {/* History Settings Section */}
        <div style={{
          background: colors.background.primary,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: '16px',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 Geçmiş ve İstatistikler
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Save Analysis History */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.saveAnalysisHistory}
                onChange={(e) => handleSettingChange('saveAnalysisHistory', e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: colors.primary
                }}
              />
              <span style={{ fontSize: '14px', color: colors.text.primary }}>
                Analiz geçmişini kaydet
              </span>
            </label>

            {/* Max History Items */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text.primary,
                marginBottom: '8px'
              }}>
                Maksimum geçmiş öğesi: {settings.maxHistoryItems}
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={settings.maxHistoryItems}
                onChange={(e) => handleSettingChange('maxHistoryItems', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: colors.primary
                }}
                disabled={!settings.saveAnalysisHistory}
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings Section */}
        <div style={{
          background: colors.background.primary,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: '16px',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔧 Gelişmiş Ayarlar
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Enable Debug Mode */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.enableDebugMode}
                onChange={(e) => handleSettingChange('enableDebugMode', e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: colors.primary
                }}
              />
              <span style={{ fontSize: '14px', color: colors.text.primary }}>
                Debug modunu etkinleştir (Console logları)
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          paddingTop: '24px',
          borderTop: `1px solid ${colors.border}`
        }}>
          <button
            onClick={saveSettings}
            disabled={!unsavedChanges}
            style={{
              background: unsavedChanges ? colors.primary : colors.text.tertiary,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: unsavedChanges ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            💾 Ayarları Kaydet
          </button>

          <button
            onClick={resetToDefaults}
            style={{
              background: 'transparent',
              color: colors.text.secondary,
              border: `1px solid ${colors.border}`,
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            🔄 Varsayılana Sıfırla
          </button>
        </div>

        {/* Unsaved Changes Warning */}
        {unsavedChanges && (
          <div style={{
            background: isDark ? '#7c2d12' : '#fef3c7',
            border: `1px solid ${isDark ? '#ea580c' : '#f59e0b'}`,
            color: isDark ? '#fed7aa' : '#92400e',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            ⚠️ Kaydedilmemiş değişiklikler var. Ayarları kaydetmeyi unutmayın!
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;