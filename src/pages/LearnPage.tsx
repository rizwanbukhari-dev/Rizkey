import React, { useState, useMemo } from 'react';
import { LESSONS, STAGES } from '../data/lessons';
import { Lesson, LessonProgress, Stage, StageExamResult } from '../types/typing';
import { useProgress } from '../context/ProgressContext';
import { useToast } from '../context/ToastContext';
import { TypingEngine } from '../components/typing/TypingEngine';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  BookOpen,
  CheckCircle,
  Star,
  Award,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  Lock,
  Trophy,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export const LearnPage: React.FC = () => {
  const { lessons, stageProgress, saveLesson, saveStageExam, isStageUnlocked, isStageExamUnlocked } = useProgress();
  const { toast } = useToast();

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [exerciseResult, setExerciseResult] = useState<{
    passed: boolean;
    wpm: number;
    accuracy: number;
    stars: number;
    isStageFinal: boolean;
    stageIndex: number;
  } | null>(null);

  // Stage Exam State
  const [activeExamStage, setActiveExamStage] = useState<Stage | null>(null);
  const [examResult, setExamResult] = useState<StageExamResult | null>(null);

  const [engineKey, setEngineKey] = useState(0);

  // Overall statistics
  const completedLessonsCount = Object.values(lessons).filter((l) => l.completed).length;
  const totalStars = Object.values(lessons).reduce((acc, curr) => acc + (curr.stars || 0), 0);
  const totalLessons = LESSONS.length;
  const progressPercent = Math.round((completedLessonsCount / totalLessons) * 100);

  const completedStagesCount = useMemo(() => {
    return STAGES.filter((s) => stageProgress[s.number]?.examPassed).length;
  }, [stageProgress]);

  // Determine current recommended action for "Continue Learning" banner
  const continueAction = useMemo(() => {
    // Find the first unlocked stage that is not completed
    const currentStage = STAGES.find((s) => {
      const unlocked = isStageUnlocked(s.number);
      const passed = stageProgress[s.number]?.examPassed;
      return unlocked && !passed;
    });

    if (!currentStage) {
      if (completedStagesCount === STAGES.length) {
        return { type: 'finished' as const, stage: STAGES[STAGES.length - 1] };
      }
      return { type: 'lesson' as const, stage: STAGES[0], lesson: LESSONS[0] };
    }

    // Check for unfinished lessons in current stage
    const stageLessons = LESSONS.filter((l) => currentStage.lessonIds.includes(l.id));
    const nextUnfinishedLesson = stageLessons.find((l) => !lessons[l.id]?.completed);

    if (nextUnfinishedLesson) {
      return { type: 'lesson' as const, stage: currentStage, lesson: nextUnfinishedLesson };
    }

    // All lessons completed in stage, but exam not passed -> Exam is next!
    return { type: 'exam' as const, stage: currentStage };
  }, [isStageUnlocked, stageProgress, lessons, completedStagesCount]);

  // Get active practice stages for the currently opened lesson
  const currentPracticeStages = useMemo(() => {
    if (!activeLesson) return [];
    if (activeLesson.practiceStages && activeLesson.practiceStages.length > 0) {
      return activeLesson.practiceStages;
    }
    return [
      {
        stageIndex: 0,
        title: 'Core Practice',
        type: 'words' as const,
        instructions: activeLesson.instructions,
        targetKeys: activeLesson.targetKeys,
        exerciseText: activeLesson.exerciseText,
        minAccuracy: activeLesson.minAccuracy,
        minWpm: activeLesson.minWpm,
      },
    ];
  }, [activeLesson]);

  const currentPracticeStage = currentPracticeStages[activeStageIndex] || currentPracticeStages[0];

  // Start regular lesson with safe practice stage selection
  const startLesson = (lesson: Lesson, stage: Stage, targetStageIndex?: number) => {
    if (!isStageUnlocked(stage.number)) {
      toast.error(`Stage ${stage.number} is locked. Pass the Stage ${stage.number - 1} exam to unlock.`);
      return;
    }
    setActiveExamStage(null);
    setExamResult(null);
    setActiveLesson(lesson);

    const progress = lessons[lesson.id];
    let selectedIndex = 0;
    if (targetStageIndex !== undefined) {
      selectedIndex = targetStageIndex;
    } else if (progress?.completed) {
      selectedIndex = 0;
    } else if (progress?.currentStageIndex !== undefined) {
      selectedIndex = progress.currentStageIndex;
    }

    const availableStagesCount = lesson.practiceStages?.length || 1;
    if (selectedIndex >= availableStagesCount) {
      selectedIndex = 0;
    }

    setActiveStageIndex(selectedIndex);
    setExerciseResult(null);
    setEngineKey((k) => k + 1);
  };

  const startLessonStage = (stageIndex: number) => {
    if (!activeLesson) return;
    setActiveStageIndex(stageIndex);
    setExerciseResult(null);
    setEngineKey((k) => k + 1);
  };

  const handleLessonComplete = (rawResult: { wpm: number; accuracy: number }) => {
    if (!activeLesson || !currentPracticeStage) return;

    const { wpm, accuracy } = rawResult;
    const requiredAccuracy = currentPracticeStage.minAccuracy || activeLesson.minAccuracy;
    const requiredWpm = currentPracticeStage.minWpm || activeLesson.minWpm;
    const passed = accuracy >= requiredAccuracy && wpm >= requiredWpm;

    const totalStagesInLesson = currentPracticeStages.length;
    const isStageFinal = activeStageIndex >= totalStagesInLesson - 1;

    const existingProgress = lessons[activeLesson.id];
    const prevCompletedStages = existingProgress?.completedStageIndices || [];
    const newCompletedStages = passed
      ? Array.from(new Set([...prevCompletedStages, activeStageIndex]))
      : prevCompletedStages;

    // A lesson is ONLY marked completed when ALL required practice stages are passed
    const isLessonFullyCompleted = passed && (isStageFinal || newCompletedStages.length >= totalStagesInLesson);

    let stars = 0;
    if (isLessonFullyCompleted) {
      if (accuracy >= 98 && wpm >= activeLesson.minWpm * 1.3) {
        stars = 3;
      } else if (accuracy >= 95 && wpm >= activeLesson.minWpm * 1.15) {
        stars = 2;
      } else {
        stars = 1;
      }
    }

    const nextStageIdx = passed
      ? (isStageFinal ? 0 : activeStageIndex + 1)
      : activeStageIndex;

    const updatedProgress: LessonProgress = {
      lessonId: activeLesson.id,
      completed: isLessonFullyCompleted || (existingProgress?.completed ?? false),
      currentStageIndex: nextStageIdx,
      completedStageIndices: newCompletedStages,
      stars: Math.max(stars, existingProgress?.stars || 0),
      bestWpm: Math.max(wpm, existingProgress?.bestWpm || 0),
      bestAccuracy: Math.max(accuracy, existingProgress?.bestAccuracy || 0),
      attempts: (existingProgress?.attempts || 0) + 1,
      lastAttemptAt: Date.now(),
    };

    saveLesson(updatedProgress);
    setExerciseResult({
      passed,
      wpm,
      accuracy,
      stars,
      isStageFinal,
      stageIndex: activeStageIndex,
    });

    if (passed) {
      if (isLessonFullyCompleted) {
        toast.success(`Lesson ${activeLesson.id} Mastered with ${stars} star${stars > 1 ? 's' : ''}!`);
      } else {
        toast.info(`Practice Stage ${activeStageIndex + 1} of ${totalStagesInLesson} completed! Ready for the next drill.`);
      }
    } else {
      toast.error(`Target: ${requiredWpm} WPM & ${requiredAccuracy}% Accuracy. Keep practicing!`);
    }
  };

  const handleNextLesson = () => {
    if (!activeLesson) return;
    const currentStage = STAGES.find((s) => s.lessonIds.includes(activeLesson.id));
    if (!currentStage) return;

    // If there is an unfinished practice stage within the active lesson, proceed to it
    if (activeStageIndex < currentPracticeStages.length - 1) {
      startLessonStage(activeStageIndex + 1);
      return;
    }

    // If this lesson is complete, find the next sequential lesson in the same stage
    const currentLessonIdx = currentStage.lessonIds.indexOf(activeLesson.id);
    if (currentLessonIdx !== -1 && currentLessonIdx < currentStage.lessonIds.length - 1) {
      const nextLessonId = currentStage.lessonIds[currentLessonIdx + 1];
      const nextLesson = LESSONS.find((l) => l.id === nextLessonId);
      if (nextLesson) {
        startLesson(nextLesson, currentStage, 0);
        return;
      }
    }

    // All lessons in this stage are completed!
    // Check if stage exam is unlocked
    const allStageLessonsDone = currentStage.lessonIds.every((id) => lessons[id]?.completed);
    if (allStageLessonsDone) {
      setActiveLesson(null);
      startExam(currentStage);
      toast.info(`All Stage ${currentStage.number} lessons complete! Ready for the Stage Exam.`);
      return;
    }

    // Return to curriculum view if unfinished lessons remain
    setActiveLesson(null);
  };

  // Start Stage Exam
  const startExam = (stage: Stage) => {
    if (!isStageUnlocked(stage.number)) {
      toast.error(`Stage ${stage.number} is locked. Pass the Stage ${stage.number - 1} exam first.`);
      return;
    }
    const isExamPassed = stageProgress[stage.number]?.examPassed;
    if (!isExamPassed && !isStageExamUnlocked(stage.number)) {
      toast.error(`Stage ${stage.number} exam is locked. Please complete all lessons in this stage first.`);
      return;
    }
    setActiveLesson(null);
    setExerciseResult(null);
    setActiveExamStage(stage);
    setExamResult(null);
    setEngineKey((k) => k + 1);
  };

  const handleExamComplete = (rawResult: { wpm: number; accuracy: number; mistakes?: Record<string, number> }) => {
    if (!activeExamStage) return;

    const { wpm, accuracy, mistakes = {} } = rawResult;
    const passed = accuracy >= activeExamStage.exam.minAccuracy && wpm >= activeExamStage.exam.minWpm;

    const resultPayload: StageExamResult = {
      stageNumber: activeExamStage.number,
      passed,
      wpm,
      accuracy,
      mistakes,
      timestamp: Date.now(),
    };

    saveStageExam(activeExamStage.number, resultPayload);
    setExamResult(resultPayload);

    if (passed) {
      if (activeExamStage.number < STAGES.length) {
        toast.success(`Stage ${activeExamStage.number} Exam Passed! Stage ${activeExamStage.number + 1} is now unlocked!`);
      } else {
        toast.success('Congratulations! You passed the final assessment and graduated from the Academy!');
      }
    } else {
      toast.error(`Exam not passed. Required: ${activeExamStage.exam.minWpm} WPM & ${activeExamStage.exam.minAccuracy}% Accuracy.`);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 animate-fadeIn pb-16">
      {/* ========================================================
          VIEW A: ACTIVE LESSON SCREEN (Focused exercise workspace)
         ======================================================== */}
      {activeLesson && !activeExamStage && (
        <div className="space-y-6">
          {/* Top Breadcrumb & Lesson Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#353630]">
            <div>
              <button
                onClick={() => setActiveLesson(null)}
                className="flex items-center gap-1.5 text-xs font-mono text-[var(--accent-color)] hover:underline mb-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Curriculum Stages</span>
              </button>

              <h1 className="text-2xl font-bold text-[#ECEBE4] flex items-center gap-2.5">
                <BookOpen className="w-6 h-6 text-[var(--accent-color)]" />
                <span>Lesson {activeLesson.id}: {activeLesson.title.replace(/^\d+\.\s*/, '')}</span>
              </h1>
              <p className="text-xs text-[#989A92] mt-0.5">
                {activeLesson.subtitle}
              </p>
            </div>

            {/* Target Criteria Badges */}
            <div className="flex items-center gap-2">
              <Badge variant="amber" size="xs">
                Goal: {currentPracticeStage?.minWpm || activeLesson.minWpm} WPM
              </Badge>
              <Badge variant="green" size="xs">
                Min: {currentPracticeStage?.minAccuracy || activeLesson.minAccuracy}% Acc
              </Badge>
            </div>
          </div>

          {/* Multi-Stage Step Progression Stepper */}
          {currentPracticeStages.length > 1 && (
            <div className="p-3 sm:p-4 rounded-xl bg-[#272824] border border-[#353630]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-[#ECEBE4] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--accent-color)]" />
                  <span>Practice Stages ({activeStageIndex + 1} of {currentPracticeStages.length})</span>
                </span>
                <span className="text-[11px] font-mono text-[#989A92]">
                  {lessons[activeLesson.id]?.completed ? 'Lesson Mastered' : `${lessons[activeLesson.id]?.completedStageIndices?.length || 0} of ${currentPracticeStages.length} completed`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentPracticeStages.map((ps, idx) => {
                  const isCompleted = lessons[activeLesson.id]?.completedStageIndices?.includes(idx);
                  const isCurrent = idx === activeStageIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => startLessonStage(idx)}
                      className={`p-2.5 rounded-lg text-left transition-all font-mono text-xs cursor-pointer border ${
                        isCurrent
                          ? 'bg-[#20211D] border-[var(--accent-color)] text-[var(--accent-color)] font-bold shadow-xs'
                          : isCompleted
                          ? 'bg-[#20211D]/60 border-[#5DBE76]/40 text-[#ECEBE4] hover:border-[#5DBE76]'
                          : 'bg-[#20211D]/30 border-[#30312B] text-[#7E8079] hover:text-[#989A92]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-[#989A92]">
                          Stage {idx + 1}
                        </span>
                        {isCompleted && <Check className="w-3.5 h-3.5 text-[#5DBE76]" />}
                      </div>
                      <div className="truncate font-medium">{ps.title}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Posture & Stage Tip Banner */}
          <div className="p-4 rounded-xl bg-[#272824] border border-[#353630] flex items-start gap-3 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-[var(--accent-color)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#ECEBE4] font-mono block mb-0.5">
                {currentPracticeStage?.title ? `${currentPracticeStage.title} Instructions:` : 'Guidance:'}
              </strong>
              <span className="text-[#989A92]">
                {currentPracticeStage?.instructions || activeLesson.instructions}
              </span>
              <span className="block mt-1 text-[#7E8079]">
                <strong className="text-[#ECEBE4]">Posture note: </strong>
                {activeLesson.postureTip}
              </span>
            </div>
          </div>

          {/* Dedicated Typing Engine or Lesson Results View */}
          <div className="bg-[#272824]/60 border border-[#353630] rounded-2xl p-6 sm:p-8">
            {exerciseResult ? (
              /* Exercise Result Screen */
              <div className="text-center py-6 space-y-6 animate-fadeIn">
                <div>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#20211D] border border-[#353630] mb-3">
                    {exerciseResult.passed ? (
                      <Award className="w-8 h-8 text-[var(--accent-color)]" />
                    ) : (
                      <RotateCcw className="w-8 h-8 text-amber-400" />
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-[#ECEBE4] font-mono">
                    {exerciseResult.passed
                      ? exerciseResult.isStageFinal || currentPracticeStages.length <= 1
                        ? 'Lesson Mastered!'
                        : `Stage ${exerciseResult.stageIndex + 1} Complete!`
                      : 'Keep Practicing'}
                  </h2>

                  {/* Stars for fully completed lesson */}
                  {exerciseResult.passed && (exerciseResult.isStageFinal || currentPracticeStages.length <= 1) && (
                    <div className="flex items-center justify-center gap-1.5 my-3">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-6 h-6 ${
                            s <= exerciseResult.stars
                              ? 'text-[var(--accent-color)] fill-[var(--accent-color)]'
                              : 'text-[#353630]'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-[#989A92] max-w-md mx-auto mt-2 leading-relaxed font-mono">
                    {exerciseResult.passed
                      ? exerciseResult.isStageFinal || currentPracticeStages.length <= 1
                        ? `Sensational! You completed all practice stages with ${exerciseResult.wpm} WPM and ${exerciseResult.accuracy}% accuracy.`
                        : `Solid precision! You achieved ${exerciseResult.wpm} WPM and ${exerciseResult.accuracy}% accuracy. Proceed to Stage ${exerciseResult.stageIndex + 2} to advance your mastery.`
                      : `You achieved ${exerciseResult.wpm} WPM and ${exerciseResult.accuracy}% accuracy. Goal: ${currentPracticeStage?.minWpm || activeLesson.minWpm} WPM and ${currentPracticeStage?.minAccuracy || activeLesson.minAccuracy}% accuracy.`}
                  </p>
                </div>

                {/* Score Stats */}
                <div className="flex justify-center gap-6 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#20211D] border border-[#353630] min-w-[110px]">
                    <span className="text-[10px] text-[#989A92] uppercase block">Speed</span>
                    <span className="text-lg font-bold text-[var(--accent-color)]">{exerciseResult.wpm} WPM</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#20211D] border border-[#353630] min-w-[110px]">
                    <span className="text-[10px] text-[#989A92] uppercase block">Accuracy</span>
                    <span className="text-lg font-bold text-[#5DBE76]">{exerciseResult.accuracy}%</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#353630]">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => startLessonStage(activeStageIndex)}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Repeat {currentPracticeStages.length > 1 ? `Stage ${activeStageIndex + 1}` : 'Lesson'}
                  </Button>

                  {exerciseResult.passed && !exerciseResult.isStageFinal && activeStageIndex < currentPracticeStages.length - 1 && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => startLessonStage(activeStageIndex + 1)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Next Practice Stage
                    </Button>
                  )}

                  {exerciseResult.passed && (exerciseResult.isStageFinal || currentPracticeStages.length <= 1) && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleNextLesson}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Next Lesson
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setActiveLesson(null)}
                  >
                    Back to Curriculum
                  </Button>
                </div>
              </div>
            ) : (
              /* Running Lesson Engine */
              <TypingEngine
                key={engineKey}
                initialText={currentPracticeStage?.exerciseText || activeLesson.exerciseText}
                mode="custom"
                onComplete={handleLessonComplete}
                onRestart={() => startLessonStage(activeStageIndex)}
              />
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW B: ACTIVE STAGE EXAM SCREEN (Assessment workspace)
         ======================================================== */}
      {activeExamStage && !activeLesson && (
        <div className="space-y-6">
          {/* Top Breadcrumb & Exam Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#353630]">
            <div>
              <button
                onClick={() => setActiveExamStage(null)}
                className="flex items-center gap-1.5 text-xs font-mono text-[var(--accent-color)] hover:underline mb-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Curriculum Stages</span>
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Badge variant="amber" size="xs">
                  Stage {activeExamStage.number} Assessment
                </Badge>
                <span className="text-xs font-mono text-[#989A92]">{activeExamStage.title}</span>
              </div>

              <h1 className="text-2xl font-bold text-[#ECEBE4] flex items-center gap-2.5">
                <Award className="w-6 h-6 text-[var(--accent-color)]" />
                <span>{activeExamStage.exam.title}</span>
              </h1>
              <p className="text-xs text-[#989A92] mt-0.5">
                {activeExamStage.exam.description}
              </p>
            </div>

            {/* Target Passing Criteria */}
            <div className="flex items-center gap-2">
              <Badge variant="amber" size="sm">
                Min: {activeExamStage.exam.minWpm} WPM
              </Badge>
              <Badge variant="green" size="sm">
                Min: {activeExamStage.exam.minAccuracy}% Accuracy
              </Badge>
            </div>
          </div>

          {/* Exam Instructions Banner */}
          <div className="p-4 rounded-xl bg-[#272824] border border-[#353630] flex items-start gap-3 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-[var(--accent-color)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#ECEBE4] font-mono block mb-0.5">Exam Target: {activeExamStage.exam.targetDescription}</strong>
              <span className="text-[#989A92]">
                Both speed and accuracy goals must be met to pass this exam and unlock Stage {activeExamStage.number + 1}. Take your time, maintain correct finger placement, and avoid rushing.
              </span>
            </div>
          </div>

          {/* Typing Engine or Exam Results */}
          <div className="bg-[#272824]/60 border border-[#353630] rounded-2xl p-6 sm:p-8">
            {examResult ? (
              /* Exam Result Screen */
              <div className="text-center py-6 space-y-6 animate-fadeIn">
                <div>
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl border mb-3 shadow-lg ${
                      examResult.passed
                        ? 'bg-[#5DBE76]/15 border-[#5DBE76]/40 text-[#5DBE76]'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    }`}
                  >
                    {examResult.passed ? (
                      <Trophy className="w-10 h-10" />
                    ) : (
                      <AlertTriangle className="w-10 h-10" />
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4] font-mono">
                    {examResult.passed ? `Stage ${activeExamStage.number} Exam Passed!` : 'Stage Exam Not Passed Yet'}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#989A92] max-w-lg mx-auto mt-2 leading-relaxed font-mono">
                    {examResult.passed
                      ? `Sensational typing! You conquered the Stage ${activeExamStage.number} exam with ${examResult.wpm} WPM and ${examResult.accuracy}% accuracy.`
                      : `You achieved ${examResult.wpm} WPM and ${examResult.accuracy}% accuracy. To pass, you need at least ${activeExamStage.exam.minWpm} WPM and ${activeExamStage.exam.minAccuracy}% accuracy.`}
                  </p>
                </div>

                {/* Score Stats Comparison */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 font-mono text-xs">
                  <div
                    className={`p-4 rounded-xl border min-w-[130px] ${
                      examResult.wpm >= activeExamStage.exam.minWpm
                        ? 'bg-[#5DBE76]/10 border-[#5DBE76]/30 text-[#5DBE76]'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase block mb-1 text-[#989A92]">Speed Achieved</span>
                    <span className="text-2xl font-bold">{examResult.wpm} WPM</span>
                    <span className="text-[11px] block mt-0.5 text-[#7E8079]">
                      Goal: {activeExamStage.exam.minWpm}+ WPM
                    </span>
                  </div>

                  <div
                    className={`p-4 rounded-xl border min-w-[130px] ${
                      examResult.accuracy >= activeExamStage.exam.minAccuracy
                        ? 'bg-[#5DBE76]/10 border-[#5DBE76]/30 text-[#5DBE76]'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase block mb-1 text-[#989A92]">Accuracy Achieved</span>
                    <span className="text-2xl font-bold">{examResult.accuracy}%</span>
                    <span className="text-[11px] block mt-0.5 text-[#7E8079]">
                      Goal: {activeExamStage.exam.minAccuracy}%+
                    </span>
                  </div>
                </div>

                {/* Unlock Notification or Guidance */}
                {examResult.passed ? (
                  activeExamStage.number < STAGES.length ? (
                    <div className="p-4 rounded-xl bg-[#5DBE76]/10 border border-[#5DBE76]/30 max-w-md mx-auto text-center">
                      <span className="text-xs font-mono font-bold text-[#5DBE76] flex items-center justify-center gap-1.5 mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span>Stage {activeExamStage.number + 1}: {STAGES[activeExamStage.number].title} Unlocked!</span>
                      </span>
                      <p className="text-[11px] text-[#989A92]">
                        You can now proceed to the next stage lessons and continue your progression.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-color)]/30 max-w-md mx-auto text-center">
                      <span className="text-xs font-mono font-bold text-[var(--accent-color)] flex items-center justify-center gap-1.5 mb-1">
                        <Trophy className="w-4 h-4" />
                        <span>Academy Graduation Complete!</span>
                      </span>
                      <p className="text-[11px] text-[#989A92]">
                        You have conquered all 10 curriculum stages and earned the touch typing master ranking!
                      </p>
                    </div>
                  )
                ) : (
                  <div className="p-4 rounded-xl bg-[#20211D] border border-amber-500/30 max-w-md mx-auto text-center">
                    <span className="text-xs font-mono font-bold text-amber-300 flex items-center justify-center gap-1.5 mb-1">
                      <Lock className="w-4 h-4" />
                      <span>Stage {activeExamStage.number + 1} Remains Locked</span>
                    </span>
                    <p className="text-[11px] text-[#989A92]">
                      Pass this stage exam to unlock the next stage. Review the lessons or retry immediately!
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#353630]">
                  <Button
                    variant={examResult.passed ? 'secondary' : 'primary'}
                    size="md"
                    onClick={() => startExam(activeExamStage)}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    {examResult.passed ? 'Retake Exam' : 'Retry Stage Exam'}
                  </Button>

                  {/* Proceed to NEXT STAGE LESSON (NOT next stage exam!) */}
                  {examResult.passed && activeExamStage.number < STAGES.length && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        const nextStage = STAGES[activeExamStage.number];
                        const firstLessonOfNextStage = LESSONS.find((l) => l.id === nextStage.lessonIds[0]);
                        if (firstLessonOfNextStage) {
                          startLesson(firstLessonOfNextStage, nextStage, 0);
                        } else {
                          setActiveExamStage(null);
                        }
                      }}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Proceed to Stage {activeExamStage.number + 1}: Lesson {STAGES[activeExamStage.number].lessonIds[0]}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setActiveExamStage(null)}
                  >
                    Back to Curriculum Stages
                  </Button>
                </div>
              </div>
            ) : (
              /* Running Stage Exam Engine */
              <TypingEngine
                key={engineKey}
                initialText={activeExamStage.exam.examText}
                mode="custom"
                timeLimit={activeExamStage.exam.timeLimit}
                onComplete={handleExamComplete}
                onRestart={() => startExam(activeExamStage)}
              />
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW C: 10-STAGE PROGRESSIVE CURRICULUM OVERVIEW
         ======================================================== */}
      {!activeLesson && !activeExamStage && (
        <div>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4] flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-[var(--accent-color)]" />
              <span>Touch Typing Academy</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#989A92] mt-1 max-w-2xl leading-relaxed">
              A 10-stage sequential curriculum with stage-ending exams. Complete every practice stage and pass each stage exam to unlock future stages and earn complete mastery.
            </p>
          </div>

          {/* Continue Learning Fast-Action Card */}
          <div className="p-5 rounded-2xl bg-[#272824] border border-[#353630] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-color)] font-bold block mb-1">
                Your Next Objective
              </span>
              {continueAction.type === 'lesson' && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#ECEBE4] font-mono">
                    Stage {continueAction.stage.number}: Lesson {continueAction.lesson?.id} — {continueAction.lesson?.title.replace(/^\d+\.\s*/, '')}
                  </h3>
                  <p className="text-xs text-[#989A92] mt-0.5">
                    {continueAction.lesson?.subtitle}
                  </p>
                </div>
              )}
              {continueAction.type === 'exam' && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#ECEBE4] font-mono flex items-center gap-2">
                    <Award className="w-5 h-5 text-[var(--accent-color)]" />
                    <span>Stage {continueAction.stage.number} Final Exam: {continueAction.stage.title}</span>
                  </h3>
                  <p className="text-xs text-amber-300 mt-0.5 font-mono">
                    All stage lessons completed! Pass this exam to unlock Stage {continueAction.stage.number + 1}.
                  </p>
                </div>
              )}
              {continueAction.type === 'finished' && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#5DBE76] font-mono flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    <span>Academy Graduation Completed!</span>
                  </h3>
                  <p className="text-xs text-[#989A92] mt-0.5">
                    All 10 stages and exams mastered. Review any stage or test yourself anytime.
                  </p>
                </div>
              )}
            </div>

            <div>
              {continueAction.type === 'lesson' && continueAction.lesson && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => startLesson(continueAction.lesson!, continueAction.stage)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue Learning
                </Button>
              )}
              {continueAction.type === 'exam' && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => startExam(continueAction.stage)}
                  leftIcon={<Award className="w-4 h-4" />}
                >
                  Take Stage {continueAction.stage.number} Exam
                </Button>
              )}
              {continueAction.type === 'finished' && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => startExam(STAGES[STAGES.length - 1])}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Retake Final Assessment
                </Button>
              )}
            </div>
          </div>

          {/* Curriculum Progress Stats Card */}
          <div className="p-5 rounded-2xl bg-[#272824] border border-[#353630] mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-mono text-[#989A92] uppercase font-semibold block">
                  Curriculum Milestones
                </span>
                <div className="text-xl font-bold font-mono text-[#ECEBE4] mt-0.5">
                  {completedStagesCount} of {STAGES.length} Stages Completed ({completedLessonsCount} / {totalLessons} Lessons &bull; {progressPercent}%)
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="flex items-center gap-1 text-[var(--accent-color)]">
                  <Star className="w-4 h-4 fill-[var(--accent-color)]" />
                  <span>{totalStars} Stars</span>
                </span>
                <span className="text-[#353630]">&bull;</span>
                <span className="text-[#5DBE76] font-semibold">
                  {Math.round((completedStagesCount / STAGES.length) * 100)}% Academy Progress
                </span>
              </div>
            </div>

            <div className="w-full h-2.5 rounded-full bg-[#20211D] border border-[#353630] overflow-hidden">
              <div
                className="h-full bg-[var(--accent-color)] rounded-full transition-all duration-500"
                style={{ width: `${Math.round((completedStagesCount / STAGES.length) * 100)}%` }}
              />
            </div>
          </div>

          {/* The 10 Progressive Stages */}
          <div className="space-y-6">
            {STAGES.map((stage) => {
              const stageLessons = LESSONS.filter((l) => stage.lessonIds.includes(l.id));
              const stageCompletedLessons = stageLessons.filter((l) => lessons[l.id]?.completed).length;
              const allLessonsDone = stageCompletedLessons === stageLessons.length;

              const isUnlocked = isStageUnlocked(stage.number);
              const isExamUnlocked = isStageExamUnlocked(stage.number);
              const progress = stageProgress[stage.number];
              const isExamPassed = progress?.examPassed;
              const isExamFailed = progress?.status === 'exam_failed';

              return (
                <div
                  key={stage.number}
                  className={`p-6 rounded-2xl border transition-all duration-200 ${
                    !isUnlocked
                      ? 'bg-[#20211D]/60 border-[#30312B] opacity-65'
                      : isExamPassed
                      ? 'bg-[#272824] border-[#5DBE76]/35 shadow-sm'
                      : isExamFailed
                      ? 'bg-[#272824] border-amber-500/40 shadow-sm'
                      : 'bg-[#272824] border-[#353630] shadow-sm'
                  }`}
                >
                  {/* Stage Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#353630] mb-5">
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                          !isUnlocked
                            ? 'bg-[#20211D] text-[#7E8079] border border-[#353630]'
                            : isExamPassed
                            ? 'bg-[#5DBE76]/15 text-[#5DBE76] border border-[#5DBE76]/40'
                            : isExamFailed
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                            : 'bg-[#20211D] text-[var(--accent-color)] border border-[#353630]'
                        }`}
                      >
                        {!isUnlocked ? (
                          <Lock className="w-4 h-4" />
                        ) : isExamPassed ? (
                          <Check className="w-5 h-5 stroke-[3]" />
                        ) : (
                          `0${stage.number}`
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h2 className="text-base sm:text-lg font-bold text-[#ECEBE4]">
                            Stage {stage.number}: {stage.title}
                          </h2>

                          {/* Stage Status Badges */}
                          {!isUnlocked && (
                            <Badge variant="gray" size="xs">
                              <Lock className="w-3 h-3 mr-1" /> Locked
                            </Badge>
                          )}
                          {isUnlocked && isExamPassed && (
                            <Badge variant="green" size="xs">
                              <CheckCircle className="w-3 h-3 mr-1" /> Completed
                            </Badge>
                          )}
                          {isUnlocked && isExamFailed && (
                            <Badge variant="amber" size="xs">
                              <AlertTriangle className="w-3 h-3 mr-1" /> Exam Failed
                            </Badge>
                          )}
                          {isUnlocked && !isExamPassed && !isExamFailed && (
                            <Badge variant={allLessonsDone ? 'green' : 'amber'} size="xs">
                              {allLessonsDone ? 'Ready for Exam' : 'In Progress'}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-[#989A92]">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Info */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs font-mono">
                      <span className="text-[#ECEBE4] font-semibold">
                        {stageCompletedLessons} / {stageLessons.length} lessons done
                      </span>
                      <span className="text-[11px] text-[#7E8079]">
                        {isExamPassed
                          ? `Passed (${progress?.bestWpm} WPM • ${progress?.bestAccuracy}%)`
                          : isExamFailed
                          ? `Exam Needs Retry`
                          : isUnlocked
                          ? allLessonsDone
                            ? 'Exam Unlocked'
                            : 'Exam Locked'
                          : 'Stage Locked'}
                      </span>
                    </div>
                  </div>

                  {/* Locked Stage Warning Banner */}
                  {!isUnlocked && (
                    <div className="mb-5 p-3 rounded-xl bg-[#20211D] border border-[#353630] flex items-center gap-2.5 text-xs text-[#989A92] font-mono">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Pass the Stage {stage.number - 1} exam to unlock this stage and its lessons.
                      </span>
                    </div>
                  )}

                  {/* Stage Lessons Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
                    {stageLessons.map((lesson) => {
                      const prog = lessons[lesson.id];
                      const isCompleted = prog?.completed;
                      const stars = prog?.stars || 0;
                      const completedStagesCountInLesson = prog?.completedStageIndices?.length || 0;
                      const totalPracticeStagesCount = lesson.practiceStages?.length || 1;
                      const isPartiallyDone = !isCompleted && completedStagesCountInLesson > 0;

                      return (
                        <div
                          key={lesson.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                            !isUnlocked
                              ? 'bg-[#20211D]/40 border-[#30312B] cursor-not-allowed opacity-60'
                              : 'bg-[#20211D] border-[#353630] hover:border-[var(--accent-color)]/60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono uppercase text-[#7E8079]">
                                Lesson {lesson.id}
                              </span>

                              {!isUnlocked ? (
                                <Lock className="w-3 h-3 text-[#7E8079]" />
                              ) : isCompleted ? (
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3 h-3 ${
                                        s <= stars
                                          ? 'text-[var(--accent-color)] fill-[var(--accent-color)]'
                                          : 'text-[#353630]'
                                      }`}
                                    />
                                  ))}
                                </div>
                              ) : isPartiallyDone ? (
                                <Badge variant="amber" size="xs">
                                  Step {completedStagesCountInLesson + 1}/{totalPracticeStagesCount}
                                </Badge>
                              ) : (
                                <Badge variant="gray" size="xs">
                                  Ready
                                </Badge>
                              )}
                            </div>

                            <h3 className="text-sm font-bold text-[#ECEBE4] mb-1">
                              {lesson.title.replace(/^\d+\.\s*/, '')}
                            </h3>

                            <p className="text-xs text-[#989A92] leading-relaxed mb-3">
                              {lesson.subtitle}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#353630]/60 flex items-center justify-between">
                            <span className="text-[11px] font-mono text-[#7E8079]">
                              {isCompleted && prog?.bestWpm ? `${prog.bestWpm} WPM` : `${lesson.minWpm}+ WPM target`}
                            </span>

                            <Button
                              variant={!isUnlocked ? 'ghost' : isCompleted ? 'secondary' : 'primary'}
                              size="xs"
                              disabled={!isUnlocked}
                              onClick={() => isUnlocked && startLesson(lesson, stage)}
                              rightIcon={!isUnlocked ? <Lock className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                            >
                              {!isUnlocked ? 'Locked' : isCompleted ? 'Repeat' : isPartiallyDone ? 'Continue' : 'Start'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stage Final Assessment Banner & Take Exam Action */}
                  <div
                    className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      !isUnlocked
                        ? 'bg-[#20211D]/30 border-[#30312B] opacity-60'
                        : isExamPassed
                        ? 'bg-[#5DBE76]/10 border-[#5DBE76]/30'
                        : isExamFailed
                        ? 'bg-amber-500/10 border-amber-500/35'
                        : !isExamUnlocked
                        ? 'bg-[#20211D]/50 border-[#353630]'
                        : 'bg-[#20211D] border-[#353630]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Award
                          className={`w-4 h-4 ${
                            isExamPassed
                              ? 'text-[#5DBE76]'
                              : isExamFailed
                              ? 'text-amber-400'
                              : isExamUnlocked
                              ? 'text-[var(--accent-color)]'
                              : 'text-[#7E8079]'
                          }`}
                        />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ECEBE4]">
                          {stage.exam.title}
                        </span>
                      </div>

                      <p className="text-xs text-[#989A92] max-w-xl">
                        {stage.exam.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-[#7E8079]">
                        <span>Passing Rule: {stage.exam.minWpm}+ WPM &bull; {stage.exam.minAccuracy}% Accuracy</span>
                        {isExamPassed && progress?.bestWpm && (
                          <span className="text-[#5DBE76] font-semibold">
                            Best: {progress.bestWpm} WPM ({progress.bestAccuracy}%)
                          </span>
                        )}
                        {isExamFailed && progress?.lastExamResult && (
                          <span className="text-amber-300">
                            Last attempt: {progress.lastExamResult.wpm} WPM ({progress.lastExamResult.accuracy}%)
                          </span>
                        )}
                        {!isExamPassed && isUnlocked && !isExamUnlocked && (
                          <span className="text-amber-400/90 font-medium">
                            Complete all {stageLessons.length} stage lessons to unlock ({stageCompletedLessons}/{stageLessons.length} done)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Button
                        variant={
                          !isUnlocked || (!isExamUnlocked && !isExamPassed)
                            ? 'ghost'
                            : isExamPassed
                            ? 'secondary'
                            : 'primary'
                        }
                        size="sm"
                        disabled={!isUnlocked || (!isExamUnlocked && !isExamPassed)}
                        onClick={() => isUnlocked && (isExamUnlocked || isExamPassed) && startExam(stage)}
                        leftIcon={
                          !isUnlocked || (!isExamUnlocked && !isExamPassed) ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : isExamFailed ? (
                            <RotateCcw className="w-3.5 h-3.5" />
                          ) : (
                            <Award className="w-3.5 h-3.5" />
                          )
                        }
                      >
                        {!isUnlocked
                          ? 'Stage Locked'
                          : !isExamUnlocked && !isExamPassed
                          ? `Exam Locked (${stageCompletedLessons}/${stageLessons.length})`
                          : isExamPassed
                          ? 'Retake Stage Exam'
                          : isExamFailed
                          ? 'Retry Stage Exam'
                          : 'Take Stage Exam'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
