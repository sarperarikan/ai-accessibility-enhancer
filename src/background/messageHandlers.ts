/**
 * Message Handlers - Chrome extension message processing
 * @license MIT License
 * Copyright (c) 2024
 * WCAG 2.2 AA compliant message handling for Chrome extension
 *
 * This module handles all extension messaging in a type-safe way,
 * ensuring WCAG 2.2 AA compliance in error handling and user feedback.
 */

// Define message type interfaces for type safety
interface AnalyzeElementMessage {
  type: 'ANALYZE_ELEMENT';
  element?: {
    html: string;
    accessibleName: string;
    role: string;
  };
}

interface GeminiTestMessage {
  type: 'TEST_GEMINI_API';
  apiKey: string;
  model: string;
}

interface GeminiModelsMessage {
  type: 'FETCH_GEMINI_MODELS';
}

interface GlobalErrorMessage {
  type: 'GLOBAL_ERROR';
  error: string;
}

type ChromeMessage =
  | AnalyzeElementMessage
  | GeminiTestMessage
  | GeminiModelsMessage
  | GlobalErrorMessage
  | { type: 'AI_ACCESSIBILITY_INIT_SUCCESS' }
  | { type: 'TEST_CONTEXT_MENU' }
  | { type: 'SHOW_WCAG_MODAL'; forceProvider?: string }
  | { type: 'CONTEXT_MENU_DEBUG'; elementInfo?: string; timestamp?: number }
  | { type: 'OPEN_EXTENSION_POPUP' };

import {
  callGeminiAPI,
  fetchGeminiModels,
  testGeminiConnection
} from './apiHandlers.js';

import { 
  createAnalysisPrompt, 
  validateSettings, 
  createErrorResponse, 
  createSuccessResponse,
  debugLog 
} from './utils.js';

/**
 * Gemini model listesi handler'ı
 */
export function handleFetchGeminiModels(message: GeminiModelsMessage, sendResponse: (response: any) => void) {
  // API key'i storage'dan al
  chrome.storage.local.get(['geminiApiKey']).then(settings => {
    const apiKey = settings.geminiApiKey;
    
    fetchGeminiModels(apiKey)
      .then(models => {
        sendResponse({
          success: true,
          models: models
        });
      })
      .catch(error => {
        console.error('Failed to fetch Gemini models:', error);
        sendResponse({
          success: false,
          error: `Gemini modelleri alınamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
        });
      });
  }).catch(error => {
    console.error('Storage error while fetching models:', error);
    // Fallback: API key olmadan varsayılan modelleri döndür
    fetchGeminiModels()
      .then(models => {
        sendResponse({
          success: true,
          models: models
        });
      })
      .catch(fetchError => {
        sendResponse({
          success: false,
          error: `Gemini modelleri alınamadı: ${fetchError instanceof Error ? fetchError.message : 'Bilinmeyen hata'}`
        });
      });
  });
}

/**
 * Element analizi handler'ı
 */
export function handleElementAnalysis(message: AnalyzeElementMessage, sendResponse: (response: any) => void) {
  debugLog('Starting element analysis...', message);

  // Ayarları al
  chrome.storage.local.get([
    'geminiApiKey',
    'geminiModel'
  ]).then(settings => {
    debugLog('Active AI provider: gemini');

    // Ayarları doğrula - sadece Gemini için
    const validation = validateSettings(settings, 'gemini');
    if (!validation.isValid) {
      sendResponse(createErrorResponse(validation.error!));
      return;
    }

    // Prompt oluştur
    const prompt = createAnalysisPrompt(message);
    debugLog('Generated prompt length:', prompt.length);

    // Gemini analizi yap
    if (settings.geminiApiKey) {
      const selectedModel = settings.geminiModel || 'gemini-2.5-flash';
      callGeminiAPI(settings.geminiApiKey, prompt, selectedModel)
        .then(analysis => {
          const response = createSuccessResponse(analysis, 'gemini', false);
          sendResponse(response);
          
          // Analiz sonucunu popup'a da gönder
          const elementData = message as any;
          chrome.runtime.sendMessage({
            type: 'ELEMENT_ANALYSIS_RESULT',
            elementType: elementData.tagName || 'unknown',
            elementId: elementData.id,
            elementClass: elementData.className,
            elementSelector: elementData.id ? `#${elementData.id}` :
                           elementData.className ? `.${elementData.className.split(' ')[0]}` :
                           elementData.tagName?.toLowerCase(),
            analysis: analysis,
            htmlContent: elementData.elementHTML,
            timestamp: new Date().toLocaleString('tr-TR'),
            suggestions: [], // Bu kısım AI yanıtından çıkarılabilir
            wcagCriteria: [] // Bu kısım AI yanıtından çıkarılabilir
          }).catch(err => {
            console.log('Popup mesajı gönderilemedi (popup kapalı olabilir):', err);
          });
        })
        .catch(error => {
          console.error('🚨 Element analysis error:', error);
          sendResponse(createErrorResponse(
            `Analiz sırasında hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
          ));
        });
    } else {
      const errorMessage = 'Gemini analizi yapılamadı. API anahtarını ayarlardan girin.';
      debugLog('AI analysis failed - no API key', settings);
      sendResponse(createErrorResponse(errorMessage));
    }
  }).catch(error => {
    console.error('Storage error:', error);
    sendResponse(createErrorResponse('Ayarlar alınamadı.'));
  });
}

/**
 * Gemini API test handler'ı
 */
export function handleGeminiAPITest(message: GeminiTestMessage, sendResponse: (response: any) => void) {
  const { apiKey, model } = message;
  
  if (!apiKey) {
    sendResponse({
      success: false,
      error: 'API anahtarı boş olamaz',
      message: '❌ Gemini API anahtarı gerekli'
    });
    return;
  }

  // Test bağlantısını yap
  testGeminiConnection(apiKey, model)
    .then(result => {
      sendResponse(result);
    })
    .catch(error => {
      console.error('Gemini API test error:', error);
      sendResponse({
        success: false,
        error: `Gemini API testi başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        message: '❌ Gemini API bağlantısı başarısız',
        troubleshooting: [
          '1. API anahtarınızı kontrol edin',
          '2. İnternet bağlantınızı kontrol edin',
          '3. Google AI Studio\'dan yeni anahtar alın',
          '4. API limitlerini kontrol edin'
        ]
      });
    });
}

/**
 * Handler response type for all message handlers
 */
type HandlerResponse = {
  success: boolean;
  error?: string;
  message?: string;
  models?: string[];
  troubleshooting?: string[];
  elementInfo?: string;
  timestamp?: number;
};

// Type guard functions for message validation
function isAnalyzeElementMessage(msg: ChromeMessage): msg is AnalyzeElementMessage {
  return msg.type === 'ANALYZE_ELEMENT';
}

function isGeminiTestMessage(msg: ChromeMessage): msg is GeminiTestMessage {
  return msg.type === 'TEST_GEMINI_API';
}

function isGeminiModelsMessage(msg: ChromeMessage): msg is GeminiModelsMessage {
  return msg.type === 'FETCH_GEMINI_MODELS';
}

function isGlobalErrorMessage(msg: ChromeMessage): msg is GlobalErrorMessage {
  return msg.type === 'GLOBAL_ERROR';
}

/**
 * Main message router for handling all extension messages
 * @param message - The incoming message
 * @param sender - The sender of the message
 * @param sendResponse - Callback to send response
 * @returns boolean indicating if response will be sent asynchronously
 */
export function handleMessage(
  message: ChromeMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: HandlerResponse) => void
): boolean {
  debugLog('Received message:', message.type);

  switch (message.type) {
    case 'AI_ACCESSIBILITY_INIT_SUCCESS':
      debugLog('Content script initialized successfully');
      return false;

    case 'ANALYZE_ELEMENT':
      if (isAnalyzeElementMessage(message)) {
        handleElementAnalysis(message, sendResponse);
      } else {
        sendResponse({ success: false, error: 'Invalid ANALYZE_ELEMENT message format' });
      }
      return true;

    case 'TEST_GEMINI_API':
      if (isGeminiTestMessage(message)) {
        handleGeminiAPITest(message, sendResponse);
      } else {
        sendResponse({ success: false, error: 'Invalid TEST_GEMINI_API message format' });
      }
      return true;

    case 'FETCH_GEMINI_MODELS':
      if (isGeminiModelsMessage(message)) {
        handleFetchGeminiModels(message, sendResponse);
      } else {
        sendResponse({ success: false, error: 'Invalid FETCH_GEMINI_MODELS message format' });
      }
      return true;

    case 'GLOBAL_ERROR':
      if (isGlobalErrorMessage(message)) {
        console.error('🚨 Global error from content script:', message.error);
      } else {
        console.error('🚨 Invalid GLOBAL_ERROR message format');
      }
      return false;

    case 'TEST_CONTEXT_MENU':
      debugLog('Context menu test requested');
      sendResponse({
        success: true,
        message: 'Context menu sistemi çalışıyor'
      });
      return false;

    case 'SHOW_WCAG_MODAL':
      debugLog('Manual WCAG modal request from test page');
      
      // Aktif tab'ı al ve content script'e mesaj gönder
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'SHOW_WCAG_MODAL',
            forceProvider: (message as any).forceProvider || 'gemini'
          }, (_response) => {
            if (chrome.runtime.lastError) {
              sendResponse({
                success: false,
                error: chrome.runtime.lastError.message
              });
            } else {
              sendResponse({
                success: true,
                message: 'Modal açma isteği gönderildi'
              });
            }
          });
        } else {
          sendResponse({
            success: false,
            error: 'Aktif tab bulunamadı'
          });
        }
      });
      return true;

    case 'CONTEXT_MENU_DEBUG': {
      debugLog('Context menu debug request received');
      const debugMessage = message as { type: 'CONTEXT_MENU_DEBUG'; elementInfo?: string; timestamp?: number };
      
      // Context menu'ların oluşturulup oluşturulmadığını kontrol et
      chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
          id: 'ai-accessibility-analyze',
          title: 'Erişilebilirlik Analizi',
          contexts: ['all']
        }, () => {
          if (chrome.runtime.lastError) {
            debugLog('Context menu creation failed:', chrome.runtime.lastError.message);
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
              message: 'Context menu oluşturulamadı'
            });
          } else {
            debugLog('Context menu recreated successfully');
            sendResponse({
              success: true,
              message: 'Context menu yeniden oluşturuldu',
              elementInfo: debugMessage.elementInfo,
              timestamp: debugMessage.timestamp
            });
          }
        });
      });
      return true;
    }

    case 'OPEN_EXTENSION_POPUP':
      debugLog('Extension popup açma isteği alındı');
      
      // Extension popup'ını aç (Chrome action API)
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          // Chrome.action.openPopup sadece user gesture ile çalışır
          // Bu yüzden kullanıcıya extension ikonuna tıklamasını söyleyen bir bildirim gösterelim
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'SHOW_EXTENSION_POPUP_HINT'
          }, (_response) => {
            sendResponse({
              success: true,
              message: 'Popup açma ipucu gösterildi'
            });
          });
        } else {
          sendResponse({
            success: false,
            error: 'Aktif tab bulunamadı'
          });
        }
      });
      return true;

    default: {
      // Handle unknown message types
      const unknownMessage = message as { type: string };
      const errorMessage = `Bilinmeyen mesaj tipi: ${unknownMessage.type}`;
      debugLog('Error:', errorMessage);
      sendResponse({
        success: false,
        error: errorMessage
      });
      return false;
    }
  }
}