// AI Accessibility Enhancer - Simple i18n system
export function getBrowserLanguage(): string {
  const lang = navigator.language || 'en';
  return lang.startsWith('tr') ? 'tr' : 'en';
}

export function t(key: string): string {
  const lang = getBrowserLanguage();
  const translations: Record<string, Record<string, string>> = {
    en: {
      'contextMenu.analyze': 'Accessibility Check',
      'modal.title': '🤖 AI Accessibility Analysis',
      'modal.loading': '🤖 AI Analysis in Progress',
      'modal.close': 'Close',
      'modal.elementStructure': '📋 Element Structure',
      'modal.aiRecommendations': '🤖 AI Recommendations',
      'modal.htmlCode': 'HTML Code:',
      'modal.exportTxt': 'Export TXT',
      'modal.exportHtml': 'Export HTML',
    },
    tr: {
      'contextMenu.analyze': 'Erişilebilirlik Denetimi',
      'modal.title': '🤖 AI Erişilebilirlik Analizi',
      'modal.loading': '🤖 AI Analizi Devam Ediyor',
      'modal.close': 'Kapat',
      'modal.elementStructure': '📋 Element Yapısı',
      'modal.aiRecommendations': '🤖 Yapay Zeka Önerileri',
      'modal.htmlCode': 'HTML Kodu:',
      'modal.exportTxt': 'TXT Dışa Aktar',
      'modal.exportHtml': 'HTML Dışa Aktar',
    },
  };

  return translations[lang]?.[key] || translations['en'][key] || key;
}
