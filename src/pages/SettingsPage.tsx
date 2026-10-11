import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { useToast } from '../context/ToastContext';
import { storage } from '../utils/storage';
import { soundEngine } from '../utils/sound';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ACCENT_PRESETS } from '../data/theme';
import {
  FontFamily,
  CaretStyle,
  CaretAnimation,
  SoundTheme,
  TimeLimit,
  WordLimit,
  Difficulty,
} from '../types/typing';
import {
  Settings as SettingsIcon,
  Palette,
  Volume2,
  Sliders,
  Keyboard,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { reloadAllData, clearAllHistory } = useProgress();
  const { toast } = useToast();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [eraseModalOpen, setEraseModalOpen] = useState(false);

  // Font options
  const fontOptions: { id: FontFamily; name: string }[] = [
    { id: 'JetBrains Mono', name: 'JetBrains Mono (Recommended)' },
    { id: 'Roboto Mono', name: 'Roboto Mono' },
    { id: 'Fira Code', name: 'Fira Code' },
    { id: 'Courier New', name: 'Courier New' },
    { id: 'sans-serif', name: 'Inter (Sans)' },
  ];

  // Sound test
  const handleTestSound = (theme: SoundTheme) => {
    soundEngine.playKey(theme, settings.soundVolume);
  };

  // Export JSON file
  const handleExportData = () => {
    try {
      const dataStr = storage.exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rizkey_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Local data backup exported as JSON!');
    } catch {
      toast.error('Failed to export data.');
    }
  };

  // Import JSON file
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importAllData(content);
      if (success) {
        reloadAllData();
        updateSettings(storage.getSettings());
        toast.success('Backup imported successfully!');
      } else {
        toast.error('Failed to import backup: invalid JSON format.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  const handleConfirmReset = () => {
    resetSettings();
    setResetModalOpen(false);
    toast.success('Settings restored to defaults.');
  };

  const handleConfirmEraseAll = () => {
    clearAllHistory();
    setEraseModalOpen(false);
    toast.success('All local data wiped cleanly.');
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4] flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-[#E6C76B]" />
          <span>Application Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#989A92] mt-1">
          Customize visual aesthetics, tactile sound feedback, typing carets, and local data persistence.
        </p>
      </div>

      <div className="space-y-6">
        {/* SECTION 1: APPEARANCE */}
        <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630]">
          <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2 mb-4 pb-3 border-b border-[#353630]">
            <Palette className="w-4 h-4 text-[#E6C76B]" />
            <span>Appearance & Typography</span>
          </h2>

          <div className="space-y-5 text-xs font-mono">
            {/* Color Theme */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Color Theme</span>
                <span className="text-[#989A92]">Select dark charcoal or light beige interface</span>
              </div>
              <div className="flex gap-2">
                {(['dark', 'light'] as const).map((th) => (
                  <button
                    key={th}
                    onClick={() => {
                      updateSettings({ theme: th });
                      toast.info(`Theme set to ${th}`);
                    }}
                    className={`px-4 py-1.5 rounded-xl capitalize transition-all duration-150 ${
                      settings.theme === th
                        ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                        : 'bg-[#20211D] text-[#989A92] hover:text-[#ECEBE4] border border-[#353630]'
                    }`}
                  >
                    {th}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Colour */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-3 border-t border-[#353630]/60">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Accent Colour</span>
                <span className="text-[#989A92]">Highlight colour for buttons, active tabs, carets, and metrics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ACCENT_PRESETS.map((p) => {
                  const isSelected = (settings.accentColor || 'amber') === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        updateSettings({ accentColor: p.id });
                        toast.info(`Accent colour set to ${p.name}`);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs"
                      style={{
                        borderColor: isSelected ? p.hex : 'rgba(53, 54, 48, 0.8)',
                        backgroundColor: isSelected ? 'rgba(32, 41, 37, 0.6)' : 'transparent',
                      }}
                      title={`${p.name} (${p.hex})`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: p.hex }}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </span>
                      <span className={isSelected ? 'font-bold text-[#ECEBE4]' : 'text-[#989A92]'}>
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Family */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Typing Font</span>
                <span className="text-[#989A92]">Monospace typography in the primary typing area</span>
              </div>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSettings({ fontFamily: e.target.value as FontFamily })}
                className="px-3 py-1.5 rounded-xl bg-[#20211D] border border-[#353630] text-[#ECEBE4] focus:outline-none focus:border-[#E6C76B]"
              >
                {fontOptions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Font Size ({settings.fontSize}px)</span>
                <span className="text-[#989A92]">Adjust scale of active typing text (recommended 28–36px)</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="40"
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-36 accent-[#E6C76B]"
                />
                <span className="text-[#ECEBE4] w-8 font-mono">{settings.fontSize}px</span>
              </div>
            </div>

            {/* Live Text Preview Box */}
            <div className="p-6 rounded-xl bg-[#20211D] border border-[#353630] text-center overflow-x-hidden">
              <span
                style={{
                  fontFamily: settings.fontFamily,
                  fontSize: `${settings.fontSize}px`,
                  lineHeight: 1.45,
                  wordSpacing: '20px',
                }}
                className="text-[#E6C76B] tracking-wide inline-block"
              >
                Find your rhythm. Master your keys.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: CARET & BEHAVIOR */}
        <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630]">
          <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2 mb-4 pb-3 border-b border-[#353630]">
            <Keyboard className="w-4 h-4 text-[#E6C76B]" />
            <span>Caret & Keyboard Guidance</span>
          </h2>

          <div className="space-y-5 text-xs font-mono">
            {/* Caret Style */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Caret Style</span>
                <span className="text-[#989A92]">Visual indicator for next target keystroke</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['line', 'block', 'underline', 'off'] as const).map((cs) => (
                  <button
                    key={cs}
                    onClick={() => updateSettings({ caretStyle: cs })}
                    className={`px-3 py-1.5 rounded-xl capitalize transition-all duration-150 ${
                      settings.caretStyle === cs
                        ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                        : 'bg-[#20211D] text-[#989A92] hover:text-[#ECEBE4] border border-[#353630]'
                    }`}
                  >
                    {cs}
                  </button>
                ))}
              </div>
            </div>

            {/* Caret Animation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Caret Animation</span>
                <span className="text-[#989A92]">Movement and blinking characteristics</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['smooth', 'blink', 'off'] as const).map((ca) => (
                  <button
                    key={ca}
                    onClick={() => updateSettings({ caretAnimation: ca })}
                    className={`px-3 py-1.5 rounded-xl capitalize transition-all duration-150 ${
                      settings.caretAnimation === ca
                        ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                        : 'bg-[#20211D] text-[#989A92] hover:text-[#ECEBE4] border border-[#353630]'
                    }`}
                  >
                    {ca}
                  </button>
                ))}
              </div>
            </div>

            {/* Virtual Keyboard Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Show Virtual Keyboard Guide</span>
                <span className="text-[#989A92]">Display visual QWERTY keyboard guide under typing text</span>
              </div>
              <input
                type="checkbox"
                checked={settings.showKeyboard}
                onChange={(e) => updateSettings({ showKeyboard: e.target.checked })}
                className="w-4 h-4 accent-[#E6C76B]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SOUND EFFECTS */}
        <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630]">
          <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2 mb-4 pb-3 border-b border-[#353630]">
            <Volume2 className="w-4 h-4 text-[#E6C76B]" />
            <span>Audio & Keystroke Synthesizer</span>
          </h2>

          <div className="space-y-5 text-xs font-mono">
            {/* Sound theme */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Keypress Sound Style</span>
                <span className="text-[#989A92]">Synthesized real-time audio via Web Audio API</span>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                {(['mechanical', 'typewriter', 'click', 'soft', 'off'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateSettings({ soundTheme: st });
                      handleTestSound(st);
                    }}
                    className={`px-3 py-1.5 rounded-xl capitalize transition-all duration-150 ${
                      settings.soundTheme === st
                        ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                        : 'bg-[#20211D] text-[#989A92] hover:text-[#ECEBE4] border border-[#353630]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume slider */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Audio Volume ({Math.round(settings.soundVolume * 100)}%)</span>
                <span className="text-[#989A92]">Sound level for keys and chimes</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                  className="w-36 accent-[#E6C76B]"
                />
              </div>
            </div>

            {/* Error sound toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Error Sound Warning</span>
                <span className="text-[#989A92]">Subtle warning sound when an incorrect key is struck</span>
              </div>
              <input
                type="checkbox"
                checked={settings.playErrorSound}
                onChange={(e) => updateSettings({ playErrorSound: e.target.checked })}
                className="w-4 h-4 accent-[#E6C76B]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: TEST DEFAULTS */}
        <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630]">
          <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2 mb-4 pb-3 border-b border-[#353630]">
            <Sliders className="w-4 h-4 text-[#E6C76B]" />
            <span>Default Test Configurations</span>
          </h2>

          <div className="space-y-5 text-xs font-mono">
            {/* Default Duration */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Default Duration</span>
                <span className="text-[#989A92]">Initial seconds when opening time mode</span>
              </div>
              <div className="flex gap-1.5">
                {([15, 30, 60, 120] as TimeLimit[]).map((tl) => (
                  <button
                    key={tl}
                    onClick={() => updateSettings({ defaultTimeLimit: tl })}
                    className={`px-3 py-1.5 rounded-xl transition-all duration-150 ${
                      settings.defaultTimeLimit === tl
                        ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                        : 'bg-[#20211D] text-[#989A92] hover:text-[#ECEBE4] border border-[#353630]'
                    }`}
                  >
                    {tl}s
                  </button>
                ))}
              </div>
            </div>

            {/* Default Words */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Default Word Count</span>
                <span className="text-[#989A92]">Initial words when opening word mode</span>
              </div>
              <div className="flex gap-1.5">
                {([10, 25, 50, 100] as WordLimit[]).map((wl) => (
                  <button
                    key={wl}
                    onClick={() => updateSettings({ defaultWordLimit: wl })}
                    className={`px-3 py-1.5 rounded-xl transition-all duration-150 ${
                      settings.defaultWordLimit === wl
                        ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                        : 'bg-[#20211D] text-[#989A92] hover:text-[#ECEBE4] border border-[#353630]'
                    }`}
                  >
                    {wl}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Difficulty */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#ECEBE4] font-semibold block">Default Vocabulary Level</span>
                <span className="text-[#989A92]">Vocabulary complexity pool</span>
              </div>
              <div className="flex gap-1.5">
                {(['beginner', 'normal', 'advanced'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => updateSettings({ difficulty: d })}
                    className={`px-3 py-1.5 rounded-xl capitalize transition-all duration-150 ${
                      settings.difficulty === d
                        ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                        : 'bg-[#20211D] text-[#989A92] hover:text-[#ECEBE4] border border-[#353630]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: DATA MANAGEMENT */}
        <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630]">
          <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2 mb-4 pb-3 border-b border-[#353630]">
            <Database className="w-4 h-4 text-[#E6C76B]" />
            <span>Data Backup & Management</span>
          </h2>

          <div className="space-y-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportData}
                leftIcon={<Download className="w-3.5 h-3.5 text-[#E6C76B]" />}
              >
                Export Local Data (JSON)
              </Button>

              <label className="inline-flex items-center justify-center font-mono font-medium rounded-xl transition-all duration-150 border border-[#353630] bg-[#272824] text-[#ECEBE4] hover:bg-[#2E2F2A] hover:border-[#42443C] px-3 py-1.5 text-xs gap-1.5 cursor-pointer select-none">
                <Upload className="w-3.5 h-3.5 text-[#5DBE76]" />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResetModalOpen(true)}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset Settings
              </Button>
            </div>

            <div className="pt-4 border-t border-[#353630] flex items-center justify-between">
              <div>
                <span className="text-red-400 font-semibold block">Erase All Data</span>
                <span className="text-[#989A92]">Permanently erase test history, lesson progress, and streaks</span>
              </div>

              <Button
                variant="danger"
                size="xs"
                onClick={() => setEraseModalOpen(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Erase All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Settings Confirmation Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Settings to Defaults?"
        description="This will restore all visual, font, audio, and test preferences back to factory defaults. Your typing test history and lesson stars will be untouched."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmReset}>
              Reset Settings
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#989A92]">
          Are you sure you want to restore default settings?
        </p>
      </Modal>

      {/* Erase All Data Confirmation Modal */}
      <Modal
        isOpen={eraseModalOpen}
        onClose={() => setEraseModalOpen(false)}
        title="Permanently Erase All Data?"
        description="WARNING: This will completely wipe all typing history, personal bests, completed lessons, and settings from this browser."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEraseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmEraseAll}>
              Yes, Erase Everything
            </Button>
          </>
        }
      >
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          This operation cannot be reversed. If you want to keep your records, export a JSON backup first.
        </div>
      </Modal>
    </div>
  );
};
