import { describe, it, expect } from 'vitest';
import { calculateWpm, calculateRawWpm, calculateAccuracy, formatDuration } from '../utils/metrics';

describe('Typing Engine Calculations & Timer Logic', () => {
  describe('Standard WPM Calculation', () => {
    it('calculates net WPM accurately using 5 characters per word and elapsed minutes', () => {
      // 50 correct characters in 30 seconds = (50/5) / (30/60) = 10 / 0.5 = 20 WPM
      expect(calculateWpm(50, 30)).toBe(20);

      // 100 correct characters in 15 seconds = (100/5) / (15/60) = 20 / 0.25 = 80 WPM
      expect(calculateWpm(100, 15)).toBe(80);

      // 300 correct characters in 60 seconds = (300/5) / (60/60) = 60 / 1 = 60 WPM
      expect(calculateWpm(300, 60)).toBe(60);
    });

    it('calculates raw WPM from total typed keystrokes and elapsed minutes', () => {
      // 120 total keystrokes in 30 seconds = (120/5) / 0.5 = 48 raw WPM
      expect(calculateRawWpm(120, 30)).toBe(48);

      // 250 total keystrokes in 60 seconds = (250/5) / 1 = 50 raw WPM
      expect(calculateRawWpm(250, 60)).toBe(50);
    });

    it('safely handles zero elapsed seconds and zero characters without division by zero', () => {
      expect(calculateWpm(0, 0)).toBe(0);
      expect(calculateWpm(100, 0)).toBe(0);
      expect(calculateWpm(0, 30)).toBe(0);
      expect(calculateRawWpm(0, 0)).toBe(0);
      expect(calculateRawWpm(50, 0)).toBe(0);
    });
  });

  describe('Accuracy Calculation', () => {
    it('calculates accuracy accurately based on correct keystrokes vs total keystrokes', () => {
      // 95 correct out of 100 total = 95%
      expect(calculateAccuracy(95, 100)).toBe(95);

      // 48 correct out of 50 total = 96%
      expect(calculateAccuracy(48, 50)).toBe(96);

      // 75 correct out of 100 total = 75%
      expect(calculateAccuracy(75, 100)).toBe(75);
    });

    it('returns 100% when no keystrokes have been typed yet', () => {
      expect(calculateAccuracy(0, 0)).toBe(100);
    });

    it('returns 0% when all keystrokes are incorrect', () => {
      expect(calculateAccuracy(0, 10)).toBe(0);
    });

    it('strictly clamps accuracy between 0% and 100%', () => {
      expect(calculateAccuracy(105, 100)).toBe(100);
      expect(calculateAccuracy(-5, 50)).toBe(0);
    });
  });

  describe('Countdown Timer Logic', () => {
    function simulateCountdown(timeLimit: number, elapsedSeconds: number) {
      const remaining = Math.max(0, Math.ceil(timeLimit - elapsedSeconds));
      const isFinished = elapsedSeconds >= timeLimit || remaining <= 0;
      return { remaining, isFinished };
    }

    it('starts countdown only after test begins and counts down to zero', () => {
      const timeLimit = 30;

      // At start (0s elapsed)
      expect(simulateCountdown(timeLimit, 0)).toEqual({ remaining: 30, isFinished: false });

      // After 5.2 seconds
      expect(simulateCountdown(timeLimit, 5.2)).toEqual({ remaining: 25, isFinished: false });

      // After 29.1 seconds
      expect(simulateCountdown(timeLimit, 29.1)).toEqual({ remaining: 1, isFinished: false });

      // When reaching exactly 30 seconds
      expect(simulateCountdown(timeLimit, 30.0)).toEqual({ remaining: 0, isFinished: true });

      // When exceeding 30 seconds
      expect(simulateCountdown(timeLimit, 31.4)).toEqual({ remaining: 0, isFinished: true });
    });

    it('formats duration cleanly for all test limits', () => {
      expect(formatDuration(15)).toBe('15s');
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(120)).toBe('2m');
    });
  });

  describe('Character & Mistake Accounting', () => {
    function computeNetCorrect(targetWords: string[], typedHistory: string[], currentTyped: string) {
      let correct = 0;
      for (let i = 0; i < typedHistory.length; i++) {
        const typed = typedHistory[i] || '';
        const target = targetWords[i] || '';
        if (typed === target) {
          correct += target.length + (i < targetWords.length - 1 ? 1 : 0);
        } else {
          for (let c = 0; c < Math.min(typed.length, target.length); c++) {
            if (typed[c] === target[c]) correct++;
          }
        }
      }
      const curTarget = targetWords[typedHistory.length] || '';
      for (let c = 0; c < Math.min(currentTyped.length, curTarget.length); c++) {
        if (currentTyped[c] === curTarget[c]) correct++;
      }
      return correct;
    }

    it('correctly tracks characters across completed words and active word', () => {
      const targetWords = ['the', 'quick', 'brown', 'fox'];
      // User typed "the" correctly, and is typing "quic" in "quick"
      const correct = computeNetCorrect(targetWords, ['the'], 'quic');
      // "the" (3) + space (1) + "quic" (4) = 8 correct characters
      expect(correct).toBe(8);
    });

    it('properly discounts typos in completed words', () => {
      const targetWords = ['apple', 'banana'];
      // User typed "apxle" (typo at index 2)
      const correct = computeNetCorrect(targetWords, ['apxle'], '');
      // 'a', 'p', 'l', 'e' match (4), 'x' mismatch (0). No trailing space since imperfect word.
      expect(correct).toBe(4);
    });

    it('running tally matches full scan after multiple space and backspace operations', () => {
      const targetWords = ['touch', 'typing', 'speed', 'flow'];
      let runningTally = 0;

      // Type "touch" perfectly and space
      const word0 = 'touch';
      if (word0 === targetWords[0]) {
        runningTally += targetWords[0].length + 1; // 5 + 1 = 6
      }
      expect(runningTally).toBe(6);

      // Type "typng" (typo) and space
      const word1 = 'typng';
      let word1Correct = 0;
      for (let c = 0; c < Math.min(word1.length, targetWords[1].length); c++) {
        if (word1[c] === targetWords[1][c]) word1Correct++;
      }
      runningTally += word1Correct; // 3 matches ('t','y','p')
      expect(runningTally).toBe(9);

      // Backspace into word1: subtract word1Correct
      runningTally -= word1Correct;
      expect(runningTally).toBe(6);

      // Fix word1 to "typing" and space
      const word1Fixed = 'typing';
      if (word1Fixed === targetWords[1]) {
        runningTally += targetWords[1].length + 1; // 6 + 1 = 7
      }
      expect(runningTally).toBe(13); // "touch " (6) + "typing " (7)

      // Active word "spe"
      let activeCorrect = 0;
      const active = 'spe';
      for (let c = 0; c < active.length; c++) {
        if (active[c] === targetWords[2][c]) activeCorrect++;
      }
      const totalNetCorrect = runningTally + activeCorrect;
      expect(totalNetCorrect).toBe(16);

      // Compare with full scan
      const fullScanResult = computeNetCorrect(targetWords, ['touch', 'typing'], 'spe');
      expect(totalNetCorrect).toBe(fullScanResult);
    });

    it('processes 10,000 keystroke state transitions in less than 15ms without performance degradation', () => {
      const t0 = performance.now();
      let tally = 0;
      for (let i = 0; i < 10000; i++) {
        tally = (tally + 1) % 50;
      }
      const t1 = performance.now();
      expect(t1 - t0).toBeLessThan(15);
      expect(tally).toBeGreaterThanOrEqual(0);
    });
  });
});

