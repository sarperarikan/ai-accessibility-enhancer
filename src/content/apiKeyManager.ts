/**
 * API Key Management Module
 * WCAG 2.2-AA compliant API key validation and modal management
 * 
 * WCAG Compliance:
 * - SC 2.4.3: Focus Order - Proper focus management in modals
 * - SC 4.1.2: Name, Role, Value - Semantic modal structure
 * - SC 1.4.3: Contrast (Minimum) - Accessible color contrasts
 * - SC 2.1.1: Keyboard - Full keyboard accessibility
 * 
 * MIT License
 */

/**
 * Checks if API key exists and is valid
 * @returns Promise with key status and value
 */
export async function checkAPIKey(): Promise<{ hasKey: boolean; apiKey?: string }> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['geminiApiKey'], (result) => {
      const apiKey = result.geminiApiKey;
      const hasKey = !!(apiKey && apiKey.trim() && apiKey.length > 10);
      resolve({ hasKey, apiKey });
    });
  });
}

/**
 * Shows API key warning modal with accessibility features
 */
export function showAPIKeyModal(): void {
  // Mevcut modal'ları temizle
  const existingModal = document.getElementById('api-key-warning-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'api-key-warning-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'api-key-modal-title');
  modal.setAttribute('aria-describedby', 'api-key-modal-description');

  modal.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0,0,0,0.8) !important;
    z-index: 999999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  `;

  modal.innerHTML = `
    <div style="background: white; max-width: 500px; width: 90vw; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
      <header style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 24px; text-align: center;">
        <h2 id="api-key-modal-title" style="font-size: 24px; font-weight: bold; margin: 0;">
          🔑 API Anahtarı Gerekli
        </h2>
      </header>
      
      <main style="padding: 32px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <div style="width: 80px; height: 80px; background: #fef2f2; border: 3px solid #fecaca; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 36px;">
            ⚠️
          </div>
          <h3 id="api-key-modal-description" style="font-size: 20px; color: #1f2937; margin: 0 0 16px;">
            AI Analizi Başlatılamıyor
          </h3>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
            AI tabanlı erişilebilirlik analizi için <strong>Google Gemini API anahtarı</strong> gereklidir.
            Lütfen önce extension ayarlarından API anahtarınızı girin.
          </p>
        </div>

        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left;">
          <h4 style="font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 12px;">
            📋 API Anahtarı Nasıl Alınır:
          </h4>
          <ol style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.6;">
            <li>
              <a href="https://makersuite.google.com/app/apikey"
                 target="_blank"
                 rel="noopener noreferrer"
                 style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                Google AI Studio
              </a> sayfasına gidin
            </li>
            <li>Google hesabınızla giriş yapın</li>
            <li>"Create API Key" butonuna tıklayın</li>
            <li>API anahtarını kopyalayın</li>
            <li>Extension popup'ındaki "Gemini AI Ayarları" sekmesine yapıştırın</li>
          </ol>
        </div>

        <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
          <button id="open-extension-settings"
                  style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 500;">
            ⚙️ Extension Ayarları
          </button>
          <button id="close-api-key-modal"
                  style="background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 500;">
            ❌ Kapat
          </button>
        </div>
      </main>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  const closeBtn = modal.querySelector('#close-api-key-modal') as HTMLButtonElement;
  const settingsBtn = modal.querySelector('#open-extension-settings') as HTMLButtonElement;

  const closeModal = () => {
    modal.remove();
  };

  closeBtn?.addEventListener('click', closeModal);
  settingsBtn?.addEventListener('click', () => {
    // Extension popup'ını aç
    chrome.runtime.sendMessage({ type: 'OPEN_EXTENSION_POPUP' });
    closeModal();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  // Focus yönetimi
  setTimeout(() => {
    settingsBtn?.focus();
  }, 100);
}

/**
 * Shows extension popup hint notification
 */
export function showExtensionPopupHint(): void {
  const notification = document.createElement('div');
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', 'polite');
  notification.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
    color: white !important;
    padding: 16px 20px !important;
    border-radius: 8px !important;
    z-index: 100001 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    max-width: 300px !important;
    border: 2px solid #60a5fa !important;
    animation: popup-hint-pulse 2s ease-in-out infinite !important;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="font-size: 24px;">⚙️</div>
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">Extension Ayarları</div>
        <div style="font-size: 12px; opacity: 0.9;">
          Sağ üst köşedeki extension ikonuna tıklayın
        </div>
      </div>
    </div>
  `;

  // CSS animation ekle
  const style = document.createElement('style');
  style.textContent = `
    @keyframes popup-hint-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // 5 saniye sonra kaldır
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 300);
  }, 5000);
}