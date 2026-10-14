import { describe, it, expect } from 'vitest';
import {
  calculateWpm,
  calculateRawWpm,
  calculateAccuracy,
  calculateConsistency,
  formatDuration,
  formatDate,
  formatDateTime,
} from '../utils/metrics';

describe('Metrics Calculations', () => {
  describe('calculateWpm', () => {
    it('calculates standard WPM based on 5 chars per word', () => {
      // 50 characters in 60 seconds = 10 words in 1 min = 10 WPM
      expect(calculateWpm(50, 60)).toBe(10);
      // 250 characters in 60 seconds = 50 WPM
      expect(calculateWpm(250, 60)).toBe(50);
      // 125 characters in 30 seconds = 50 WPM
      expect(calculateWpm(125, 30)).toBe(50);
    });

    it('safely handles zero elapsed time without NaN or crash', () => {
      expect(calculateWpm(100, 0)).toBe(0);
      expect(calculateWpm(0, 0)).toBe(0);
    });

    it('safely handles zero or negative correct characters', () => {
      expect(calculateWpm(0, 30)).toBe(0);
      expect(calculateWpm(-10, 30)).toBe(0);
    });

    it('safely guards against NaN and Infinity values', () => {
      expect(calculateWpm(NaN, 30)).toBe(0);
      expect(calculateWpm(100, NaN)).toBe(0);
      expect(calculateWpm(Infinity, 30)).toBe(0);
      expect(calculateWpm(100, Infinity)).toBe(0);
    });
  });

  describe('calculateRawWpm', () => {
    it('calculates raw WPM from total typed characters', () => {
      expect(calculateRawWpm(300, 60)).toBe(60);
      expect(calculateRawWpm(150, 30)).toBe(60);
    });

    it('safely handles edge cases', () => {
      expect(calculateRawWpm(0, 30)).toBe(0);
      expect(calculateRawWpm(50, 0)).toBe(0);
    });

    it('safely guards against NaN and Infinity values', () => {
      expect(calculateRawWpm(NaN, 30)).toBe(0);
      expect(calculateRawWpm(150, NaN)).toBe(0);
      expect(calculateRawWpm(Infinity, 30)).toBe(0);
      expect(calculateRawWpm(150, Infinity)).toBe(0);
    });
  });

  describe('calculateAccuracy', () => {
    it('calculates accurate percentages with one decimal place', () => {
      expect(calculateAccuracy(95, 100)).toBe(95);
      expect(calculateAccuracy(48, 50)).toBe(96);
    });

    it('caps accuracy at 100% and does not exceed it', () => {
      expect(calculateAccuracy(105, 100)).toBe(100);
      expect(calculateAccuracy(100, 100)).toBe(100);
    });

    it('safely returns 100% if no characters typed yet', () => {
      expect(calculateAccuracy(0, 0)).toBe(100);
    });

    it('returns 0% if all typed characters were wrong', () => {
      expect(calculateAccuracy(0, 10)).toBe(0);
    });

    it('safely guards against NaN and Infinity values', () => {
      expect(calculateAccuracy(NaN, 100)).toBe(0);
      expect(calculateAccuracy(50, NaN)).toBe(0);
      expect(calculateAccuracy(Infinity, 100)).toBe(0);
      expect(calculateAccuracy(50, Infinity)).toBe(0);
    });
  });

  describe('calculateConsistency', () => {
    it('returns 100 for fewer than 2 snapshots', () => {
      expect(calculateConsistency([])).toBe(100);
      expect(calculateConsistency([50])).toBe(100);
    });

    it('returns high consistency for stable WPM snapshots', () => {
      const stable = [60, 61, 59, 60, 60];
      const consistency = calculateConsistency(stable);
      expect(consistency).toBeGreaterThan(95);
      expect(consistency).toBeLessThanOrEqual(100);
    });

    it('returns lower consistency for erratic WPM snapshots', () => {
      const erratic = [10, 80, 20, 95, 15];
      const consistency = calculateConsistency(erratic);
      expect(consistency).toBeLessThan(70);
    });

    it('safely handles non-finite numbers and zeros in snapshots', () => {
      expect(calculateConsistency([NaN, Infinity, 0])).toBe(100);
      expect(calculateConsistency([50, NaN, 50])).toBe(100);
    });
  });

  describe('formatDuration', () => {
    it('formats seconds correctly', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(15)).toBe('15s');
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(75)).toBe('1m 15s');
      expect(formatDuration(120)).toBe('2m');
    });

    it('safely handles negative numbers', () => {
      expect(formatDuration(-10)).toBe('0s');
    });
  });

  describe('formatDate and formatDateTime', () => {
    it('formats timestamps into valid date strings without crashing', () => {
      const ts = 1700000000000;
      expect(typeof formatDate(ts)).toBe('string');
      expect(formatDate(ts).length).toBeGreaterThan(0);
      expect(typeof formatDateTime(ts)).toBe('string');
      expect(formatDateTime(ts).length).toBeGreaterThan(0);
    });
  });
});

