import { describe, it, expect, beforeEach } from 'vitest';
import { ACCENT_PRESETS, THEME_PRESETS, getAccentPreset, getThemePreset } from '../data/theme';
import { storage } from '../utils/storage';

describe('Global Theme & Accent Colour System', () => {
  beforeEach(() => {
    storage.clearAllData();
  });

  it('provides all 6 required accent presets with valid hex colors', () => {
    expect(ACCENT_PRESETS).toHaveLength(6);
    
    const expected = [
      { id: 'teal', hex: '#168C82' },
      { id: 'blue', hex: '#4778D5' },
      { id: 'purple', hex: '#8966CF' },
      { id: 'green', hex: '#438B61' },
      { id: 'amber', hex: '#C58A26' },
      { id: 'rose', hex: '#CF6681' },
    ];

    expected.forEach(({ id, hex }) => {
      const found = ACCENT_PRESETS.find((a) => a.id === id);
      expect(found).toBeDefined();
      expect(found?.hex.toLowerCase()).toBe(hex.toLowerCase());
      expect(found?.name).toBeDefined();
    });
  });

  it('provides rich Monkeytype-inspired theme presets with complete color palettes', () => {
    expect(THEME_PRESETS.length).toBeGreaterThanOrEqual(8);

    const requiredThemes = ['rizkey_amber', 'serika_dark', 'carbon', 'nord', 'dracula', 'cyberpunk', 'matrix', 'botanical', 'paper_light'];
    requiredThemes.forEach((themeId) => {
      const preset = getThemePreset(themeId);
      expect(preset).toBeDefined();
      expect(preset.id).toBe(themeId);
      expect(preset.bgColor).toBeDefined();
      expect(preset.textColor).toBeDefined();
      expect(preset.accentColor).toBeDefined();
    });
  });

  it('getAccentPreset returns correct preset or defaults to Amber', () => {
    const teal = getAccentPreset('teal');
    expect(teal.name).toBe('Teal');
    expect(teal.hex).toBe('#168C82');

    const fallback = getAccentPreset(undefined as any);
    expect(fallback.id).toBe('amber');
    expect(fallback.hex).toBe('#C58A26');
  });

  it('getThemePreset returns correct theme or defaults to RizKey Signature', () => {
    const serika = getThemePreset('serika_dark');
    expect(serika.name).toBe('Serika Dark');
    expect(serika.accentColor).toBe('#e2b714');

    const fallback = getThemePreset('non_existent_theme');
    expect(fallback.id).toBe('rizkey_amber');
  });

  it('persists and restores selected theme and accent colour in storage', () => {
    const defaultSettings = storage.getSettings();
    expect(defaultSettings.theme).toBe('dark');
    expect(defaultSettings.accentColor).toBe('amber');

    storage.saveSettings({
      ...defaultSettings,
      theme: 'light',
      themePreset: 'serika_dark',
      accentColor: 'rose',
    });

    const restored = storage.getSettings();
    expect(restored.theme).toBe('light');
    expect(restored.themePreset).toBe('serika_dark');
    expect(restored.accentColor).toBe('rose');
  });
});

