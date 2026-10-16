import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { ACCENT_PRESETS, THEME_PRESETS, getAccentPreset, getThemePreset } from '../../data/theme';
import { AccentColorId } from '../../types/typing';
import {
  Palette,
  Sun,
  Moon,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'themes' | 'accents'>('themes');
  const containerRef = useRef<HTMLDivElement>(null);

  const activeAccent = getAccentPreset(settings.accentColor);
  const activeTheme = getThemePreset(settings.themePreset);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleThemeChange = (theme: 'dark' | 'light') => {
    if (settings.theme === theme) return;
    updateSettings({ theme });
  };

  const handleThemePresetSelect = (presetId: string) => {
    const preset = getThemePreset(presetId);
    updateSettings({
      themePreset: preset.id,
      theme: preset.mode,
    });
    toast.info(`Theme set to ${preset.name}`);
  };

  const handleAccentChange = (accentId: AccentColorId) => {
    if (settings.accentColor === accentId) return;
    updateSettings({ accentColor: accentId });
  };

  const handleReset = () => {
    updateSettings({
      theme: 'dark',
      themePreset: 'rizkey_amber',
      accentColor: 'amber',
    });
    toast.info('Theme reset to default (RizKey Signature)');
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-150 border ${
          isOpen
            ? 'bg-[#272824] border-[var(--accent-color)] text-[#ECEBE4]'
            : 'bg-transparent border-[#353630]/60 text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#272824]/60'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Theme and accent colour selector"
        title="Customise theme & color palette"
      >
        <Palette className="w-3.5 h-3.5 text-[var(--accent-color)]" />
        <span
          className="w-2.5 h-2.5 rounded-full ring-1 ring-black/20"
          style={{ backgroundColor: activeAccent.hex }}
        />
        <span className="hidden sm:inline capitalize font-medium">{activeTheme.name}</span>
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#272824] border border-[#353630] p-4 shadow-2xl z-50 animate-scaleIn font-mono text-xs text-[#ECEBE4]"
          role="dialog"
          aria-label="Theme and colour options"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#353630] mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent-color)]" />
              <span className="font-bold text-[#ECEBE4]">Themes &amp; Colors</span>
            </div>
            {/* Tab Selector */}
            <div className="flex rounded-lg bg-[#20211D] p-0.5 border border-[#353630]">
              <button
                type="button"
                onClick={() => setTab('themes')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  tab === 'themes'
                    ? 'bg-[#272824] text-[var(--accent-color)] font-bold shadow-xs'
                    : 'text-[#989A92] hover:text-[#ECEBE4]'
                }`}
              >
                Presets
              </button>
              <button
                type="button"
                onClick={() => setTab('accents')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  tab === 'accents'
                    ? 'bg-[#272824] text-[var(--accent-color)] font-bold shadow-xs'
                    : 'text-[#989A92] hover:text-[#ECEBE4]'
                }`}
              >
                Accents
              </button>
            </div>
          </div>

          {tab === 'themes' ? (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] text-[#989A92] uppercase font-semibold">
                  Curated Themes ({THEME_PRESETS.length})
                </label>
                <span className="text-[11px] font-bold text-[var(--accent-color)]">
                  {activeTheme.name}
                </span>
              </div>

              {/* Scrollable Theme Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar pr-1">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = activeTheme.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleThemePresetSelect(preset.id)}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all group ${
                        isSelected
                          ? 'border-[var(--accent-color)] bg-[#20211D] shadow-sm'
                          : 'border-[#353630]/70 bg-[#20211D]/40 hover:bg-[#20211D] hover:border-[#353630]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-[var(--accent-color)]' : 'text-[#ECEBE4]'}`}>
                          {preset.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-color)] stroke-[3]" />}
                      </div>

                      {/* 3-Color Swatch Preview (Background, Accent, Text) */}
                      <div className="flex items-center gap-1 w-full mt-1">
                        <div
                          className="w-4 h-4 rounded-full border border-black/20"
                          style={{ backgroundColor: preset.bgColor }}
                          title="Background"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black/20"
                          style={{ backgroundColor: preset.accentColor }}
                          title="Accent"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black/20"
                          style={{ backgroundColor: preset.textColor }}
                          title="Text"
                        />
                        <span className="text-[10px] text-[#7E8079] ml-auto uppercase font-medium">
                          {preset.mode}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              {/* Light / Dark Mode Toggle */}
              <div className="mb-4">
                <label className="block text-[11px] text-[#989A92] uppercase font-semibold mb-2">
                  Appearance Mode
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#20211D] border border-[#353630]">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-[#272824] text-[#ECEBE4] font-bold border border-[#353630] shadow-xs'
                        : 'text-[#989A92] hover:text-[#ECEBE4]'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                      settings.theme === 'light'
                        ? 'bg-[#FFFFFF] text-[#26342F] font-bold border border-[#D8E2DD] shadow-xs'
                        : 'text-[#989A92] hover:text-[#ECEBE4]'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light</span>
                  </button>
                </div>
              </div>

              {/* Accent Colour Swatches */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-[#989A92] uppercase font-semibold">
                    Accent Colour
                  </label>
                  <span className="text-[11px] font-bold text-[#ECEBE4] capitalize">
                    {activeAccent.name}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {ACCENT_PRESETS.map((preset) => {
                    const isSelected = (settings.accentColor || 'amber') === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleAccentChange(preset.id)}
                        className="flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-[#20211D]/60 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
                        title={`${preset.name} (${preset.hex})`}
                        aria-label={`Select ${preset.name} accent`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'ring-2 ring-offset-2 ring-offset-[#272824] ring-[#ECEBE4] scale-105 shadow-sm'
                              : 'opacity-90 group-hover:scale-105'
                          }`}
                          style={{ backgroundColor: preset.hex }}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white stroke-[3]" />
                          )}
                        </div>
                        <span
                          className={`text-[10px] leading-tight ${
                            isSelected ? 'font-bold text-[#ECEBE4]' : 'text-[#7E8079]'
                          }`}
                        >
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer: Reset to Default */}
          <div className="pt-3 border-t border-[#353630] flex items-center justify-between">
            <span className="text-[10px] text-[#7E8079]">
              Instant &bull; Saved locally
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#20211D] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset default</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
