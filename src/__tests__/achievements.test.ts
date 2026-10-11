import { describe, it, expect } from 'vitest';
import { ALL_ACHIEVEMENTS, evaluateAchievements } from '../data/achievements';
import { TestResult, LessonProgress } from '../types/typing';

describe('Achievements Evaluation System', () => {
  it('has valid registered achievements', () => {
    expect(ALL_ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10);
    ALL_ACHIEVEMENTS.forEach((ach) => {
      expect(ach.id).toBeTruthy();
      expect(ach.title).toBeTruthy();
      expect(ach.description).toBeTruthy();
    });
  });

  it('unlocks "first_test" on the first completed test', () => {
    const results: TestResult[] = [
      {
        id: '1',
        timestamp: Date.now(),
        mode: 'time',
        difficulty: 'normal',
        durationSeconds: 30,
        wpm: 42,
        rawWpm: 45,
        accuracy: 94,
        charStats: { correct: 100, incorrect: 6, extra: 0, missed: 0, total: 106 },
        timeline: [],
        mistakes: {},
        isPersonalBest: true,
      },
    ];

    const unlocks = evaluateAchievements(results, {}, { currentStreak: 1, longestStreak: 1 }, {}, []);
    expect(unlocks).toContain('first_test');
  });

  it('unlocks "speed_50" and "speed_80" when WPM thresholds are reached', () => {
    const results: TestResult[] = [
      {
        id: '1',
        timestamp: Date.now(),
        mode: 'time',
        difficulty: 'normal',
        durationSeconds: 30,
        wpm: 85,
        rawWpm: 90,
        accuracy: 96,
        charStats: { correct: 200, incorrect: 8, extra: 0, missed: 0, total: 208 },
        timeline: [],
        mistakes: {},
        isPersonalBest: true,
      },
    ];

    const unlocks = evaluateAchievements(results, {}, { currentStreak: 1, longestStreak: 1 }, {}, []);
    expect(unlocks).toContain('speed_50');
    expect(unlocks).toContain('speed_80');
    expect(unlocks).not.toContain('speed_100');
  });

  it('unlocks "bullseye" when 100% accuracy is achieved on a full test', () => {
    const results: TestResult[] = [
      {
        id: '1',
        timestamp: Date.now(),
        mode: 'time',
        difficulty: 'normal',
        durationSeconds: 30,
        wpm: 55,
        rawWpm: 55,
        accuracy: 100,
        charStats: { correct: 135, incorrect: 0, extra: 0, missed: 0, total: 135 },
        timeline: [],
        mistakes: {},
        isPersonalBest: true,
      },
    ];

    const unlocks = evaluateAchievements(results, {}, { currentStreak: 1, longestStreak: 1 }, {}, []);
    expect(unlocks).toContain('bullseye');
  });

  it('does not re-unlock already unlocked achievements', () => {
    const results: TestResult[] = [
      {
        id: '1',
        timestamp: Date.now(),
        mode: 'time',
        difficulty: 'normal',
        durationSeconds: 30,
        wpm: 55,
        rawWpm: 55,
        accuracy: 95,
        charStats: { correct: 135, incorrect: 7, extra: 0, missed: 0, total: 142 },
        timeline: [],
        mistakes: {},
        isPersonalBest: true,
      },
    ];

    const currentlyUnlocked = ['first_test', 'speed_50'];
    const unlocks = evaluateAchievements(results, {}, { currentStreak: 1, longestStreak: 1 }, {}, currentlyUnlocked);

    expect(unlocks).not.toContain('first_test');
    expect(unlocks).not.toContain('speed_50');
  });
});
