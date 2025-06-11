/**
 * AI Accessibility Enhancer - Background Script (Modular)
 * Modern AI-powered accessibility analysis system
 *
 * Features:
 * - Context menu with AI provider selection
 * - Gemini and Ollama API integration
 * - Smart provider switching
 * - Connection testing
 * - Error handling
 *
 * MIT License
 */

import { createContextMenus, handleContextMenuClick, recreateContextMenus } from './contextMenuHandlers.js';
import { handleMessage } from './messageHandlers.js';
import { debugLog } from './utils.js';

/**
 * Extension kurulum
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  debugLog('Extension installed/updated', details);
  
  try {
    // Context menu'ları oluştur
    await createContextMenus();
    debugLog('Context menus created successfully');

    // Varsayılan ayarları kontrol et
    const settings = await chrome.storage.local.get([
      'aiProvider',
      'geminiApiKey',
      'ollamaUrl',
      'ollamaModel',
    ]);

    // İlk kurulumda varsayılan değerleri ayarla
    if (!settings.aiProvider) {
      await chrome.storage.local.set({
        aiProvider: 'gemini',
        ollamaUrl: 'http://localhost:11434',
        ollamaModel: 'llama3',
      });
      debugLog('Default settings initialized');
    }

    debugLog('Extension ready with settings:', settings);

  } catch (error) {
    console.error('🚨 Extension installation error:', error);
  }
});

/**
 * Extension başlangıç
 */
chrome.runtime.onStartup.addListener(async () => {
  debugLog('Extension startup');
  
  try {
    await recreateContextMenus();
    debugLog('Context menus recreated on startup');
  } catch (error) {
    console.error('🚨 Extension startup error:', error);
  }
});

/**
 * Context menu tıklama handler'ı
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  debugLog('Context menu clicked:', info.menuItemId);
  handleContextMenuClick(info, tab);
});

/**
 * Mesaj dinleyici
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  return handleMessage(message, sender, sendResponse);
});

/**
 * Klavye kısayolu dinleyici
 */
chrome.commands.onCommand.addListener((command) => {
  debugLog('Keyboard shortcut triggered:', command);
  
  switch (command) {
    case 'analyze_element':
      // Aktif tab'da element analizi başlat
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'SHOW_WCAG_MODAL',
            forceProvider: 'gemini',
            triggered: 'keyboard_shortcut'
          }, (response) => {
            if (chrome.runtime.lastError) {
              debugLog('Keyboard shortcut modal failed:', chrome.runtime.lastError.message);
            } else {
              debugLog('Keyboard shortcut modal opened:', response);
            }
          });
        }
      });
      break;
      
    case 'quick_analysis':
      // Hızlı sayfa analizi
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'QUICK_PAGE_ANALYSIS',
            triggered: 'keyboard_shortcut'
          }, (response) => {
            debugLog('Quick analysis triggered:', response);
          });
        }
      });
      break;
      
    default:
      debugLog('Unknown keyboard command:', command);
  }
});

/**
 * Tab güncelleme dinleyici
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Sayfa tamamen yüklendiğinde content script'i inject et
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    debugLog('Tab updated, injecting content script if needed:', tab.url);
    
    // Content script'in zaten yüklü olup olmadığını kontrol et
    chrome.tabs.sendMessage(tabId, { type: 'PING' }, (_response) => {
      if (chrome.runtime.lastError) {
        // Content script yüklü değil, inject et
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['src/content/content.js'] // Build edilmiş dosya yolunu kullan
        }).catch(error => {
          // Injection başarısız (chrome:// sayfaları vb.)
          debugLog('Content script injection failed:', error.message);
        });
      }
    });
  }
});

/**
 * Extension icon tıklama handler'ı
 */
chrome.action.onClicked.addListener((_tab) => {
  debugLog('Extension icon clicked');
  // Popup otomatik açılacak, ekstra işlem gerekmiyor
});

/**
 * Ayarlar değişikliği dinleyici
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    debugLog('Settings changed:', changes);
    
    // Context menu'ları yeniden oluştur (dil değişikliği için)
    if (changes.language) {
      recreateContextMenus();
    }
  }
});

/**
 * Global hata yakalayıcı
 */
self.addEventListener('error', (event) => {
  console.error('🚨 Background script global error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Background script unhandled promise rejection:', event.reason);
});

debugLog('Background script loaded successfully');
console.log('🚀 AI Accessibility Enhancer Background v2.2.0 ready');
