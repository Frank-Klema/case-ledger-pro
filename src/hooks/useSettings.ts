import { useState, useEffect, useCallback } from 'react';

export type FontSize = 'small' | 'medium' | 'large';
export type Theme = 'light' | 'dark' | 'system' | 'ocean' | 'forest' | 'sunset' | 'rose' | 'midnight';

const PRESET_THEMES: Theme[] = ['ocean', 'forest', 'sunset', 'rose', 'midnight'];
const ALL_PRESET_CLASSES = PRESET_THEMES.map(t => `theme-${t}`);
const DARK_PRESETS: Theme[] = ['ocean', 'forest', 'midnight'];

export type CasesPerPage = 10 | 15 | 25 | 50;

interface Settings {
  theme: Theme;
  fontSize: FontSize;
  compactMode: boolean;
  casesPerPage: CasesPerPage;
}

const defaultSettings: Settings = {
  theme: 'system',
  fontSize: 'medium',
  compactMode: false,
  casesPerPage: 15,
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
    // Clear any preset classes
    root.classList.remove(...ALL_PRESET_CLASSES);

    if (settings.theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
    } else if (PRESET_THEMES.includes(settings.theme)) {
      root.classList.add(`theme-${settings.theme}`);
      root.classList.toggle('dark', DARK_PRESETS.includes(settings.theme));
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