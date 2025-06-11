// Alert Component
// WCAG 2.2-AA uyumlu bildirim sistemi

import React from 'react';
import type { AlertConfig } from './types';
import { Icons } from './Icons';

interface AlertComponentProps {
  alertState: AlertConfig | null;
  onHideAlert: () => void;
}

const AlertComponent: React.FC<AlertComponentProps> = ({ alertState, onHideAlert }) => {
  if (!alertState) return null;

  // Alert tipine göre renk belirleme
  const getAlertColors = (type: AlertConfig['type']) => {
    switch (type) {
      case 'success':
        return {
          background: '#10b981',
          border: '#059669',
        };
      case 'error':
        return {
          background: '#ef4444',
          border: '#dc2626',
        };
      case 'warning':
        return {
          background: '#f59e0b',
          border: '#d97706',
        };
      case 'info':
      default:
        return {
          background: '#3b82f6',
          border: '#2563eb',
        };
    }
  };

  const colors = getAlertColors(alertState.type);

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: colors.background,
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        maxWidth: '350px',
        minWidth: '280px',
        animation: 'slideInRight 0.3s ease-out',
        border: `2px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            {/* Alert tipine göre ikon */}
            <div style={{ marginRight: '8px' }}>
              {alertState.type === 'success' && <Icons.CheckCircle />}
              {alertState.type === 'error' && <Icons.AlertCircle />}
              {alertState.type === 'warning' && <Icons.AlertCircle />}
              {alertState.type === 'info' && <Icons.AlertCircle />}
            </div>
            <h4
              style={{
                fontWeight: '600',
                fontSize: '14px',
                margin: '0 0 0 8px',
                color: 'white',
              }}
            >
              {alertState.title}
            </h4>
          </div>
          <p
            style={{
              fontSize: '12px',
              margin: 0,
              lineHeight: '1.4',
              whiteSpace: 'pre-line',
              color: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            {alertState.message}
          </p>
        </div>
        <button
          onClick={onHideAlert}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            marginLeft: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease',
          }}
          title="Bildirimi kapat"
          aria-label="Bildirimi kapat"
          onMouseEnter={e =>
            (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')
          }
          onMouseLeave={e =>
            (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')
          }
        >
          <Icons.X />
        </button>
      </div>

      {/* CSS Animation keyframes - Bu stil sadece bir kez eklenmeli */}
      <style>{`
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
      `}</style>
    </div>
  );
};

export default AlertComponent;