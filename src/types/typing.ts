export type TestMode = 'time' | 'words' | 'quote' | 'sentences' | 'paragraphs' | 'custom' | 'weak-keys';

export type Difficulty = 'beginner' | 'normal' | 'advanced';

export type TimeLimit = 15 | 30 | 60 | 120;
export type WordLimit = 10 | 25 | 50 | 100;

export type CaretStyle = 'line' | 'block' | 'underline' | 'off';
export type CaretAnimation = 'smooth' | 'blink' | 'off';

export type FontFamily = 'JetBrains Mono' | 'Roboto Mono' | 'Fira Code' | 'Courier New' | 'sans-serif';
export type SoundTheme = 'mechanical' | 'typewriter' | 'click' | 'soft' | 'off';

export interface TimelinePoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface CharStats {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  total: number;
}

export interface TestResult {
  id: string;
  timestamp: number;
  mode: TestMode;
  difficulty: Difficulty;
  timeLimit?: TimeLimit | number;
  wordLimit?: WordLimit | number;
  durationSeconds: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  charStats: CharStats;
  timeline: TimelinePoint[];
  mistakes: Record<string, number>;
  isPersonalBest: boolean;
}

export type AccentColorId = 'teal' | 'blue' | 'purple' | 'green' | 'amber' | 'rose';

export interface UserSettings {
  theme: 'dark' | 'light';
  themePreset?: string;
  accentColor: AccentColorId;
  fontFamily: FontFamily;
  fontSize: number; // 20 to 40
  textWidth: 'narrow' | 'medium' | 'wide' | 'full';
  caretStyle: CaretStyle;
  caretAnimation: CaretAnimation;
  soundTheme: SoundTheme;
  soundVolume: number; // 0.0 to 1.0
  playErrorSound: boolean;
  showKeyboard: boolean;
  highlightFingers: boolean;
  defaultMode: TestMode;
  defaultTimeLimit: TimeLimit;
  defaultWordLimit: WordLimit;
  includePunctuation: boolean;
  includeNumbers: boolean;
  difficulty: Difficulty;
  quickRestartKey: 'tab' | 'esc' | 'tab-enter';
  smoothCursor: boolean;
  blindMode: boolean;
  reducedMotion: boolean;
}

export interface Lesson {
  id: number;
  title: string;
  subtitle: string;
  category: 'basics' | 'rows' | 'advanced' | 'speed';
  postureTip: string;
  targetKeys: string[];
  recommendedFingers: Record<string, string>; // e.g. { 'a': 'Left Pinky', 'f': 'Left Index' }
  instructions: string;
  exerciseText: string;
  minAccuracy: number;
  minWpm: number;
}

export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  stars: number; // 1, 2, or 3
  bestWpm: number;
  bestAccuracy: number;
  attempts: number;
  lastAttemptAt: number;
}

export interface StageExam {
  title: string;
  description: string;
  targetDescription: string;
  examText: string;
  minAccuracy: number;
  minWpm: number;
  timeLimit?: number; // duration in seconds
}

export interface Stage {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  lessonIds: number[];
  exam: StageExam;
}

export interface StageExamResult {
  stageNumber: number;
  passed: boolean;
  wpm: number;
  accuracy: number;
  mistakes: Record<string, number>;
  timestamp: number;
}

export interface StageProgress {
  stageNumber: number;
  status: 'locked' | 'in_progress' | 'exam_failed' | 'completed';
  examPassed: boolean;
  bestWpm?: number;
  bestAccuracy?: number;
  examAttempts: number;
  lastExamResult?: StageExamResult;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'stamina' | 'lessons' | 'games';
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  count: number;
  practiceSeconds: number;
}

export interface CustomPassage {
  id: string;
  title: string;
  category: string;
  text: string;
  createdAt: number;
}
