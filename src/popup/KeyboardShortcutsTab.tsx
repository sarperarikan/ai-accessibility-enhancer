// Keyboard Shortcuts Tab Component
// Kullanıcının kendi klavye kısayollarını özelleştirmesine olanak tanır
// WCAG 2.2-AA uyumlu erişilebilir tasarım

import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { useTheme } from './themeContext';
import { getThemedCommonStyles, generateButtonStyle } from './styles';
import type { AlertConfig } from './types';

interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  defaultKey: string;
  currentKey: string;
  action: string;
}

interface KeyboardShortcutsTabProps {
  showAlert: (config: AlertConfig) => void;
}

const KeyboardShortcutsTab: React.FC<KeyboardShortcutsTabProps> = ({ showAlert }) => {
  const { currentTheme } = useTheme();
  const commonStyles = getThemedCommonStyles(currentTheme === 'dark');
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([
    {
      id: '_execute_action',
      name: 'Extension Popup',
      description: 'Extension popup\'ını aç/kapat',
      defaultKey: 'Ctrl+Shift+A',
      currentKey: 'Ctrl+Shift+A',
      action: 'popup'
    },
    {
      id: 'analyze_element',
      name: 'Element Analizi',
      description: 'Seçili elementi analiz et',
      defaultKey: 'Ctrl+Shift+E',
      currentKey: 'Ctrl+Shift+E',
      action: 'analyze'
    },
    {
      id: 'quick_analysis',
      name: 'Hızlı Analiz',
      description: 'Sayfa geneli hızlı analiz',
      defaultKey: 'Ctrl+Shift+Q',
      currentKey: 'Ctrl+Shift+Q',
      action: 'quick'
    }
  ]);

  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [recordingKeys, setRecordingKeys] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<HTMLDivElement>(null);

  // Storage'dan kısayolları yükle
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['keyboardShortcuts']).then(result => {
        if (result.keyboardShortcuts) {
          setShortcuts(prev => prev.map(shortcut => ({
            ...shortcut,
            currentKey: result.keyboardShortcuts[shortcut.id] || shortcut.defaultKey
          })));
        }
      });
    }
  }, []);

  // Kısayol kaydını başlat
  const startRecording = (shortcutId: string) => {
    setEditingShortcut(shortcutId);
    setIsRecording(true);
    setRecordingKeys([]);
    
    // Focus'u recording area'ya ver
    setTimeout(() => {
      recordingRef.current?.focus();
    }, 100);
  };

  // Kısayol kaydını durdur
  const stopRecording = () => {
    setIsRecording(false);
    setEditingShortcut(null);
    setRecordingKeys([]);
  };

  // Klavye eventlerini dinle
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const keys: string[] = [];
    
    // Modifier keys
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.metaKey) keys.push('Cmd');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    
    // Ana tuş
    if (e.key && !['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) {
      keys.push(e.key.toUpperCase());
    }
    
    setRecordingKeys(keys);
  };

  // Klavye eventlerini tamamla
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (!isRecording || recordingKeys.length === 0) return;
    
    e.preventDefault();
    
    // En az bir modifier + bir ana tuş olmalı
    const modifiers = recordingKeys.filter(key => 
      ['Ctrl', 'Cmd', 'Alt', 'Shift'].includes(key)
    );
    const mainKeys = recordingKeys.filter(key => 
      !['Ctrl', 'Cmd', 'Alt', 'Shift'].includes(key)
    );
    
    if (modifiers.length > 0 && mainKeys.length > 0) {
      const newShortcut = recordingKeys.join('+');
      saveShortcut(editingShortcut!, newShortcut);
    }
    
    stopRecording();
  };

  // Kısayolu kaydet
  const saveShortcut = (shortcutId: string, newKey: string) => {
    // Çakışma kontrolü
    const conflictShortcut = shortcuts.find(s => 
      s.id !== shortcutId && s.currentKey === newKey
    );
    
    if (conflictShortcut) {
      showAlert({
        type: 'warning',
        title: '⚠️ Kısayol Çakışması',
        message: `Bu kısayol "${conflictShortcut.name}" tarafından kullanılıyor. Lütfen farklı bir kombinasyon deneyin.`,
        duration: 4000
      });
      return;
    }

    // Kısayolu güncelle
    const updatedShortcuts = shortcuts.map(shortcut => 
      shortcut.id === shortcutId 
        ? { ...shortcut, currentKey: newKey }
        : shortcut
    );
    
    setShortcuts(updatedShortcuts);
    
    // Storage'a kaydet
    const shortcutsMap = updatedShortcuts.reduce((acc, shortcut) => {
      acc[shortcut.id] = shortcut.currentKey;
      return acc;
    }, {} as Record<string, string>);
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ keyboardShortcuts: shortcutsMap });
    }
    
    showAlert({
      type: 'success',
      title: '✅ Kısayol Güncellendi',
      message: `"${shortcuts.find(s => s.id === shortcutId)?.name}" kısayolu ${newKey} olarak ayarlandı.`,
      duration: 3000
    });

    // Chrome commands API'sini güncelle (Chrome 110+)
    if (typeof chrome !== 'undefined' && chrome.commands) {
      try {
        // Chrome extension API'sinde update method yoksa getAll kullan
        chrome.commands.getAll((commands) => {
          console.log('Mevcut kısayollar:', commands);
          // Not: Chrome API limitations - runtime'da kısayol değiştirme kısıtlı
          // Kullanıcı chrome://extensions/shortcuts adresinden manuel değiştirmeli
        });
      } catch (error) {
        console.warn('Chrome commands API hatası:', error);
      }
    }
  };

  // Varsayılana sıfırla
  const resetToDefault = (shortcutId: string) => {
    const shortcut = shortcuts.find(s => s.id === shortcutId);
    if (shortcut) {
      saveShortcut(shortcutId, shortcut.defaultKey);
    }
  };

  // Tüm kısayolları sıfırla
  const resetAllShortcuts = () => {
    const resetShortcuts = shortcuts.map(shortcut => ({
      ...shortcut,
      currentKey: shortcut.defaultKey
    }));
    
    setShortcuts(resetShortcuts);
    
    const shortcutsMap = resetShortcuts.reduce((acc, shortcut) => {
      acc[shortcut.id] = shortcut.defaultKey;
      return acc;
    }, {} as Record<string, string>);
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ keyboardShortcuts: shortcutsMap });
    }
    
    showAlert({
      type: 'success',
      title: '✅ Kısayollar Sıfırlandı',
      message: 'Tüm klavye kısayolları varsayılan değerlerine döndürüldü.',
      duration: 3000
    });
  };

  return (
    <div 
      style={{ padding: '24px', ...commonStyles.animations.fadeIn }}
      role="tabpanel"
      aria-labelledby="shortcuts-tab"
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={commonStyles.iconContainer(64, commonStyles.gradients.purple)}>
          <Icons.Keyboard />
        </div>
        <h2 
          style={commonStyles.text.heading}
          id="shortcuts-heading"
        >
          Klavye Kısayolları
        </h2>
        <p style={commonStyles.text.subheading}>
          Kendi kısayol kombinasyonlarınızı oluşturun
        </p>
      </div>

      {/* Kısayol Listesi */}
      <div style={{ ...commonStyles.card, marginBottom: '24px' }}>
        <div style={commonStyles.sectionHeader}>
          <Icons.Settings />
          <h3 style={{
            fontWeight: '600',
            color: commonStyles.colors.text.primary,
            marginLeft: '8px',
            margin: 0,
          }}>
            Mevcut Kısayollar
          </h3>
        </div>

        <div 
          style={{ marginTop: '20px' }}
          role="list"
          aria-label="Klavye kısayolları listesi"
        >
          {shortcuts.map((shortcut, index) => (
            <div
              key={shortcut.id}
              style={{
                padding: '16px',
                border: `1px solid ${commonStyles.colors.border}`,
                borderRadius: '8px',
                marginBottom: '12px',
                background: editingShortcut === shortcut.id 
                  ? (currentTheme === 'dark' ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.05)')
                  : commonStyles.colors.background.secondary,
                transition: 'all 0.2s ease'
              }}
              role="listitem"
              aria-labelledby={`shortcut-name-${index}`}
              aria-describedby={`shortcut-desc-${index}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 
                    id={`shortcut-name-${index}`}
                    style={{
                      fontWeight: '600',
                      color: commonStyles.colors.text.primary,
                      marginBottom: '4px',
                      fontSize: '16px'
                    }}
                  >
                    {shortcut.name}
                  </h4>
                  <p 
                    id={`shortcut-desc-${index}`}
                    style={{
                      color: commonStyles.colors.text.secondary,
                      fontSize: '14px',
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}
                  >
                    {shortcut.description}
                  </p>
                  
                  {/* Kısayol gösterimi */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      color: commonStyles.colors.text.secondary,
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      Mevcut:
                    </span>
                    <code style={{
                      background: currentTheme === 'dark' ? '#374151' : '#f3f4f6',
                      color: commonStyles.colors.text.primary,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      fontWeight: '600'
                    }}>
                      {editingShortcut === shortcut.id && isRecording 
                        ? (recordingKeys.length > 0 ? recordingKeys.join(' + ') : 'Tuşlara basın...')
                        : shortcut.currentKey
                      }
                    </code>
                  </div>
                </div>

                {/* Aksiyon butonları */}
                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                  {editingShortcut === shortcut.id ? (
                    <>
                      <button
                        onClick={stopRecording}
                        style={{
                          ...generateButtonStyle('secondary', currentTheme === 'dark'),
                          fontSize: '12px',
                          padding: '6px 12px'
                        }}
                        aria-label="Kısayol kaydını iptal et"
                      >
                        ❌ İptal
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startRecording(shortcut.id)}
                        style={{
                          ...generateButtonStyle('primary', currentTheme === 'dark'),
                          fontSize: '12px',
                          padding: '6px 12px'
                        }}
                        aria-label={`${shortcut.name} kısayolunu değiştir`}
                      >
                        ✏️ Değiştir
                      </button>
                      <button
                        onClick={() => resetToDefault(shortcut.id)}
                        style={{
                          ...generateButtonStyle('secondary', currentTheme === 'dark'),
                          fontSize: '12px',
                          padding: '6px 12px'
                        }}
                        aria-label={`${shortcut.name} kısayolunu varsayılana sıfırla`}
                        disabled={shortcut.currentKey === shortcut.defaultKey}
                      >
                        🔄 Sıfırla
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Kayıt alanı */}
        {isRecording && (
          <div
            ref={recordingRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            style={{
              marginTop: '16px',
              padding: '20px',
              border: `2px dashed ${commonStyles.colors.primary}`,
              borderRadius: '8px',
              background: currentTheme === 'dark' 
                ? 'rgba(147, 51, 234, 0.1)' 
                : 'rgba(147, 51, 234, 0.05)',
              textAlign: 'center',
              outline: 'none'
            }}
            role="textbox"
            aria-label="Klavye kısayolu kaydetme alanı"
            aria-live="polite"
            aria-atomic="true"
          >
            <div style={{
              color: commonStyles.colors.primary,
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              🎹 Yeni kısayol kombinasyonunu girin
            </div>
            <div style={{
              color: commonStyles.colors.text.secondary,
              fontSize: '14px'
            }}>
              {recordingKeys.length > 0 
                ? `Kaydediliyor: ${recordingKeys.join(' + ')}`
                : 'Ctrl/Cmd + Shift + istediğiniz tuşa basın'
              }
            </div>
          </div>
        )}

        {/* Alt butonlar */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={resetAllShortcuts}
            style={{
              ...generateButtonStyle('danger', currentTheme === 'dark'),
              fontSize: '14px',
              padding: '8px 16px'
            }}
            aria-label="Tüm kısayolları varsayılana sıfırla"
          >
            🔄 Tümünü Sıfırla
          </button>
          
          <div style={{
            fontSize: '12px',
            color: commonStyles.colors.text.secondary
          }}>
            💡 İpucu: Ctrl/Cmd + Shift + harf kombinasyonları önerilir
          </div>
        </div>
      </div>

      {/* Kullanım Rehberi */}
      <div style={{ ...commonStyles.card }}>
        <div style={commonStyles.sectionHeader}>
          <Icons.Info />
          <h3 style={{
            fontWeight: '600',
            color: commonStyles.colors.text.primary,
            marginLeft: '8px',
            margin: 0,
          }}>
            Kullanım Rehberi
          </h3>
        </div>

        <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: commonStyles.colors.text.primary }}>🎹 Kısayol Oluşturma:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px', color: commonStyles.colors.text.secondary }}>
              <li>"Değiştir" butonuna tıklayın</li>
              <li>Mavi alana odaklanın</li>
              <li>Istediğiniz kombinasyonu basın (örn: Ctrl+Shift+X)</li>
              <li>Tuşları bırakın, otomatik kaydedilir</li>
            </ul>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: commonStyles.colors.text.primary }}>⚠️ Öneriler:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px', color: commonStyles.colors.text.secondary }}>
              <li>Ctrl/Cmd + Shift + tek harf kombinasyonları kullanın</li>
              <li>F1-F12 tuşları diğer uygulamalarla çakışabilir</li>
              <li>Alt tuşu bazı sistemlerde menüleri açar</li>
              <li>Windows: Ctrl, Mac: Cmd kullanımı önerilir</li>
            </ul>
          </div>

          <div>
            <strong style={{ color: commonStyles.colors.text.primary }}>🔧 Sorun Giderme:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px', color: commonStyles.colors.text.secondary }}>
              <li>Kısayol çalışmıyorsa Chrome'u yeniden başlatın</li>
              <li>Çakışan kısayollar otomatik olarak uyarı verir</li>
              <li>chrome://extensions/shortcuts adresinden de yönetilebilir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsTab;