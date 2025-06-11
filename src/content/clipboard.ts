/**
 * Clipboard Operations Module
 * WCAG 2.2-AA compliant clipboard management
 * 
 * WCAG Compliance:
 * - SC 3.3.1: Error Identification - Clear feedback for copy operations
 * - SC 2.4.3: Focus Order - Proper focus management after copy
 * 
 * MIT License
 */

/**
 * Modern clipboard copy with fallback support
 * @param text - Text to copy to clipboard
 */
export function copyToClipboard(text: string): void {
  // Modern Clipboard API kullan (daha güvenli)
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('✅ Text copied to clipboard successfully');
      showTemporaryNotification('✅ Panoya kopyalandı!');
    }).catch(err => {
      console.error('❌ Failed to copy text to clipboard:', err);
      fallbackCopyToClipboard(text);
    });
  } else {
    // Fallback method
    fallbackCopyToClipboard(text);
  }
}

/**
 * Legacy clipboard copy method for older browsers
 * @param text - Text to copy to clipboard
 */
function fallbackCopyToClipboard(text: string): void {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      console.log('✅ Fallback copy successful');
      showTemporaryNotification('✅ Panoya kopyalandı!');
    } else {
      console.error('❌ Fallback copy failed');
      showTemporaryNotification('❌ Kopyalama başarısız!');
    }
  } catch (err) {
    console.error('❌ Fallback copy error:', err);
    showTemporaryNotification('❌ Kopyalama hatası!');
  } finally {
    document.body.removeChild(textArea);
  }
}

/**
 * Shows temporary notification with accessibility features
 * @param message - Message to display
 */
export function showTemporaryNotification(message: string): void {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', 'polite');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 100001;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
  `;

  document.body.appendChild(notification);

  // Animasyon ile göster
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 10);

  // 3 saniye sonra kaldır
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}