import { describe, it, expect } from 'vitest';
import {
  calculateWpm,
  calculateRawWpm,
  calculateAccuracy,
  formatDuration,
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
  });

  describe('formatDuration', () => {
    it('formats seconds correctly', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(15)).toBe('15s');
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(75)).toBe('1m 15s');
      expect(formatDuration(120)).toBe('2m');
    });
  });
});
