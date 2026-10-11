import { Achievement, TestResult, LessonProgress } from '../types/typing';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_test',
    title: 'First Keystroke',
    description: 'Complete your very first typing test on RizKey.',
    icon: 'Keyboard',
    category: 'speed',
  },
  {
    id: 'speed_50',
    title: 'Speed Cadet',
    description: 'Reach 50 WPM on any completed typing test.',
    icon: 'Zap',
    category: 'speed',
  },
  {
    id: 'speed_80',
    title: 'Velocity Pilot',
    description: 'Reach 80 WPM on any completed typing test.',
    icon: 'Flame',
    category: 'speed',
  },
  {
    id: 'speed_100',
    title: 'Triple Digits',
    description: 'Break into the elite 100 WPM tier.',
    icon: 'Rocket',
    category: 'speed',
  },
  {
    id: 'bullseye',
    title: 'Flawless Precision',
    description: 'Complete a test with 100% accuracy (min 20 words or 30 seconds).',
    icon: 'Target',
    category: 'accuracy',
  },
  {
    id: 'marathon',
    title: 'Marathon Typist',
    description: 'Complete a full 120-second endurance test.',
    icon: 'Clock',
    category: 'stamina',
  },
  {
    id: 'lesson_first',
    title: 'Academy Scholar',
    description: 'Complete your first lesson in the Touch-Typing Academy.',
    icon: 'BookOpen',
    category: 'lessons',
  },
  {
    id: 'lesson_half',
    title: 'Row Connoisseur',
    description: 'Complete at least 7 lessons in the Touch-Typing Academy.',
    icon: 'Award',
    category: 'lessons',
  },
  {
    id: 'academy_graduate',
    title: 'Academy Graduate',
    description: 'Successfully complete all 15 lessons in the Academy.',
    icon: 'GraduationCap',
    category: 'lessons',
  },
  {
    id: 'streak_3',
    title: 'Consistent Rhythm',
    description: 'Maintain a 3-day consecutive typing practice streak.',
    icon: 'Calendar',
    category: 'stamina',
  },
  {
    id: 'streak_7',
    title: 'Weekly Devotee',
    description: 'Maintain a 7-day consecutive typing practice streak.',
    icon: 'Shield',
    category: 'stamina',
  },
  {
    id: 'chars_5000',
    title: 'Key Artisan',
    description: 'Accumulate over 5,000 correctly typed characters.',
    icon: 'Sparkles',
    category: 'stamina',
  },
  {
    id: 'game_sprint_1000',
    title: 'Sprint Champion',
    description: 'Achieve a score of 1,000 points or more in Word Sprint.',
    icon: 'Trophy',
    category: 'games',
  },
  {
    id: 'game_time_60',
    title: 'Time Survivor',
    description: 'Survive for at least 60 seconds in Time Challenge.',
    icon: 'Hourglass',
    category: 'games',
  },
];

/**
 * Checks which achievements should be unlocked given user's current progress & test result
 */
export function evaluateAchievements(
  results: TestResult[],
  lessons: Record<number, LessonProgress>,
  streak: { currentStreak: number; longestStreak: number },
  gameScores: Record<string, number>,
  currentlyUnlocked: string[]
): string[] {
  const newUnlocks: string[] = [];

  const isUnlocked = (id: string) => currentlyUnlocked.includes(id) || newUnlocks.includes(id);

  // First test
  if (!isUnlocked('first_test') && results.length > 0) {
    newUnlocks.push('first_test');
  }

  // Best WPM checks
  const maxWpm = results.reduce((max, r) => Math.max(max, r.wpm), 0);
  if (!isUnlocked('speed_50') && maxWpm >= 50) newUnlocks.push('speed_50');
  if (!isUnlocked('speed_80') && maxWpm >= 80) newUnlocks.push('speed_80');
  if (!isUnlocked('speed_100') && maxWpm >= 100) newUnlocks.push('speed_100');

  // Bullseye 100%
  if (!isUnlocked('bullseye')) {
    const hasBullseye = results.some(
      r => r.accuracy === 100 && (r.durationSeconds >= 28 || (r.charStats?.total || 0) >= 80)
    );
    if (hasBullseye) newUnlocks.push('bullseye');
  }

  // Marathon
  if (!isUnlocked('marathon')) {
    const hasMarathon = results.some(r => r.durationSeconds >= 118);
    if (hasMarathon) newUnlocks.push('marathon');
  }

  // Lessons
  const completedLessonsCount = Object.values(lessons).filter(l => l.completed).length;
  if (!isUnlocked('lesson_first') && completedLessonsCount >= 1) newUnlocks.push('lesson_first');
  if (!isUnlocked('lesson_half') && completedLessonsCount >= 7) newUnlocks.push('lesson_half');
  if (!isUnlocked('academy_graduate') && completedLessonsCount >= 15) newUnlocks.push('academy_graduate');

  // Streaks
  const maxStreak = Math.max(streak.currentStreak, streak.longestStreak);
  if (!isUnlocked('streak_3') && maxStreak >= 3) newUnlocks.push('streak_3');
  if (!isUnlocked('streak_7') && maxStreak >= 7) newUnlocks.push('streak_7');

  // Total characters
  const totalCorrectChars = results.reduce((sum, r) => sum + (r.charStats?.correct || 0), 0);
  if (!isUnlocked('chars_5000') && totalCorrectChars >= 5000) newUnlocks.push('chars_5000');

  // Games
  if (!isUnlocked('game_sprint_1000') && (gameScores['word-sprint'] || 0) >= 1000) {
    newUnlocks.push('game_sprint_1000');
  }
  if (!isUnlocked('game_time_60') && (gameScores['time-challenge'] || 0) >= 60) {
    newUnlocks.push('game_time_60');
  }

  return newUnlocks;
}
