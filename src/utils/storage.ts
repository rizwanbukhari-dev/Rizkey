import { TestResult, UserSettings, LessonProgress, CustomPassage, StageProgress, StageExamResult } from '../types/typing';

export const DEFAULT_CUSTOM_PASSAGES: CustomPassage[] = [
  {
    id: 'passage-touch-typing',
    title: 'The Art of Touch Typing',
    category: 'Mastery',
    text: 'Touch typing is not merely about pressing keys faster; it is about building a direct, uninhibited pathway from conscious thought to the digital page. When your fingers know their home, words appear effortlessly.',
    createdAt: 1700000000000,
  },
  {
    id: 'passage-unix-philosophy',
    title: 'Unix Philosophy',
    category: 'Engineering',
    text: 'Write programs that do one thing and do it well. Write programs to work together. Write programs to handle text streams, because that is a universal interface.',
    createdAt: 1700000001000,
  },
  {
    id: 'passage-pangrams',
    title: 'Agility Pangrams',
    category: 'Warm-up',
    text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Sphinx of black quartz, judge my vow.',
    createdAt: 1700000002000,
  },
  {
    id: 'passage-zen-python',
    title: 'The Zen of Code',
    category: 'Engineering',
    text: 'Beautiful is better than ugly. Explicit is better than implicit. Simple is better than complex. Complex is better than complicated. Readability counts.',
    createdAt: 1700000003000,
  },
  {
    id: 'passage-marcus-aurelius',
    title: 'Stoic Focus',
    category: 'Philosophy',
    text: 'You have power over your mind, not outside events. Realize this, and you will find great strength. Waste no more time arguing about what a good person should be. Be one.',
    createdAt: 1700000004000,
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  themePreset: 'rizkey_amber',
  accentColor: 'amber',
  fontFamily: 'JetBrains Mono',
  fontSize: 32,
  textWidth: 'wide',
  caretStyle: 'line',
  caretAnimation: 'smooth',
  soundTheme: 'click',
  soundVolume: 0.4,
  playErrorSound: true,
  showKeyboard: true,
  highlightFingers: true,
  defaultMode: 'time',
  defaultTimeLimit: 30,
  defaultWordLimit: 25,
  includePunctuation: false,
  includeNumbers: false,
  difficulty: 'normal',
  quickRestartKey: 'tab',
  smoothCursor: true,
  blindMode: false,
  reducedMotion: false,
};

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string; // YYYY-MM-DD
}

const KEYS = {
  SETTINGS: 'rizkey_settings',
  RESULTS: 'rizkey_results',
  LESSONS: 'rizkey_lessons',
  ACHIEVEMENTS: 'rizkey_achievements',
  STREAK: 'rizkey_streak',
  WEAK_KEYS: 'rizkey_weak_keys',
  DAILY_ACTIVITY: 'rizkey_daily_activity',
  GAME_SCORES: 'rizkey_game_scores',
  CUSTOM_PASSAGES: 'rizkey_custom_passages',
  STAGE_PROGRESS: 'rizkey_stage_progress',
};

// Universal storage: uses window.localStorage when available, with in-memory fallback for SSR/Testing/Private browsing
const memoryStore: Record<string, string> = {};

function getItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch {}
  return memoryStore[key] ?? null;
}

function setItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch {}
  memoryStore[key] = value;
}

function removeItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch {}
  delete memoryStore[key];
}

// Safe JSON parser
function safeJsonParse<T>(jsonStr: string | null, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    const parsed = JSON.parse(jsonStr);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export const storage = {
  getSettings(): UserSettings {
    const stored = getItem(KEYS.SETTINGS);
    const parsed = safeJsonParse<Partial<UserSettings>>(stored, {});
    if (parsed.fontSize === 22) {
      parsed.fontSize = 32;
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  },

  saveSettings(settings: UserSettings): void {
    setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getResults(): TestResult[] {
    const stored = getItem(KEYS.RESULTS);
    return safeJsonParse<TestResult[]>(stored, []);
  },

  saveResult(result: TestResult): void {
    const results = this.getResults();
    results.unshift(result); // prepend latest
    const trimmed = results.slice(0, 200);
    setItem(KEYS.RESULTS, JSON.stringify(trimmed));

    // Update weak keys tracking
    this.recordMistakes(result.mistakes);

    // Update daily streak and activity
    this.recordDailyActivity(result.durationSeconds);
  },

  deleteResult(id: string): void {
    const results = this.getResults().filter((r) => r.id !== id);
    setItem(KEYS.RESULTS, JSON.stringify(results));
  },

  getLessonProgress(): Record<number, LessonProgress> {
    const stored = getItem(KEYS.LESSONS);
    return safeJsonParse<Record<number, LessonProgress>>(stored, {});
  },

  saveLessonProgress(progress: LessonProgress): void {
    const allProgress = this.getLessonProgress();
    const existing = allProgress[progress.lessonId];

    allProgress[progress.lessonId] = {
      lessonId: progress.lessonId,
      completed: progress.completed || (existing ? existing.completed : false),
      stars: Math.max(progress.stars, existing?.stars || 0),
      bestWpm: Math.max(progress.bestWpm, existing?.bestWpm || 0),
      bestAccuracy: Math.max(progress.bestAccuracy, existing?.bestAccuracy || 0),
      attempts: (existing?.attempts || 0) + 1,
      lastAttemptAt: Date.now(),
    };

    setItem(KEYS.LESSONS, JSON.stringify(allProgress));
  },

  getStageProgress(): Record<number, StageProgress> {
    const stored = getItem(KEYS.STAGE_PROGRESS);
    const parsed = safeJsonParse<Record<number, StageProgress>>(stored, {});

    // Ensure Stage 1 exists with at least 'in_progress' status
    if (!parsed[1]) {
      parsed[1] = {
        stageNumber: 1,
        status: 'in_progress',
        examPassed: false,
        examAttempts: 0,
      };
    }

    // Strictly enforce sequential unlock statuses:
    // Stage 1 is unlocked initially.
    // Stage N (N > 1) is unlocked if and only if Stage N-1 has examPassed === true.
    for (let s = 1; s <= 10; s++) {
      const isUnlocked = s === 1 || (parsed[s - 1]?.examPassed === true);
      if (!parsed[s]) {
        parsed[s] = {
          stageNumber: s,
          status: isUnlocked ? 'in_progress' : 'locked',
          examPassed: false,
          examAttempts: 0,
        };
      } else {
        if (!isUnlocked) {
          parsed[s].status = 'locked';
          parsed[s].examPassed = false;
        } else if (parsed[s].examPassed) {
          parsed[s].status = 'completed';
        } else if (parsed[s].status === 'locked') {
          parsed[s].status = 'in_progress';
        }
      }
    }

    return parsed;
  },

  isStageUnlocked(stageNumber: number): boolean {
    if (stageNumber <= 1) return true;
    const progress = this.getStageProgress();
    return progress[stageNumber - 1]?.examPassed === true;
  },

  saveStageExamResult(stageNumber: number, result: StageExamResult): StageProgress {
    if (!this.isStageUnlocked(stageNumber)) {
      throw new Error(`Stage ${stageNumber} is locked.`);
    }

    const allProgress = this.getStageProgress();
    const existing = allProgress[stageNumber] || {
      stageNumber,
      status: 'in_progress',
      examPassed: false,
      examAttempts: 0,
    };

    const isPassed = result.passed;
    const examPassed = existing.examPassed || isPassed;
    const attempts = (existing.examAttempts || 0) + 1;
    const status: StageProgress['status'] = examPassed
      ? 'completed'
      : 'exam_failed';

    const updated: StageProgress = {
      stageNumber,
      status,
      examPassed,
      bestWpm: Math.max(result.wpm, existing.bestWpm || 0),
      bestAccuracy: Math.max(result.accuracy, existing.bestAccuracy || 0),
      examAttempts: attempts,
      lastExamResult: result,
    };

    allProgress[stageNumber] = updated;

    // Immediately unlock stageNumber + 1 if passed
    if (isPassed && stageNumber < 10) {
      if (!allProgress[stageNumber + 1] || allProgress[stageNumber + 1].status === 'locked') {
        allProgress[stageNumber + 1] = {
          stageNumber: stageNumber + 1,
          status: 'in_progress',
          examPassed: false,
          examAttempts: 0,
        };
      }
    }

    setItem(KEYS.STAGE_PROGRESS, JSON.stringify(allProgress));
    return updated;
  },

  getUnlockedAchievements(): string[] {
    const stored = getItem(KEYS.ACHIEVEMENTS);
    return safeJsonParse<string[]>(stored, []);
  },

  unlockAchievement(id: string): boolean {
    const current = this.getUnlockedAchievements();
    if (!current.includes(id)) {
      current.push(id);
      setItem(KEYS.ACHIEVEMENTS, JSON.stringify(current));
      return true; // newly unlocked
    }
    return false;
  },

  getStreak(): StreakData {
    const stored = getItem(KEYS.STREAK);
    return safeJsonParse<StreakData>(stored, {
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: '',
    });
  },

  recordDailyActivity(seconds: number): void {
    const today = new Date().toISOString().split('T')[0];
    const streak = this.getStreak();

    if (streak.lastPracticeDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      let newCurrent = 1;
      if (streak.lastPracticeDate === yesterday) {
        newCurrent = streak.currentStreak + 1;
      }
      const newLongest = Math.max(newCurrent, streak.longestStreak);
      const updatedStreak: StreakData = {
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastPracticeDate: today,
      };
      setItem(KEYS.STREAK, JSON.stringify(updatedStreak));
    }

    // Record count and seconds for daily activity heatmap
    const storedActivities = getItem(KEYS.DAILY_ACTIVITY);
    const activities = safeJsonParse<Record<string, { count: number; practiceSeconds: number }>>(storedActivities, {});
    const existingDay = activities[today] || { count: 0, practiceSeconds: 0 };
    activities[today] = {
      count: existingDay.count + 1,
      practiceSeconds: existingDay.practiceSeconds + Math.round(seconds),
    };
    setItem(KEYS.DAILY_ACTIVITY, JSON.stringify(activities));
  },

  getDailyActivities(): Record<string, { count: number; practiceSeconds: number }> {
    const stored = getItem(KEYS.DAILY_ACTIVITY);
    return safeJsonParse<Record<string, { count: number; practiceSeconds: number }>>(stored, {});
  },

  getWeakKeys(): Record<string, number> {
    const stored = getItem(KEYS.WEAK_KEYS);
    return safeJsonParse<Record<string, number>>(stored, {});
  },

  recordMistakes(mistakes: Record<string, number>): void {
    if (!mistakes) return;
    const current = this.getWeakKeys();
    Object.entries(mistakes).forEach(([char, count]) => {
      const key = char.toLowerCase();
      current[key] = (current[key] || 0) + count;
    });
    setItem(KEYS.WEAK_KEYS, JSON.stringify(current));
  },

  getGameScores(): Record<string, number> {
    const stored = getItem(KEYS.GAME_SCORES);
    return safeJsonParse<Record<string, number>>(stored, {});
  },

  saveGameScore(gameId: string, score: number): boolean {
    const scores = this.getGameScores();
    const currentBest = scores[gameId] || 0;
    if (score > currentBest) {
      scores[gameId] = score;
      setItem(KEYS.GAME_SCORES, JSON.stringify(scores));
      return true; // new high score
    }
    return false;
  },

  getCustomPassages(): CustomPassage[] {
    const stored = getItem(KEYS.CUSTOM_PASSAGES);
    const passages = safeJsonParse<CustomPassage[]>(stored, []);
    return passages.length > 0 ? passages : DEFAULT_CUSTOM_PASSAGES;
  },

  saveCustomPassage(passage: CustomPassage): void {
    const passages = this.getCustomPassages();
    const existingIndex = passages.findIndex((p) => p.id === passage.id);
    if (existingIndex >= 0) {
      passages[existingIndex] = passage;
    } else {
      passages.unshift(passage);
    }
    setItem(KEYS.CUSTOM_PASSAGES, JSON.stringify(passages));
  },

  deleteCustomPassage(id: string): void {
    const passages = this.getCustomPassages().filter((p) => p.id !== id);
    setItem(KEYS.CUSTOM_PASSAGES, JSON.stringify(passages));
  },

  exportAllData(): string {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      results: this.getResults(),
      lessons: this.getLessonProgress(),
      achievements: this.getUnlockedAchievements(),
      streak: this.getStreak(),
      weakKeys: this.getWeakKeys(),
      dailyActivity: this.getDailyActivities(),
      gameScores: this.getGameScores(),
      customPassages: this.getCustomPassages(),
      stageProgress: this.getStageProgress(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') return false;

      if (parsed.settings) setItem(KEYS.SETTINGS, JSON.stringify(parsed.settings));
      if (Array.isArray(parsed.results)) setItem(KEYS.RESULTS, JSON.stringify(parsed.results));
      if (parsed.lessons) setItem(KEYS.LESSONS, JSON.stringify(parsed.lessons));
      if (Array.isArray(parsed.achievements)) setItem(KEYS.ACHIEVEMENTS, JSON.stringify(parsed.achievements));
      if (parsed.streak) setItem(KEYS.STREAK, JSON.stringify(parsed.streak));
      if (parsed.weakKeys) setItem(KEYS.WEAK_KEYS, JSON.stringify(parsed.weakKeys));
      if (parsed.dailyActivity) setItem(KEYS.DAILY_ACTIVITY, JSON.stringify(parsed.dailyActivity));
      if (parsed.gameScores) setItem(KEYS.GAME_SCORES, JSON.stringify(parsed.gameScores));
      if (Array.isArray(parsed.customPassages)) setItem(KEYS.CUSTOM_PASSAGES, JSON.stringify(parsed.customPassages));
      if (parsed.stageProgress) setItem(KEYS.STAGE_PROGRESS, JSON.stringify(parsed.stageProgress));

      return true;
    } catch {
      return false;
    }
  },

  clearAllData(): void {
    Object.values(KEYS).forEach((k) => removeItem(k));
  },
};
