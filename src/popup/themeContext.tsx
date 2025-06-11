// Theme Context - Açık/Koyu tema desteği
// WCAG 2.2-AA uyumlu erişilebilirlik

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('auto');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Sistem temasını algıla
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Tema değişikliklerini dinle
  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'auto') {
        setCurrentTheme(getSystemTheme());
      } else {
        setCurrentTheme(theme);
      }
    };

    updateTheme();

    // Sistem tema değişikliklerini dinle
    if (theme === 'auto' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Chrome storage'dan tema yükle
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['theme'], (result: any) => {
        if (result.theme) {
          setTheme(result.theme as Theme);
        }
      });
    }
  }, []);

  // Tema değişikliklerini kaydet
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ theme: newTheme });
    }
  };

  // Toggle fonksiyonu (açık/koyu arası geçiş)
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    handleSetTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    currentTheme,
    setTheme: handleSetTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;