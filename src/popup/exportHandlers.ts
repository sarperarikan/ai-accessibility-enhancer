// Settings and utility handlers
// WCAG 2.2-AA uyumlu ayar ve yardımcı işlevler

import type { ElementAnalysis, AlertConfig } from './types';

// Ayarları kaydetme işlevi
export const handleSaveSettings = (
  geminiApiKey: string,
  geminiModel: string,
  setError: (error: string | null) => void,
  showAlert: (config: AlertConfig) => void
): void => {
  // Chrome extension API'si
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set(
      {
        geminiApiKey,
        geminiModel,
        aiProvider: 'gemini',
      },
      () => {
        setError(null);

        // Modern alert sistemi ile başarı bildirimi - WCAG 2.2-AA uyumlu
        showAlert({
          type: 'success',
          title: 'Ayarlar Kaydedildi',
          message: `🤖 AI Sağlayıcısı: Google Gemini (${geminiModel})\n🔑 API Anahtarı: ${geminiApiKey ? '✓ Yapılandırıldı' : '❌ Eksik'}\n🎯 Artık erişilebilirlik analizi yapabilirsiniz!`,
          duration: 4000,
        });
      }
    );
  } else {
    // Development ortamı için fallback
    setError(null);
    showAlert({
      type: 'success',
      title: 'Ayarlar Kaydedildi (Dev Mode)',
      message: `Settings saved in development mode`,
      duration: 3000,
    });
  }
};

// Analizleri temizleme işlevi
export const handleClearAnalyses = (
  setElementAnalyses: (analyses: ElementAnalysis[]) => void
): void => {
  setElementAnalyses([]);
  
  // Chrome storage'dan da temizle
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ elementAnalyses: [] });
  }
};

// Context menu bilgisi gösterme
export const handleShowContextMenuInfo = (
  setError: (error: string | null) => void
): void => {
  setError(
    '✅ Context menu aktif! Herhangi bir elementin üzerine sağ tıklayın ve "AI ile Denetle → Erişilebilirlik" seçeneğini seçin.'
  );
};