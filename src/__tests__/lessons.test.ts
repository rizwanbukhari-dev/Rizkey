import { describe, it, expect, beforeEach } from 'vitest';
import { LESSONS, STAGES } from '../data/lessons';
import { storage } from '../utils/storage';

describe('Touch-Typing Learning Academy Data Integrity', () => {
  it('contains exactly 15 comprehensive lessons', () => {
    expect(LESSONS).toHaveLength(15);
  });

  it('verifies every lesson has required instructional fields', () => {
    LESSONS.forEach((lesson, index) => {
      expect(lesson.id).toBe(index + 1);
      expect(lesson.title).toBeTruthy();
      expect(lesson.subtitle).toBeTruthy();
      expect(lesson.postureTip).toBeTruthy();
      expect(lesson.exerciseText).toBeTruthy();
      expect(lesson.minAccuracy).toBeGreaterThan(0);
      expect(lesson.minWpm).toBeGreaterThan(0);
      expect(Object.keys(lesson.recommendedFingers).length).toBeGreaterThan(0);
    });
  });

  it('ensures lesson 1 starts on home row anchors F and J', () => {
    const lesson1 = LESSONS[0];
    expect(lesson1.targetKeys).toContain('f');
    expect(lesson1.targetKeys).toContain('j');
    expect(lesson1.recommendedFingers['f']).toBe('Left Index Finger');
    expect(lesson1.recommendedFingers['j']).toBe('Right Index Finger');
  });

  it('verifies lesson 15 is the final advanced assessment', () => {
    const finalLesson = LESSONS[14];
    expect(finalLesson.id).toBe(15);
    expect(finalLesson.minAccuracy).toBe(95);
    expect(finalLesson.minWpm).toBe(45);
  });
});

describe('10 Progressive Stages and Stage Exams', () => {
  it('contains exactly 10 sequential learning stages', () => {
    expect(STAGES).toHaveLength(10);
    STAGES.forEach((stage, idx) => {
      expect(stage.number).toBe(idx + 1);
      expect(stage.title).toBeTruthy();
      expect(stage.description).toBeTruthy();
      expect(stage.lessonIds.length).toBeGreaterThan(0);
      expect(stage.exam).toBeTruthy();
    });
  });

  it('validates stage exam configuration and passing criteria for all 10 stages', () => {
    STAGES.forEach((stage) => {
      const exam = stage.exam;
      expect(exam.title).toBeTruthy();
      expect(exam.description).toBeTruthy();
      expect(exam.targetDescription).toBeTruthy();
      expect(exam.examText.length).toBeGreaterThan(15);
      expect(exam.minAccuracy).toBeGreaterThanOrEqual(90);
      expect(exam.minWpm).toBeGreaterThanOrEqual(10);
      expect(exam.timeLimit).toBeGreaterThan(0);
    });
  });

  it('ensures Stage 2 Home Row exam text contains exclusively home row characters and spaces', () => {
    const stage2 = STAGES[1];
    expect(stage2.title).toBe('Home Row');
    const examText = stage2.exam.examText.toLowerCase();
    const allowedHomeRow = new Set(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', ' ']);
    for (const char of examText) {
      expect(allowedHomeRow.has(char)).toBe(true);
    }
  });

  it('ensures early stage speed goals are beginner-friendly and increase progressively', () => {
    expect(STAGES[0].exam.minWpm).toBeLessThanOrEqual(15); // Stage 1 <= 15 WPM
    expect(STAGES[1].exam.minWpm).toBeLessThanOrEqual(18); // Stage 2 <= 18 WPM
    expect(STAGES[9].exam.minWpm).toBeGreaterThanOrEqual(30); // Final stage >= 30 WPM
  });
});

describe('Strict Sequential Stage Progression & Lock Logic', () => {
  beforeEach(() => {
    storage.clearAllData();
  });

  it('allows access to Stage 1 initially while locking all future stages', () => {
    expect(storage.isStageUnlocked(1)).toBe(true);
    for (let s = 2; s <= 10; s++) {
      expect(storage.isStageUnlocked(s)).toBe(false);
    }
  });

  it('completing lessons alone does NOT unlock the next stage', () => {
    // Complete lesson 1
    storage.saveLessonProgress({
      lessonId: 1,
      completed: true,
      stars: 3,
      bestWpm: 25,
      bestAccuracy: 98,
      attempts: 1,
      lastAttemptAt: Date.now(),
    });

    const progress = storage.getLessonProgress();
    expect(progress[1].completed).toBe(true);

    // Stage 2 must still remain locked because Stage 1 exam was not taken/passed!
    expect(storage.isStageUnlocked(2)).toBe(false);
    const stageProgress = storage.getStageProgress();
    expect(stageProgress[2].status).toBe('locked');
  });

  it('failing the stage exam keeps the next stage locked and marks status as exam_failed', () => {
    const failResult = {
      stageNumber: 1,
      passed: false,
      wpm: 8, // below 12 WPM requirement
      accuracy: 85, // below 90% accuracy requirement
      mistakes: { f: 3 },
      timestamp: Date.now(),
    };

    const saved = storage.saveStageExamResult(1, failResult);
    expect(saved.status).toBe('exam_failed');
    expect(saved.examPassed).toBe(false);

    // Stage 2 must remain locked
    expect(storage.isStageUnlocked(2)).toBe(false);
    const stageProgress = storage.getStageProgress();
    expect(stageProgress[1].status).toBe('exam_failed');
    expect(stageProgress[2].status).toBe('locked');
  });

  it('passing the stage exam unlocks ONLY the next stage', () => {
    const passResult = {
      stageNumber: 1,
      passed: true,
      wpm: 18,
      accuracy: 96,
      mistakes: {},
      timestamp: Date.now(),
    };

    const saved = storage.saveStageExamResult(1, passResult);
    expect(saved.status).toBe('completed');
    expect(saved.examPassed).toBe(true);

    // Stage 2 is now unlocked!
    expect(storage.isStageUnlocked(2)).toBe(true);
    const stageProgress = storage.getStageProgress();
    expect(stageProgress[1].status).toBe('completed');
    expect(stageProgress[2].status).toBe('in_progress');

    // Stage 3 remains locked!
    expect(storage.isStageUnlocked(3)).toBe(false);
    expect(stageProgress[3].status).toBe('locked');
  });

  it('rejects taking an exam on a locked stage', () => {
    expect(storage.isStageUnlocked(3)).toBe(false);
    expect(() => {
      storage.saveStageExamResult(3, {
        stageNumber: 3,
        passed: true,
        wpm: 25,
        accuracy: 95,
        mistakes: {},
        timestamp: Date.now(),
      });
    }).toThrow(/Stage 3 is locked/);
  });

  it('persists stage exam progress across multiple reloads', () => {
    storage.saveStageExamResult(1, {
      stageNumber: 1,
      passed: true,
      wpm: 20,
      accuracy: 97,
      mistakes: {},
      timestamp: Date.now(),
    });

    const reloaded = storage.getStageProgress();
    expect(reloaded[1].examPassed).toBe(true);
    expect(reloaded[1].status).toBe('completed');
    expect(reloaded[2].status).toBe('in_progress');
    expect(reloaded[3].status).toBe('locked');
  });
});
