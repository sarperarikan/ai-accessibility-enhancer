// Common styles and style utilities
// WCAG 2.2-AA uyumlu ortak stil tanımları

export const commonStyles = {
  // Base button styles
  baseButton: {
    padding: '12px 16px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500' as const,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Primary button
  primaryButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
  },

  // Card container
  card: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },

  // Section header
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },

  // Icon container
  iconContainer: (size: number = 64, gradient: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${size}px`,
    height: `${size}px`,
    background: gradient,
    borderRadius: '50%',
    color: 'white',
  }),

  // Text styles
  text: {
    heading: {
      fontSize: '20px',
      fontWeight: 'bold' as const,
      color: '#1f2937',
      marginBottom: '8px',
    },
    subheading: {
      fontSize: '14px', 
      color: '#6b7280'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500' as const,
      color: '#374151',
      marginBottom: '8px',
    },
    small: {
      fontSize: '12px',
      color: '#6b7280',
    }
  },

  // Input styles
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
  },

  // Select styles
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
  },

  // Gradient backgrounds
  gradients: {
    blue: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    purple: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    green: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    indigo: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    lightBlue: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
    lightGreen: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    header: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    page: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  },

  // Animation classes
  animations: {
    fadeIn: {
      animation: 'fadeIn 0.3s ease-in-out'
    }
  },

  // Color scheme
  colors: {
    primary: '#3b82f6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
    },
    border: '#e5e7eb',
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
    }
  },

  // Dark theme colors
  darkColors: {
    primary: '#60a5fa',
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    info: '#60a5fa',
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      tertiary: '#9ca3af',
    },
    border: '#374151',
    background: {
      primary: '#1f2937',
      secondary: '#111827',
      tertiary: '#374151',
    }
  }
};

// Button style generators
export const generateButtonStyle = (
  variant: 'primary' | 'secondary' | 'danger' | 'success' = 'primary',
  disabled: boolean = false
) => {
  const base = commonStyles.baseButton;
  
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
    },
    secondary: {
      background: 'transparent',
      color: '#6b7280',
      border: '1px solid #d1d5db',
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
    },
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
    }
  };

  return {
    ...base,
    ...variants[variant],
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
};

// Menu item style generator
export const generateMenuItemStyle = (color: string, bgColor: string, isDisabled: boolean = false) => ({
  display: 'flex',
  alignItems: 'center',
  color,
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: '500',
  padding: '6px 10px',
  borderRadius: '6px',
  background: bgColor,
  border: `1px solid ${color}`,
  transition: 'all 0.2s ease',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  opacity: isDisabled ? 0.6 : 1,
});

// Theme-aware style generators
export const getThemedColors = (isDark: boolean) => {
  return isDark ? commonStyles.darkColors : commonStyles.colors;
};

export const getThemedStyle = (lightStyle: any, darkStyle: any, isDark: boolean) => {
  return isDark ? { ...lightStyle, ...darkStyle } : lightStyle;
};

// Theme-aware common styles
export const getThemedCommonStyles = (isDark: boolean) => {
  const colors = getThemedColors(isDark);
  
  return {
    ...commonStyles,
    colors,
    
    // Override base styles with theme colors
    card: {
      ...commonStyles.card,
      background: colors.background.primary,
      border: `1px solid ${colors.border}`,
      color: colors.text.primary,
    },
    
    input: {
      ...commonStyles.input,
      background: colors.background.primary,
      border: `1px solid ${colors.border}`,
      color: colors.text.primary,
    },
    
    select: {
      ...commonStyles.select,
      background: colors.background.primary,
      border: `1px solid ${colors.border}`,
      color: colors.text.primary,
    },
    
    text: {
      heading: {
        ...commonStyles.text.heading,
        color: colors.text.primary,
      },
      subheading: {
        ...commonStyles.text.subheading,
        color: colors.text.secondary,
      },
      label: {
        ...commonStyles.text.label,
        color: colors.text.primary,
      },
      small: {
        ...commonStyles.text.small,
        color: colors.text.secondary,
      }
    }
  };
};

// CSS keyframes as string for injection
export const cssAnimations = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`;