import { useState, useEffect, useCallback } from 'react';

export type FontSize = 'small' | 'medium' | 'large';
export type Theme = 'light' | 'dark' | 'system';

interface Settings {
  theme: Theme;
  fontSize: FontSize;
  compactMode: boolean;
}

const defaultSettings: Settings = {
  theme: 'system',
  fontSize: 'medium',
  compactMode: false,
};

const SETTINGS_KEY = 'legalcase-settings';

const fontSizeMap: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
    } else {
      root.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings.theme]);

  // Listen to system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings.theme]);

  // Apply font size
  useEffect(() => {
    document.documentElement.style.fontSize = fontSizeMap[settings.fontSize];
  }, [settings.fontSize]);

  // Apply compact mode
  useEffect(() => {
    document.documentElement.classList.toggle('compact', settings.compactMode);
  }, [settings.compactMode]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
};