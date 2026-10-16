import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings } from '../types/typing';
import { storage, DEFAULT_SETTINGS } from '../utils/storage';
import { getAccentPreset, getThemePreset } from '../data/theme';

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
    const themePreset = getThemePreset(settings.themePreset);

    // Apply theme mode class
    const effectiveMode = settings.theme || themePreset.mode;
    if (effectiveMode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    // Set base theme palette custom properties
    root.style.setProperty('--bg-color', themePreset.bgColor);
    root.style.setProperty('--surface-color', themePreset.surfaceColor);
    root.style.setProperty('--surface-hover', themePreset.surfaceHover);
    root.style.setProperty('--border-color', themePreset.borderColor);
    root.style.setProperty('--text-color', themePreset.textColor);
    root.style.setProperty('--subtext-color', themePreset.subtextColor);
    root.style.setProperty('--muted-color', themePreset.mutedColor);
    root.style.setProperty('--correct-color', themePreset.correctColor);
    root.style.setProperty('--incorrect-color', themePreset.incorrectColor);
    root.style.setProperty('--extra-color', themePreset.extraColor);

    // Apply accent color data attribute and CSS custom properties
    const accent = getAccentPreset(settings.accentColor);
    root.setAttribute('data-accent', accent.id);
    root.setAttribute('data-theme', themePreset.id);

    // If user has specific accent selection or theme preset accent
    const finalAccentHex = settings.accentColor ? accent.hex : themePreset.accentColor;
    const finalAccentHover = settings.accentColor ? accent.hoverHex : themePreset.accentHover;
    const finalAccentText = settings.accentColor ? accent.textHex : themePreset.accentText;
    const finalAccentSubtle = settings.accentColor ? accent.subtleRgba : themePreset.accentSubtle;

    root.style.setProperty('--accent-color', finalAccentHex);
    root.style.setProperty('--accent-hover', finalAccentHover);
    root.style.setProperty('--accent-text', finalAccentText);
    root.style.setProperty('--accent-subtle', finalAccentSubtle);

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
