// Modal Styles - WCAG 2.2-AA Uyumlu Stil Sabitleri
// MIT License

export type StyleDefinition = Record<string, string>;

export interface StyleConfig {
  overlay: StyleDefinition;
  container: StyleDefinition;
  header: StyleDefinition;
  content: StyleDefinition;
  closeButton: StyleDefinition;
}

/**
 * WCAG 2.2-AA Uyumlu Stil Sabitleri
 * 
 * SC 1.4.3: Kontrast (Minimum) - 4.5:1 metin kontrastı
 * SC 1.4.11: Non-text Contrast - 3:1 UI bileşen kontrastı
 * SC 2.4.7: Focus Visible - Görünür odak göstergesi
 * SC 1.4.12: Text Spacing - Metin aralıkları
 */
export const MODAL_STYLES: StyleConfig = {
  overlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.75)',
    zIndex: '99999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(2px)',
  },
  container: {
    background: '#ffffff',
    maxWidth: '1000px',
    width: '95vw',
    maxHeight: '90vh',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    animation: 'modalSlideIn 0.3s ease-out',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  content: {
    padding: '2rem',
    overflowY: 'auto',
    lineHeight: '1.6',
    fontSize: '16px',
  },
  closeButton: {
    background: '#ef4444',
    border: '2px solid #dc2626',
    color: '#ffffff',
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
};

/**
 * WCAG 2.2-AA uyumlu focus stilleri
 * SC 2.4.7: Focus Visible kriterini karşılar
 */
export const FOCUS_STYLES = {
  closeButton: 'outline: 3px solid #fbbf24; outline-offset: 2px;',
};

/**
 * Animasyon stillerini oluşturur
 */
export const createSpinAnimation = (): string => `
  <style>
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes modalSlideIn {
      from {
        transform: scale(0.95) translateY(-20px);
        opacity: 0;
      }
      to {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
  </style>
`;