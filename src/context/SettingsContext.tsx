import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings } from '../types/typing';
import { storage, DEFAULT_SETTINGS } from '../utils/storage';
import { getAccentPreset } from '../data/theme';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme class
    if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    // Apply accent color data attribute and CSS custom properties
    const accent = getAccentPreset(settings.accentColor);
    root.setAttribute('data-accent', accent.id);
    root.style.setProperty('--accent-color', accent.hex);
    root.style.setProperty('--accent-hover', accent.hoverHex);
    root.style.setProperty('--accent-text', accent.textHex);
    root.style.setProperty('--accent-subtle', accent.subtleRgba);

    // Persist settings
    storage.saveSettings(settings);
  }, [settings]);

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    storage.saveSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
