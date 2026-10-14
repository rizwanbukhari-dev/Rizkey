import React, { createContext, useContext, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TestResult, LessonProgress, Achievement, StageProgress, StageExamResult } from '../types/typing';
import { storage, StreakData } from '../utils/storage';
import { ALL_ACHIEVEMENTS, evaluateAchievements } from '../data/achievements';

interface ProgressContextType {
  results: TestResult[];
  lessons: Record<number, LessonProgress>;
  stageProgress: Record<number, StageProgress>;
  unlockedAchievements: string[];
  allAchievements: Achievement[];
  streak: StreakData;
  weakKeys: Record<string, number>;
  dailyActivities: Record<string, { count: number; practiceSeconds: number }>;
  gameScores: Record<string, number>;
  bestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
  totalTests: number;
  totalTimeSeconds: number;
  addTestResult: (result: Omit<TestResult, 'isPersonalBest'>) => { result: TestResult; isPersonalBest: boolean; newUnlocks: string[] };
  saveLesson: (progress: LessonProgress) => string[];
  saveStageExam: (stageNumber: number, result: StageExamResult) => { passed: boolean; newUnlocks: string[] };
  isStageUnlocked: (stageNumber: number) => boolean;
  saveGameResult: (gameId: string, score: number) => { isNewBest: boolean; newUnlocks: string[] };
  deleteTestResult: (id: string) => void;
  reloadAllData: () => void;
  clearAllHistory: () => void;
  triggerConfetti: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<TestResult[]>(() => storage.getResults());
  const [lessons, setLessons] = useState<Record<number, LessonProgress>>(() => storage.getLessonProgress());
  const [stageProgress, setStageProgress] = useState<Record<number, StageProgress>>(() => storage.getStageProgress());
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => storage.getUnlockedAchievements());
  const [streak, setStreak] = useState<StreakData>(() => storage.getStreak());
  const [weakKeys, setWeakKeys] = useState<Record<string, number>>(() => storage.getWeakKeys());
  const [dailyActivities, setDailyActivities] = useState<Record<string, { count: number; practiceSeconds: number }>>(() => storage.getDailyActivities());
  const [gameScores, setGameScores] = useState<Record<string, number>>(() => storage.getGameScores());

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#E6C76B', '#5DBE76', '#FFFFFF', '#4FA3E3'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  const reloadAllData = useCallback(() => {
    setResults(storage.getResults());
    setLessons(storage.getLessonProgress());
    setStageProgress(storage.getStageProgress());
    setUnlockedAchievements(storage.getUnlockedAchievements());
    setStreak(storage.getStreak());
    setWeakKeys(storage.getWeakKeys());
    setDailyActivities(storage.getDailyActivities());
    setGameScores(storage.getGameScores());
  }, []);

  const clearAllHistory = useCallback(() => {
    storage.clearAllData();
    reloadAllData();
  }, [reloadAllData]);

  const deleteTestResult = useCallback((id: string) => {
    storage.deleteResult(id);
    setResults((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Derived statistics
  const bestWpm = results.reduce((max, r) => Math.max(max, r.wpm), 0);
  const totalTests = results.length;
  const averageWpm = totalTests > 0
    ? Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / totalTests)
    : 0;
  const averageAccuracy = totalTests > 0
    ? Math.round((results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests) * 10) / 10
    : 0;
  const totalTimeSeconds = results.reduce((sum, r) => sum + r.durationSeconds, 0);

  const addTestResult = useCallback((resData: Omit<TestResult, 'isPersonalBest'>) => {
    const isPersonalBest = totalTests > 0 ? resData.wpm > bestWpm : resData.wpm > 0;
    const fullResult: TestResult = {
      ...resData,
      isPersonalBest,
    };

    // Save to storage
    storage.saveResult(fullResult);

    const updatedResults = [fullResult, ...results];
    setResults(updatedResults);

    // Refresh streak and weak keys from storage
    const updatedStreak = storage.getStreak();
    setStreak(updatedStreak);
    setWeakKeys(storage.getWeakKeys());
    setDailyActivities(storage.getDailyActivities());

    // Check achievements
    const newUnlocks = evaluateAchievements(
      updatedResults,
      lessons,
      updatedStreak,
      gameScores,
      unlockedAchievements
    );

    if (newUnlocks.length > 0) {
      newUnlocks.forEach(id => storage.unlockAchievement(id));
      setUnlockedAchievements(prev => [...prev, ...newUnlocks]);
      triggerConfetti();
    } else if (isPersonalBest && resData.wpm >= 30) {
      triggerConfetti();
    }

    return { result: fullResult, isPersonalBest, newUnlocks };
  }, [results, totalTests, bestWpm, lessons, gameScores, unlockedAchievements, triggerConfetti]);

  const saveLesson = useCallback((progress: LessonProgress): string[] => {
    storage.saveLessonProgress(progress);
    const updatedLessons = storage.getLessonProgress();
    setLessons(updatedLessons);

    const newUnlocks = evaluateAchievements(
      results,
      updatedLessons,
      streak,
      gameScores,
      unlockedAchievements
    );

    if (newUnlocks.length > 0) {
      newUnlocks.forEach(id => storage.unlockAchievement(id));
      setUnlockedAchievements(prev => [...prev, ...newUnlocks]);
      triggerConfetti();
    }

    return newUnlocks;
  }, [results, streak, gameScores, unlockedAchievements, triggerConfetti]);

  const saveGameResult = useCallback((gameId: string, score: number) => {
    const isNewBest = storage.saveGameScore(gameId, score);
    const updatedScores = storage.getGameScores();
    setGameScores(updatedScores);

    const newUnlocks = evaluateAchievements(
      results,
      lessons,
      streak,
      updatedScores,
      unlockedAchievements
    );

    if (newUnlocks.length > 0) {
      newUnlocks.forEach(id => storage.unlockAchievement(id));
      setUnlockedAchievements(prev => [...prev, ...newUnlocks]);
      triggerConfetti();
    } else if (isNewBest) {
      triggerConfetti();
    }

    return { isNewBest, newUnlocks };
  }, [results, lessons, streak, unlockedAchievements, triggerConfetti]);

  const saveStageExam = useCallback((stageNumber: number, result: StageExamResult) => {
    storage.saveStageExamResult(stageNumber, result);
    const updated = storage.getStageProgress();
    setStageProgress(updated);

    if (result.passed) {
      triggerConfetti();
    }

    const newUnlocks = evaluateAchievements(
      results,
      lessons,
      streak,
      gameScores,
      unlockedAchievements
    );

    if (newUnlocks.length > 0) {
      newUnlocks.forEach(id => storage.unlockAchievement(id));
      setUnlockedAchievements(prev => [...prev, ...newUnlocks]);
      triggerConfetti();
    }

    return { passed: result.passed, newUnlocks };
  }, [results, lessons, streak, gameScores, unlockedAchievements, triggerConfetti]);

  const isStageUnlocked = useCallback((stageNumber: number) => {
    if (stageNumber <= 1) return true;
    return stageProgress[stageNumber - 1]?.examPassed === true;
  }, [stageProgress]);

  return (
    <ProgressContext.Provider
      value={{
        results,
        lessons,
        stageProgress,
        unlockedAchievements,
        allAchievements: ALL_ACHIEVEMENTS,
        streak,
        weakKeys,
        dailyActivities,
        gameScores,
        bestWpm,
        averageWpm,
        averageAccuracy,
        totalTests,
        totalTimeSeconds,
        addTestResult,
        saveLesson,
        saveStageExam,
        isStageUnlocked,
        saveGameResult,
        reloadAllData,
        clearAllHistory,
        deleteTestResult,
        triggerConfetti,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
