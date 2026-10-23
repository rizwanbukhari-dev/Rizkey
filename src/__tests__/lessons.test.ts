import { describe, it, expect, beforeEach } from 'vitest';
import { LESSONS, STAGES } from '../data/lessons';
import { storage } from '../utils/storage';

describe('Touch-Typing Learning Academy Data Integrity', () => {
  it('contains exactly 15 comprehensive lessons in strictly sequential order', () => {
    expect(LESSONS).toHaveLength(15);
    LESSONS.forEach((lesson, index) => {
      expect(lesson.id).toBe(index + 1);
    });
  });

  it('verifies every lesson has required instructional fields and multi-stage practice', () => {
    LESSONS.forEach((lesson, index) => {
      expect(lesson.id).toBe(index + 1);
      expect(lesson.title).toBeTruthy();
      expect(lesson.subtitle).toBeTruthy();
      expect(lesson.postureTip).toBeTruthy();
      expect(lesson.exerciseText).toBeTruthy();
      expect(lesson.minAccuracy).toBeGreaterThan(0);
      expect(lesson.minWpm).toBeGreaterThan(0);
      expect(Object.keys(lesson.recommendedFingers).length).toBeGreaterThan(0);

      // Verify each lesson has 3 progressive practice stages (Intro, Keys/Drill, Words)
      expect(lesson.practiceStages).toBeDefined();
      expect(lesson.practiceStages!.length).toBeGreaterThanOrEqual(3);
      lesson.practiceStages!.forEach((ps, sIdx) => {
        expect(ps.stageIndex).toBe(sIdx);
        expect(ps.title).toBeTruthy();
        expect(ps.exerciseText.length).toBeGreaterThan(10);
      });
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

describe('10 Progressive Stages and Sequential Lesson Ordering', () => {
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

  it('guarantees lesson IDs across all 10 stages are strictly monotonic and cover all 15 lessons', () => {
    const allStageLessonIds = STAGES.flatMap((s) => s.lessonIds);
    expect(allStageLessonIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
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

describe('Home Row Full Key Coverage and Reachability', () => {
  it('covers all intended Home Row keys: A S D F G H J K L ; across Lessons 2, 3, and 4', () => {
    const stage2 = STAGES.find((s) => s.number === 2)!;
    expect(stage2.lessonIds).toEqual([2, 3, 4]);

    const l2 = LESSONS.find((l) => l.id === 2)!;
    const l3 = LESSONS.find((l) => l.id === 3)!;
    const l4 = LESSONS.find((l) => l.id === 4)!;

    // Lesson 2 introduces base home keys
    expect(l2.targetKeys).toEqual(expect.arrayContaining(['a', 's', 'd', 'f', 'j', 'k', 'l', ';']));

    // Lesson 3 introduces G and H lateral reaches
    expect(l3.targetKeys).toContain('g');
    expect(l3.targetKeys).toContain('h');

    // Lesson 4 unifies all home row keys into words
    const allHomeKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
    allHomeKeys.forEach((k) => {
      expect(l4.targetKeys).toContain(k);
    });
  });

  it('ensures every practice stage in Home Row is fully populated with distinct exercises', () => {
    [2, 3, 4].forEach((id) => {
      const lesson = LESSONS.find((l) => l.id === id)!;
      expect(lesson.practiceStages).toHaveLength(3);

      const [stage0, stage1, stage2] = lesson.practiceStages!;
      expect(stage0.type).toBe('intro');
      expect(stage1.type).toBe('keys');
      expect(stage2.type).toBe('words');

      // Ensure exercises are distinct and substantive
      expect(stage0.exerciseText).not.toEqual(stage1.exerciseText);
      expect(stage1.exerciseText).not.toEqual(stage2.exerciseText);
    });
  });
});

describe('Strict Sequential Stage Progression & Exam Lock Logic', () => {
  beforeEach(() => {
    storage.clearAllData();
  });

  it('allows access to Stage 1 initially while locking all future stages', () => {
    expect(storage.isStageUnlocked(1)).toBe(true);
    for (let s = 2; s <= 10; s++) {
      expect(storage.isStageUnlocked(s)).toBe(false);
    }
  });

  it('keeps Stage 1 exam locked until Lesson 1 is completed', () => {
    expect(storage.isStageUnlocked(1)).toBe(true);
    expect(storage.isStageExamUnlocked(1)).toBe(false);

    expect(() => {
      storage.saveStageExamResult(1, {
        stageNumber: 1,
        passed: true,
        wpm: 20,
        accuracy: 95,
        mistakes: {},
        timestamp: Date.now(),
      });
    }).toThrow(/Stage 1 exam is locked/);
  });

  it('unlocks Stage 1 exam only when Lesson 1 is completed', () => {
    storage.saveLessonProgress({
      lessonId: 1,
      completed: true,
      stars: 3,
      bestWpm: 25,
      bestAccuracy: 98,
      attempts: 1,
      lastAttemptAt: Date.now(),
    });

    expect(storage.isStageExamUnlocked(1)).toBe(true);
  });

  it('completing lessons alone does NOT unlock the next stage', () => {
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
    // Complete lesson 1 first
    storage.saveLessonProgress({
      lessonId: 1,
      completed: true,
      stars: 3,
      bestWpm: 25,
      bestAccuracy: 98,
      attempts: 1,
      lastAttemptAt: Date.now(),
    });

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

  it('passing Stage 1 exam unlocks Stage 2, but leaves Stage 2 exam locked until all Home Row lessons are done', () => {
    // Complete Lesson 1
    storage.saveLessonProgress({
      lessonId: 1,
      completed: true,
      stars: 3,
      bestWpm: 25,
      bestAccuracy: 98,
      attempts: 1,
      lastAttemptAt: Date.now(),
    });

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

    // Stage 2 is unlocked
    expect(storage.isStageUnlocked(2)).toBe(true);

    // CRITICAL: Stage 2 exam must be LOCKED because lessons 2, 3, 4 are not yet completed!
    expect(storage.isStageExamUnlocked(2)).toBe(false);

    // Attempting to jump to Stage 2 exam directly must throw an error
    expect(() => {
      storage.saveStageExamResult(2, {
        stageNumber: 2,
        passed: true,
        wpm: 20,
        accuracy: 95,
        mistakes: {},
        timestamp: Date.now(),
      });
    }).toThrow(/Stage 2 exam is locked/);
  });

  it('Home Row does not jump to the exam after practising only F and J: requires Lessons 2, 3, and 4', () => {
    // Complete Stage 1 (F and J)
    storage.saveLessonProgress({ lessonId: 1, completed: true, stars: 3, bestWpm: 20, bestAccuracy: 98, attempts: 1, lastAttemptAt: Date.now() });
    storage.saveStageExamResult(1, { stageNumber: 1, passed: true, wpm: 20, accuracy: 98, mistakes: {}, timestamp: Date.now() });
    expect(storage.isStageUnlocked(2)).toBe(true);

    // Complete Lesson 2 (The Home-Row Keys: A S D F J K L ;)
    storage.saveLessonProgress({ lessonId: 2, completed: true, stars: 3, bestWpm: 22, bestAccuracy: 97, attempts: 1, lastAttemptAt: Date.now() });
    // Stage 2 exam is STILL locked because lessons 3 and 4 remain!
    expect(storage.isStageExamUnlocked(2)).toBe(false);

    // Complete Lesson 3 (Correct Finger Placement: G and H)
    storage.saveLessonProgress({ lessonId: 3, completed: true, stars: 3, bestWpm: 24, bestAccuracy: 96, attempts: 1, lastAttemptAt: Date.now() });
    // Stage 2 exam is STILL locked because lesson 4 remains!
    expect(storage.isStageExamUnlocked(2)).toBe(false);

    // Complete Lesson 4 (Home-Row Word Mastery)
    storage.saveLessonProgress({ lessonId: 4, completed: true, stars: 3, bestWpm: 25, bestAccuracy: 96, attempts: 1, lastAttemptAt: Date.now() });
    // NOW and ONLY now is the Stage 2 Home Row exam unlocked!
    expect(storage.isStageExamUnlocked(2)).toBe(true);

    // Now Stage 2 exam can be taken successfully
    const exam2Result = storage.saveStageExamResult(2, {
      stageNumber: 2,
      passed: true,
      wpm: 22,
      accuracy: 96,
      mistakes: {},
      timestamp: Date.now(),
    });
    expect(exam2Result.examPassed).toBe(true);
    expect(storage.isStageUnlocked(3)).toBe(true);
  });

  it('does NOT mark a lesson complete simply because one short exercise (stage 0) has ended', () => {
    // Save partial progress for Lesson 2 (completed stage 0 only)
    storage.saveLessonProgress({
      lessonId: 2,
      completed: false, // NOT complete
      currentStageIndex: 1,
      completedStageIndices: [0],
      stars: 0,
      bestWpm: 18,
      bestAccuracy: 95,
      attempts: 1,
      lastAttemptAt: Date.now(),
    });

    const progress = storage.getLessonProgress();
    expect(progress[2].completed).toBe(false);
    expect(progress[2].currentStageIndex).toBe(1);
    expect(progress[2].completedStageIndices).toEqual([0]);

    // Stage 2 exam must remain locked
    expect(storage.isStageExamUnlocked(2)).toBe(false);
  });

  it('persists unfinished practice stage progress across reloads without incorrectly marking complete', () => {
    storage.saveLessonProgress({
      lessonId: 3,
      completed: false,
      currentStageIndex: 2,
      completedStageIndices: [0, 1],
      stars: 0,
      bestWpm: 20,
      bestAccuracy: 94,
      attempts: 2,
      lastAttemptAt: Date.now(),
    });

    // Simulate reloading from storage
    const reloaded = storage.getLessonProgress();
    expect(reloaded[3].completed).toBe(false);
    expect(reloaded[3].currentStageIndex).toBe(2);
    expect(reloaded[3].completedStageIndices).toEqual([0, 1]);
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

  it('allows retaking an exam that has already been passed', () => {
    // Complete lesson 1 and pass exam 1
    storage.saveLessonProgress({ lessonId: 1, completed: true, stars: 3, bestWpm: 20, bestAccuracy: 98, attempts: 1, lastAttemptAt: Date.now() });
    storage.saveStageExamResult(1, { stageNumber: 1, passed: true, wpm: 20, accuracy: 98, mistakes: {}, timestamp: Date.now() });

    // Retake exam 1 with a higher speed
    const retake = storage.saveStageExamResult(1, {
      stageNumber: 1,
      passed: true,
      wpm: 28,
      accuracy: 99,
      mistakes: {},
      timestamp: Date.now(),
    });
    expect(retake.examPassed).toBe(true);
    expect(retake.bestWpm).toBe(28);
    expect(retake.examAttempts).toBe(2);
  });
});
