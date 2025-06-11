// Popup utility functions
// WCAG 2.2-AA uyumlu yardımcı fonksiyonlar

import type { ElementAnalysis, AIProvider } from './types';

// Gelişmiş Markdown render fonksiyonu - WCAG 2.2-AA uyumlu
export const renderMarkdown = (text: string, isDark: boolean = false): string => {
  const colors = {
    background: isDark ? '#1e293b' : '#f8fafc',
    border: isDark ? '#475569' : '#e2e8f0',
    headerBg: isDark ? '#374151' : '#e2e8f0',
    text: isDark ? '#e2e8f0' : '#334155',
    headerText: isDark ? '#60a5fa' : '#1e40af',
    codeText: isDark ? '#fbbf24' : '#dc2626',
    linkColor: isDark ? '#60a5fa' : '#2563eb',
    quoteColor: isDark ? '#10b981' : '#059669'
  };

  return text
    // Headers with improved styling
    .replace(/#### (.*?)(\n|$)/g, `<h4 style="color: ${colors.headerText}; font-size: 15px; font-weight: 600; margin: 10px 0 6px 0; padding: 4px 0; border-bottom: 1px solid ${colors.border};">🔹 $1</h4>`)
    .replace(/### (.*?)(\n|$)/g, `<h3 style="color: ${colors.headerText}; font-size: 16px; font-weight: 600; margin: 12px 0 8px 0; padding: 6px 0; border-bottom: 2px solid ${colors.border};">📌 $1</h3>`)
    .replace(/## (.*?)(\n|$)/g, `<h2 style="color: ${colors.headerText}; font-size: 18px; font-weight: 600; margin: 16px 0 8px 0; padding: 8px 0; border-bottom: 2px solid ${colors.headerText};">🎯 $1</h2>`)
    .replace(/# (.*?)(\n|$)/g, `<h1 style="color: ${colors.headerText}; font-size: 20px; font-weight: 700; margin: 20px 0 12px 0; padding: 10px 0; border-bottom: 3px solid ${colors.headerText};">🏆 $1</h1>`)
    
    // Code blocks with syntax highlighting support
    .replace(/```(\w+)?\n([\s\S]*?)```/g, `<div style="background: ${colors.background}; border: 1px solid ${colors.border}; border-radius: 8px; margin: 12px 0; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><div style="background: ${colors.headerBg}; padding: 8px 12px; font-size: 12px; color: ${colors.text}; font-weight: 600; border-bottom: 1px solid ${colors.border}; display: flex; align-items: center; gap: 8px;"><span style="color: ${colors.codeText};">🏷️</span>$1 Kod Bloğu (Salt Okunur)</div><pre style="background: ${colors.background}; padding: 16px; margin: 0; overflow-x: auto; font-family: 'Fira Code', 'Monaco', 'Consolas', monospace; font-size: 13px; line-height: 1.5; color: ${colors.text}; user-select: text; -webkit-user-select: text; -moz-user-select: text; -ms-user-select: text; white-space: pre-wrap; word-wrap: break-word;"><code>$2</code></pre></div>`)
    
    // Inline code with better styling
    .replace(/`(.*?)`/g, `<code style="background: ${isDark ? '#374151' : '#f1f5f9'}; padding: 2px 6px; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 90%; color: ${colors.codeText}; user-select: text; -webkit-user-select: text; border: 1px solid ${colors.border};">$1</code>`)
    
    // Bold and italic with enhanced styling
    .replace(/\*\*(.*?)\*\*/g, `<strong style="font-weight: 700; color: ${colors.headerText};">$1</strong>`)
    .replace(/\*(.*?)\*/g, `<em style="font-style: italic; color: ${colors.text};">$1</em>`)
    
    // Links with accessibility support
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color: ${colors.linkColor}; text-decoration: underline; font-weight: 500;" target="_blank" rel="noopener noreferrer" aria-label="$1 - yeni sekmede açılır">$1</a>`)
    
    // Blockquotes
    .replace(/> (.*?)(\n|$)/g, `<blockquote style="border-left: 4px solid ${colors.quoteColor}; background: ${isDark ? '#1f2937' : '#f0f9ff'}; padding: 12px 16px; margin: 12px 0; color: ${colors.quoteColor}; font-style: italic; border-radius: 0 6px 6px 0;">💬 $1</blockquote>`)
    
    // Numbered lists
    .replace(/(\d+)\. (.*?)(\n|$)/g, '<li style="margin-bottom: 6px; padding-left: 4px;">$2</li>')
    .replace(/(<li.*?>.*?<\/li>)+/g, `<ol style="margin: 8px 0; padding-left: 24px; color: ${colors.text};">$&</ol>`)
    
    // Bullet lists with icons
    .replace(/- (.*?)(\n|$)/g, '<li style="margin-bottom: 6px; padding-left: 4px; list-style: none; position: relative;"><span style="position: absolute; left: -16px; color: #3b82f6;">•</span>$1</li>')
    .replace(/(<li.*?>.*?<\/li>)+/g, `<ul style="margin: 8px 0; padding-left: 20px; color: ${colors.text};">$&</ul>`)
    
    // Horizontal rules
    .replace(/---/g, `<hr style="border: none; height: 2px; background: linear-gradient(90deg, ${colors.border}, transparent); margin: 20px 0;">`)
    
    // Line breaks
    .replace(/\n/g, '<br>');
};

// AI analiz sonucu için panoya kopyalama fonksiyonu
export const copyAnalysisToClipboard = async (analysisText: string): Promise<boolean> => {
  try {
    // Markdown işaretlerini temizle ve düz metin haline getir
    const cleanText = analysisText
      .replace(/\*\*(.*?)\*\*/g, '$1') // **bold** -> bold
      .replace(/\*(.*?)\*/g, '$1') // *italic* -> italic
      .replace(/```[\s\S]*?```/g, (match) => {
        return match.replace(/```(\w+)?\n?/g, '').replace(/```/g, '');
      }) // code blocks
      .replace(/`(.*?)`/g, '$1') // `inline code`
      .replace(/### (.*?)(\n|$)/g, '$1\n') // ### headers
      .replace(/## (.*?)(\n|$)/g, '$1\n') // ## headers
      .replace(/- (.*?)(\n|$)/g, '• $1\n') // list items
      .trim();

    await navigator.clipboard.writeText(cleanText);
    return true;
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    return false;
  }
};

// HTML escape fonksiyonu - XSS koruması
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Element bilgisi formatlama
export const formatElementInfo = (analysis: ElementAnalysis): string => {
  return `${analysis.elementType}${analysis.elementId ? '#' + analysis.elementId : ''}${analysis.elementClass ? '.' + analysis.elementClass.split(' ')[0] : ''}`;
};

// AI sağlayıcı adı formatlama
export const getProviderName = (aiProvider: AIProvider, ollamaModel?: string): string => {
  switch (aiProvider) {
    case 'gemini':
      return 'Google Gemini Pro';
    case 'ollama':
      return `Ollama (${ollamaModel || 'llama3'})`;
    default:
      return 'Bilinmeyen';
  }
};

// Dosya adı oluşturma
export const generateFileName = (extension: 'txt' | 'html'): string => {
  return `wcag-analiz-${new Date().getTime()}.${extension}`;
};

// Tarih formatlama
export const formatTimestamp = (): string => {
  return new Date().toLocaleString('tr-TR');
};
