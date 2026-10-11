import { describe, it, expect, beforeEach } from 'vitest';
import { storage, DEFAULT_SETTINGS } from '../utils/storage';
import { TestResult } from '../types/typing';

describe('Storage Manager & Data Recovery', () => {
  beforeEach(() => {
    // Clear mock/in-memory local storage before each test
    storage.clearAllData();
  });

  it('returns default settings when storage is empty', () => {
    const settings = storage.getSettings();
    expect(settings.theme).toBe('dark');
    expect(settings.fontFamily).toBe('JetBrains Mono');
    expect(settings.caretStyle).toBe('line');
  });

  it('saves and retrieves modified settings', () => {
    const updated = { ...DEFAULT_SETTINGS, theme: 'light' as const, fontSize: 26 };
    storage.saveSettings(updated);

    const retrieved = storage.getSettings();
    expect(retrieved.theme).toBe('light');
    expect(retrieved.fontSize).toBe(26);
  });

  it('persists and retrieves test results', () => {
    const mockResult: TestResult = {
      id: 'test_123',
      timestamp: 1700000000000,
      mode: 'time',
      difficulty: 'normal',
      timeLimit: 30,
      durationSeconds: 30,
      wpm: 65,
      rawWpm: 70,
      accuracy: 96,
      charStats: { correct: 160, incorrect: 6, extra: 0, missed: 0, total: 166 },
      timeline: [],
      mistakes: { c: 2, p: 1 },
      isPersonalBest: true,
    };

    storage.saveResult(mockResult);
    const results = storage.getResults();

    expect(results).toHaveLength(1);
    expect(results[0].wpm).toBe(65);
    expect(results[0].accuracy).toBe(96);
  });

  it('exports all data cleanly into valid JSON', () => {
    const exportedStr = storage.exportAllData();
    expect(exportedStr).toBeDefined();

    const parsed = JSON.parse(exportedStr);
    expect(parsed.version).toBe('1.0');
    expect(parsed.settings).toBeDefined();
    expect(Array.isArray(parsed.results)).toBe(true);
  });

  it('manages custom passages persistence and deletion', () => {
    const initialPassages = storage.getCustomPassages();
    expect(initialPassages.length).toBeGreaterThanOrEqual(1);

    const newPassage = {
      id: 'custom_unit_test',
      title: 'Unit Test Passage',
      category: 'Testing',
      text: 'This is a test passage for custom text verification.',
      createdAt: Date.now(),
    };

    storage.saveCustomPassage(newPassage);
    const afterSave = storage.getCustomPassages();
    expect(afterSave.some((p) => p.id === 'custom_unit_test')).toBe(true);

    storage.deleteCustomPassage('custom_unit_test');
    const afterDelete = storage.getCustomPassages();
    expect(afterDelete.some((p) => p.id === 'custom_unit_test')).toBe(false);
  });

  it('safely handles corrupted JSON on import without throwing errors', () => {
    const badJson = 'this is not valid json {{{';
    const success = storage.importAllData(badJson);
    expect(success).toBe(false);
  });
});

