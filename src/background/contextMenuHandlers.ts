// Context Menu Handlers - Right-click menu management
// MIT License

import { getBrowserLanguage } from '../utils/i18n.js';

/**
 * Context menu oluşturma fonksiyonu
 */
export async function createContextMenus() {
  const lang = getBrowserLanguage();
  const title = lang === 'tr' ? 'Erişilebilirlik Analizini Başlat' : 'Start Accessibility Analysis';
  
  console.log('🎯 Context menu creating...', title, 'Language:', lang);

  try {
    // Önce tüm context menu'ları temizle
    await chrome.contextMenus.removeAll();
    console.log('✅ Existing context menus cleared');

    // Tek erişilebilirlik analizi menüsü oluştur
    const menuId = await chrome.contextMenus.create({
      id: 'ai-accessibility-analyze',
      title: title,
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    });
    
    console.log('✅ Context menu created successfully:', menuId);
    return true;
  } catch (error) {
    console.error('❌ Context menu creation failed:', error);
    return false;
  }
}

/**
 * Context menu tıklama handler'ı
 */
export function handleContextMenuClick(info: any, tab: any) {
  console.log('🎯 CONTEXT MENU CLICKED:', {
    menuItemId: info.menuItemId,
    tabId: tab?.id,
    tabUrl: tab?.url,
    timestamp: new Date().toISOString()
  });
  
  if (!tab?.id) {
    console.error('❌ No tab ID available for context menu action');
    return;
  }

  // Chrome internal pages check
  if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))) {
    console.warn('⚠️ Cannot inject content script into Chrome internal page:', tab.url);
    return;
  }

  switch (info.menuItemId) {
    case 'ai-accessibility-analyze':
      console.log('📋 STARTING ACCESSIBILITY ANALYSIS for tab:', tab.id, 'URL:', tab.url);
      
      // İlk önce content script'in yüklü olup olmadığını kontrol et
      chrome.tabs.sendMessage(tab.id, { type: 'PING' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('⚠️ Content script not found, injecting...', {
            error: chrome.runtime.lastError.message,
            tabId: tab.id,
            tabUrl: tab.url
          });
          
          // Content script'i yükle - düzeltilmiş dosya yolu
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['src/content/content.js'] // Build edilmiş dosya yolunu kullan
          }).then(() => {
            console.log('✅ Content script SUCCESSFULLY INJECTED for tab:', tab.id);
            
            // Daha uzun bekleme süresi ve modal'ı direkt aç
            setTimeout(() => {
              console.log('🎯 Attempting to open WCAG modal...');
              chrome.tabs.sendMessage(tab.id, {
                type: 'SHOW_WCAG_MODAL',
                forceProvider: 'gemini',
              }, (modalResponse) => {
                if (chrome.runtime.lastError) {
                  console.error('❌ MODAL OPEN FAILED:', chrome.runtime.lastError.message);
                } else {
                  console.log('✅ MODAL OPENED SUCCESSFULLY:', modalResponse);
                }
              });
            }, 1000); // Increased timeout for better reliability
          }).catch(error => {
            console.error('❌ FAILED TO INJECT CONTENT SCRIPT:', {
              error: error.message,
              tabId: tab.id,
              tabUrl: tab.url
            });
            
            // Fallback: Manifest'te tanımlı content script varsa direkt mesaj gönder
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, {
                type: 'SHOW_WCAG_MODAL',
                forceProvider: 'gemini',
              }, (modalResponse) => {
                if (chrome.runtime.lastError) {
                  console.error('❌ FALLBACK MODAL OPEN FAILED:', chrome.runtime.lastError.message);
                } else {
                  console.log('✅ FALLBACK MODAL OPENED SUCCESSFULLY:', modalResponse);
                }
              });
            }, 500);
          });
        } else {
          console.log('✅ Content script ALREADY LOADED, opening modal directly...', {
            response,
            tabId: tab.id
          });
          
          // Content script zaten yüklü, direkt modal'ı aç
          chrome.tabs.sendMessage(tab.id, {
            type: 'SHOW_WCAG_MODAL',
            forceProvider: 'gemini',
          }, (modalResponse) => {
            if (chrome.runtime.lastError) {
              console.error('❌ DIRECT MODAL OPEN FAILED:', chrome.runtime.lastError.message);
            } else {
              console.log('✅ DIRECT MODAL OPENED SUCCESSFULLY:', modalResponse);
            }
          });
        }
      });
      break;
      
    default:
      console.warn('⚠️ UNKNOWN MENU ITEM CLICKED:', info.menuItemId);
  }
}

/**
 * Context menu'ları yeniden oluştur
 */
export async function recreateContextMenus() {
  try {
    await chrome.contextMenus.removeAll();
    await createContextMenus();
    console.log('✅ Context menus recreated');
  } catch (error) {
    console.error('❌ Failed to recreate context menus:', error);
  }
}