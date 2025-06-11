// Theme Toggle Button Component
// WCAG 2.2-AA uyumlu tema değiştirici

import React from 'react';
import { useTheme } from './themeContext';
import { getThemedColors } from './styles';

const ThemeToggle: React.FC = () => {
  const { theme, currentTheme, setTheme, toggleTheme } = useTheme();
  const colors = getThemedColors(currentTheme === 'dark');

  const buttonStyle = {
    position: 'fixed' as const,
    top: '10px',
    right: '10px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: `2px solid ${colors.border}`,
    background: colors.background.primary,
    color: colors.text.primary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  };

  const dropdownStyle = {
    position: 'absolute' as const,
    top: '45px',
    right: '0',
    background: colors.background.primary,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '8px',
    minWidth: '120px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1001,
  };

  const optionStyle = {
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    color: colors.text.primary,
    transition: 'background 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const [showDropdown, setShowDropdown] = React.useState(false);

  const themeOptions = [
    { value: 'light' as const, label: '☀️ Açık Tema', description: 'Parlak renkler' },
    { value: 'dark' as const, label: '🌙 Koyu Tema', description: 'Az görenler için' },
    { value: 'auto' as const, label: '🔄 Otomatik', description: 'Sistem teması' },
  ];

  const getCurrentIcon = () => {
    if (theme === 'auto') return '🔄';
    return currentTheme === 'dark' ? '🌙' : '☀️';
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        style={buttonStyle}
        title={`Tema: ${theme === 'auto' ? 'Otomatik' : currentTheme === 'dark' ? 'Koyu' : 'Açık'}`}
        aria-label={`Tema değiştir. Şu anki tema: ${theme === 'auto' ? 'Otomatik' : currentTheme === 'dark' ? 'Koyu' : 'Açık'}`}
        aria-expanded={showDropdown}
        aria-haspopup="menu"
      >
        {getCurrentIcon()}
      </button>

      {showDropdown && (
        <div style={dropdownStyle} role="menu">
          {themeOptions.map((option) => (
            <div
              key={option.value}
              style={{
                ...optionStyle,
                background: theme === option.value ? colors.background.secondary : 'transparent',
                fontWeight: theme === option.value ? '600' : 'normal',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.background.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme === option.value ? colors.background.secondary : 'transparent';
              }}
              onClick={() => {
                setTheme(option.value);
                setShowDropdown(false);
              }}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setTheme(option.value);
                  setShowDropdown(false);
                }
              }}
            >
              <div>
                <div style={{ fontSize: '14px' }}>{option.label}</div>
                <div style={{ 
                  fontSize: '11px', 
                  color: colors.text.secondary,
                  marginTop: '2px' 
                }}>
                  {option.description}
                </div>
              </div>
              {theme === option.value && (
                <div style={{ marginLeft: 'auto', color: colors.primary }}>✓</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Keyboard shortcuts info */}
      <div style={{
        position: 'absolute',
        top: '45px',
        right: '50px',
        fontSize: '11px',
        color: colors.text.secondary,
        background: colors.background.secondary,
        padding: '4px 8px',
        borderRadius: '4px',
        border: `1px solid ${colors.border}`,
        whiteSpace: 'nowrap',
        opacity: showDropdown ? 1 : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: 'none',
      }}>
        Alt+T: Tema değiştir
      </div>

      {/* Global keyboard shortcut handler */}
      {typeof window !== 'undefined' && (
        <div
          style={{ display: 'none' }}
          onKeyDown={(e) => {
            if (e.altKey && e.key === 't') {
              e.preventDefault();
              toggleTheme();
            }
          }}
          tabIndex={-1}
        />
      )}
    </div>
  );
};

export default ThemeToggle;