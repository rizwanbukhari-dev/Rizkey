/**
 * Standard typing test calculation utilities for RizKey
 */

/**
 * Calculates net Words Per Minute (WPM)
 * Standard formula: (all correct characters / 5) / (elapsed minutes)
 * Guaranteed to never return negative numbers or NaN.
 */
/**
 * Calculates net Words Per Minute (WPM)
 * Standard formula: (all correct characters / 5) / (elapsed minutes)
 * Guaranteed to never return negative numbers, NaN, or Infinity.
 */
export function calculateWpm(correctChars: number, timeInSeconds: number): number {
  if (!Number.isFinite(correctChars) || !Number.isFinite(timeInSeconds) || timeInSeconds <= 0 || correctChars <= 0) {
    return 0;
  }
  const minutes = timeInSeconds / 60;
  const wpm = (correctChars / 5) / minutes;
  if (!Number.isFinite(wpm) || Number.isNaN(wpm)) return 0;
  return Math.max(0, Math.round(wpm));
}

/**
 * Calculates Raw Words Per Minute (Raw WPM)
 * Formula: (total typed keystrokes / 5) / (elapsed minutes)
 */
export function calculateRawWpm(totalTypedChars: number, timeInSeconds: number): number {
  if (!Number.isFinite(totalTypedChars) || !Number.isFinite(timeInSeconds) || timeInSeconds <= 0 || totalTypedChars <= 0) {
    return 0;
  }
  const minutes = timeInSeconds / 60;
  const rawWpm = (totalTypedChars / 5) / minutes;
  if (!Number.isFinite(rawWpm) || Number.isNaN(rawWpm)) return 0;
  return Math.max(0, Math.round(rawWpm));
}

/**
 * Calculates accuracy percentage
 * Formula: (correct keystrokes / total keystrokes typed) * 100
 * Capped at 100%, minimum 0%, safe against division by zero, NaN, and Infinity.
 */
export function calculateAccuracy(correctChars: number, totalTypedChars: number): number {
  if (totalTypedChars === 0 && (correctChars === 0 || !Number.isFinite(correctChars))) return 100;
  if (!Number.isFinite(totalTypedChars) || totalTypedChars <= 0) return 0;
  if (!Number.isFinite(correctChars) || correctChars <= 0) return 0;
  const acc = (correctChars / totalTypedChars) * 100;
  if (!Number.isFinite(acc) || Number.isNaN(acc)) return 0;
  return Math.min(100, Math.max(0, Math.round(acc * 10) / 10)); // 1 decimal place
}

/**
 * Calculates consistency score (0 to 100%) based on Coefficient of Variation across WPM snapshots
 */
export function calculateConsistency(wpmSnapshots: number[]): number {
  if (!wpmSnapshots || wpmSnapshots.length < 2) return 100;
  const validWpms = wpmSnapshots.filter((w) => typeof w === 'number' && Number.isFinite(w) && w > 0);
  if (validWpms.length < 2) return 100;

  const mean = validWpms.reduce((sum, val) => sum + val, 0) / validWpms.length;
  if (!Number.isFinite(mean) || mean <= 0) return 100;

  const variance =
    validWpms.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validWpms.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean; // coefficient of variation

  if (!Number.isFinite(cv) || Number.isNaN(cv)) return 100;
  // Higher consistency = lower variation
  const consistency = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
  return consistency;
}

/**
 * Formats a duration in seconds to a human-readable string (e.g., "1m 15s" or "15s")
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s';
  const roundedSecs = Math.round(seconds * 10) / 10;
  const mins = Math.floor(roundedSecs / 60);
  const remainingSecs = Math.round((roundedSecs % 60) * 10) / 10;

  if (mins === 0) {
    return `${remainingSecs}s`;
  }
  if (remainingSecs === 0) {
    return `${mins}m`;
  }
  return `${mins}m ${remainingSecs}s`;
}

/**
 * Formats a timestamp into a clean date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a timestamp into date & time
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
