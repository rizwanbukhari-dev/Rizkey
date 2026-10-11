import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  TestMode,
  TimeLimit,
  WordLimit,
  TestResult,
  TimelinePoint,
  CharStats,
} from '../../types/typing';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { calculateWpm, calculateRawWpm, calculateAccuracy } from '../../utils/metrics';
import { soundEngine } from '../../utils/sound';
import { VirtualKeyboard } from '../keyboard/VirtualKeyboard';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import {
  RotateCcw,
  Pause,
  Play,
  MousePointerClick,
  Lock,
  Clock,
  AlignLeft,
} from 'lucide-react';

interface TypingEngineProps {
  initialText: string;
  mode: TestMode;
  timeLimit?: TimeLimit | number;
  wordLimit?: WordLimit | number;
  onComplete: (result: Omit<TestResult, 'isPersonalBest'>) => void;
  onRestart: () => void;
}

export const TypingEngine: React.FC<TypingEngineProps> = ({
  initialText,
  mode,
  timeLimit = 30,
  wordLimit = 25,
  onComplete,
  onRestart,
}) => {
  const { settings } = useSettings();
  const { toast } = useToast();

  // Words breakdown
  const targetWords = useMemo(() => {
    return initialText.trim().split(/\s+/).filter(Boolean);
  }, [initialText]);

  // Main interactive state
  const [wordIndex, setWordIndex] = useState(0);
  const [typedHistory, setTypedHistory] = useState<string[]>([]);
  const [currentTyped, setCurrentTyped] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [lastKeystrokeError, setLastKeystrokeError] = useState(false);

  // Live real-time stats state
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveRawWpm, setLiveRawWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [displayTime, setDisplayTime] = useState<number>(timeLimit);

  // Timing references
  const startTimeRef = useRef<number | null>(null);
  const totalPausedDurationRef = useRef(0);
  const pauseStartTimeRef = useRef<number | null>(null);

  // Keystroke counters via refs for zero render lag
  const totalKeystrokesRef = useRef(0);
  const correctKeystrokesRef = useRef(0);
  const errorKeystrokesRef = useRef(0);
  const mistakesRef = useRef<Record<string, number>>({});
  const timelineRef = useRef<TimelinePoint[]>([]);
  const lastTimelineSecondRef = useRef(0);

  // DOM elements
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tickerRef = useRef<number | null>(null);

  // Helper: compute current net correct characters
  const getNetCorrectChars = useCallback(
    (history: string[], currentVal: string, curWordIdx: number): number => {
      let correct = 0;

      // Completed words
      for (let i = 0; i < history.length; i++) {
        const typed = history[i] || '';
        const target = targetWords[i] || '';

        if (typed === target) {
          // Entire word matched + trailing space
          correct += target.length + 1;
        } else {
          // Count exact character matches in imperfect word
          for (let c = 0; c < Math.min(typed.length, target.length); c++) {
            if (typed[c] === target[c]) {
              correct++;
            }
          }
        }
      }

      // Currently typing word
      const currentTarget = targetWords[curWordIdx] || '';
      for (let c = 0; c < currentVal.length; c++) {
        if (c < currentTarget.length && currentVal[c] === currentTarget[c]) {
          correct++;
        }
      }

      return correct;
    },
    [targetWords]
  );

  // Reset all state when test text or mode changes
  useEffect(() => {
    setWordIndex(0);
    setTypedHistory([]);
    setCurrentTyped('');
    setIsStarted(false);
    setIsPaused(false);
    setIsFinished(false);
    setIsFocused(true);
    setCapsLockActive(false);
    setLastKeystrokeError(false);

    setLiveWpm(0);
    setLiveRawWpm(0);
    setLiveAccuracy(100);
    setDisplayTime(timeLimit);

    startTimeRef.current = null;
    totalPausedDurationRef.current = 0;
    pauseStartTimeRef.current = null;
    totalKeystrokesRef.current = 0;
    correctKeystrokesRef.current = 0;
    errorKeystrokesRef.current = 0;
    mistakesRef.current = {};
    timelineRef.current = [];
    lastTimelineSecondRef.current = 0;

    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }

    inputRef.current?.focus();
  }, [initialText, timeLimit, wordLimit, mode]);

  // Finish test callback
  const finishTest = useCallback(
    (finalElapsedSeconds: number) => {
      if (isFinished) return;
      setIsFinished(true);
      setIsPaused(false);

      if (tickerRef.current) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }

      soundEngine.playCompletionChime(settings.soundVolume);

      const netCorrect = getNetCorrectChars(typedHistory, currentTyped, wordIndex);
      const totalKeys = Math.max(1, totalKeystrokesRef.current);
      const correctKeys = correctKeystrokesRef.current;
      const errorKeys = errorKeystrokesRef.current;

      const duration = Math.max(0.5, finalElapsedSeconds);
      const finalWpm = calculateWpm(netCorrect, duration);
      const finalRawWpm = calculateRawWpm(totalKeys, duration);
      const finalAccuracy = calculateAccuracy(correctKeys, totalKeys);

      const charStats: CharStats = {
        correct: netCorrect,
        incorrect: errorKeys,
        extra: Math.max(0, totalKeys - netCorrect - errorKeys),
        missed: 0,
        total: totalKeys,
      };

      toast.success(`Test Complete: ${finalWpm} WPM · ${finalAccuracy}% ACC`);

      const resultPayload = {
        id: `test_${Date.now()}`,
        timestamp: Date.now(),
        mode,
        difficulty: settings.difficulty,
        timeLimit: mode === 'time' ? timeLimit : undefined,
        wordLimit: mode === 'words' ? wordLimit : undefined,
        durationSeconds: Math.round(duration * 10) / 10,
        wpm: finalWpm,
        rawWpm: finalRawWpm,
        accuracy: finalAccuracy,
        charStats,
        timeline: timelineRef.current,
        mistakes: mistakesRef.current,
      };

      setTimeout(() => {
        onComplete(resultPayload);
      }, 0);
    },
    [
      isFinished,
      settings.soundVolume,
      settings.difficulty,
      getNetCorrectChars,
      typedHistory,
      currentTyped,
      wordIndex,
      onComplete,
      mode,
      timeLimit,
      wordLimit,
      toast,
    ]
  );

  // Pause / Resume handler
  const togglePause = useCallback(() => {
    if (!isStarted || isFinished) return;

    if (!isPaused) {
      // Entering pause
      setIsPaused(true);
      pauseStartTimeRef.current = performance.now();
    } else {
      // Resuming
      if (pauseStartTimeRef.current) {
        totalPausedDurationRef.current += performance.now() - pauseStartTimeRef.current;
        pauseStartTimeRef.current = null;
      }
      setIsPaused(false);
      inputRef.current?.focus();
    }
  }, [isStarted, isFinished, isPaused]);

  // Smooth real-time statistics ticker (runs every 100ms when started & active)
  useEffect(() => {
    if (!isStarted || isFinished || isPaused) return;

    tickerRef.current = window.setInterval(() => {
      if (!startTimeRef.current) return;

      const now = performance.now();
      const grossElapsedMs = now - startTimeRef.current - totalPausedDurationRef.current;
      const elapsedSeconds = grossElapsedMs / 1000;
      if (elapsedSeconds <= 0) return;

      const netCorrect = getNetCorrectChars(typedHistory, currentTyped, wordIndex);
      const totalKeys = totalKeystrokesRef.current;
      const correctKeys = correctKeystrokesRef.current;

      const wpm = calculateWpm(netCorrect, elapsedSeconds);
      const rawWpm = calculateRawWpm(totalKeys, elapsedSeconds);
      const acc = calculateAccuracy(correctKeys, totalKeys);

      setLiveWpm(wpm);
      setLiveRawWpm(rawWpm);
      setLiveAccuracy(acc);

      // Record timeline point each full second
      const currentFullSecond = Math.floor(elapsedSeconds);
      if (currentFullSecond > lastTimelineSecondRef.current) {
        lastTimelineSecondRef.current = currentFullSecond;
        timelineRef.current.push({
          second: currentFullSecond,
          wpm,
          rawWpm,
          errors: errorKeystrokesRef.current,
        });
      }

      // Time mode expiration
      if (mode === 'time') {
        const remaining = Math.max(0, Math.ceil(timeLimit - elapsedSeconds));
        setDisplayTime(remaining);

        if (elapsedSeconds >= timeLimit) {
          finishTest(timeLimit);
        }
      }
    }, 100);

    return () => {
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
      }
    };
  }, [
    isStarted,
    isFinished,
    isPaused,
    mode,
    timeLimit,
    getNetCorrectChars,
    typedHistory,
    currentTyped,
    wordIndex,
    finishTest,
  ]);

  // Start timer on first meaningful keystroke
  const startTestIfNeeded = () => {
    if (!isStarted && !isFinished) {
      startTimeRef.current = performance.now();
      setIsStarted(true);
    }
  };

  // Check if word-count/quote test completed
  const checkWordsCompletion = (newHistory: string[]) => {
    const totalDoneWords = newHistory.length;
    const isWordsModeDone = mode === 'words' && totalDoneWords >= wordLimit;
    const isTextEndDone = mode !== 'time' && totalDoneWords >= targetWords.length;

    if (isWordsModeDone || isTextEndDone) {
      const now = performance.now();
      const grossElapsedMs = startTimeRef.current
        ? now - startTimeRef.current - totalPausedDurationRef.current
        : 1000;
      finishTest(grossElapsedMs / 1000);
    }
  };

  // Keystroke handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Check Caps Lock state
    setCapsLockActive(e.getModifierState('CapsLock'));

    // Handle Quick Restart shortcut
    if (e.key === 'Tab') {
      e.preventDefault();
      onRestart();
      return;
    }

    // Handle Pause via Escape if test active
    if (e.key === 'Escape') {
      e.preventDefault();
      if (isStarted && !isFinished) {
        togglePause();
      }
      return;
    }

    // If currently paused, pressing Space resumes
    if (isPaused) {
      if (e.key === ' ') {
        e.preventDefault();
        togglePause();
      }
      return;
    }

    if (isFinished) return;

    const currentTargetWord = targetWords[wordIndex] || '';

    // Handle Ctrl + Backspace or Alt + Backspace: delete entire current word
    if (e.key === 'Backspace' && (e.ctrlKey || e.altKey)) {
      e.preventDefault();
      setCurrentTyped('');
      setLastKeystrokeError(false);
      return;
    }

    // Handle regular Backspace
    if (e.key === 'Backspace') {
      if (currentTyped.length > 0) {
        setCurrentTyped((prev) => prev.slice(0, -1));
        setLastKeystrokeError(false);
      } else if (wordIndex > 0) {
        // Jump back to previous word if it had mistakes
        const prevTyped = typedHistory[wordIndex - 1];
        const prevTarget = targetWords[wordIndex - 1];
        if (prevTyped !== prevTarget) {
          setWordIndex((prev) => prev - 1);
          setCurrentTyped(prevTyped);
          setTypedHistory((prev) => prev.slice(0, -1));
        }
      }
      return;
    }

    // Handle Space: submit active word and advance
    if (e.key === ' ') {
      e.preventDefault();
      if (currentTyped.length === 0) return; // Prevent multiple empty spaces

      startTestIfNeeded();

      totalKeystrokesRef.current++;
      const isWordFullyCorrect = currentTyped === currentTargetWord;
      if (isWordFullyCorrect) {
        correctKeystrokesRef.current++;
        soundEngine.playKey(settings.soundTheme, settings.soundVolume);
      } else {
        errorKeystrokesRef.current++;
        if (settings.playErrorSound) {
          soundEngine.playError(settings.soundVolume);
        } else {
          soundEngine.playKey(settings.soundTheme, settings.soundVolume);
        }
      }

      const nextHistory = [...typedHistory, currentTyped];
      setTypedHistory(nextHistory);
      setCurrentTyped('');
      setWordIndex((prev) => prev + 1);
      setLastKeystrokeError(false);

      checkWordsCompletion(nextHistory);
      return;
    }

    // Handle single printable characters
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      startTestIfNeeded();

      totalKeystrokesRef.current++;
      const expectedChar = currentTargetWord[currentTyped.length];
      const isCorrect = expectedChar === e.key;

      if (isCorrect) {
        correctKeystrokesRef.current++;
        soundEngine.playKey(settings.soundTheme, settings.soundVolume);
        setLastKeystrokeError(false);
      } else {
        errorKeystrokesRef.current++;
        if (settings.playErrorSound) {
          soundEngine.playError(settings.soundVolume);
        } else {
          soundEngine.playKey(settings.soundTheme, settings.soundVolume);
        }
        setLastKeystrokeError(true);

        if (expectedChar) {
          mistakesRef.current[expectedChar] = (mistakesRef.current[expectedChar] || 0) + 1;
        }
      }

      const nextTyped = currentTyped + e.key;
      setCurrentTyped(nextTyped);

      // Check if last word finished
      const isLastWord =
        wordIndex === targetWords.length - 1 ||
        (mode === 'words' && wordIndex === wordLimit - 1);

      if (isLastWord && nextTyped === currentTargetWord) {
        const nextHistory = [...typedHistory, nextTyped];
        setTypedHistory(nextHistory);
        setCurrentTyped('');
        checkWordsCompletion(nextHistory);
      }
    }
  };

  // Next expected character for virtual keyboard guidance
  const currentExpectedChar = useMemo(() => {
    const curTargetWord = targetWords[wordIndex] || '';
    if (currentTyped.length < curTargetWord.length) {
      return curTargetWord[currentTyped.length];
    }
    return ' ';
  }, [targetWords, wordIndex, currentTyped]);

  // Responsive font scaling (Requirement 1: 28–36px on desktop, responsive on mobile)
  const baseFontSize = settings.fontSize || 32;
  const desktopFontSize = Math.min(38, Math.max(26, baseFontSize)); // e.g. 32px
  const tabletFontSize = Math.max(22, Math.round(desktopFontSize * 0.84)); // e.g. 27px
  const mobileFontSize = Math.max(18, Math.round(desktopFontSize * 0.70)); // e.g. 22px

  const maxWidthClass =
    settings.textWidth === 'narrow'
      ? 'max-w-2xl'
      : settings.textWidth === 'medium'
      ? 'max-w-3xl'
      : settings.textWidth === 'full'
      ? 'max-w-6xl'
      : 'max-w-5xl';

  // Smooth line scrolling: keeps active line centered in reading sweet spot
  useEffect(() => {
    const activeEl = wordRefs.current[wordIndex];
    if (activeEl && containerRef.current) {
      const container = containerRef.current;
      const wordOffsetTop = activeEl.offsetTop - container.offsetTop;
      const targetScroll = wordOffsetTop - 56;
      if (targetScroll > 10) {
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      } else if (wordIndex === 0) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [wordIndex]);

  // Global window listener: focus hidden input when clicking anywhere or striking any key
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      setCapsLockActive(e.getModifierState('CapsLock'));
      if (document.activeElement !== inputRef.current && e.key !== 'Tab' && e.key !== 'Escape') {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div
      className={`w-full ${maxWidthClass} mx-auto flex flex-col items-center select-none relative`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Invisible auto-focused input field */}
      <input
        ref={inputRef}
        type="text"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="opacity-0 fixed -top-96 left-0 pointer-events-none"
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label="Typing test input field"
      />

      {/* Live Statistics & Controls Header (HUD) */}
      <div className="w-full flex items-center justify-between py-3 px-4 sm:px-6 mb-5 text-xs font-mono text-[#989A92] border-b border-[#353630]/70">
        <div className="flex items-center gap-6 sm:gap-8">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#E6C76B] font-mono tracking-tight">
              {isStarted ? liveWpm : 0}
            </span>
            <span className="text-xs text-[#7E8079] font-semibold tracking-wider uppercase">WPM</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#5DBE76] font-mono tracking-tight">
              {liveAccuracy}%
            </span>
            <span className="text-xs text-[#7E8079] font-semibold tracking-wider uppercase">ACC</span>
          </div>
          {isStarted && (
            <div className="hidden sm:flex items-baseline gap-1.5 text-[#7E8079]">
              <span className="text-sm font-semibold text-[#ECEBE4] font-mono">{liveRawWpm}</span>
              <span className="text-[11px] uppercase tracking-wider">RAW</span>
            </div>
          )}
        </div>

        {/* Center: Caps Lock warning indicator */}
        {capsLockActive && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-mono animate-pulse shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-semibold">Caps Lock ON</span>
          </div>
        )}

        {/* Right: Timer / Word progress & Action buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {mode === 'time' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#20211D]/80 border border-[#353630]/70 font-mono text-[#ECEBE4] shadow-xs">
              <Clock className="w-3.5 h-3.5 text-[#E6C76B]" />
              <span className="text-lg sm:text-xl font-bold">{displayTime}</span>
              <span className="text-xs text-[#7E8079]">s</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#20211D]/80 border border-[#353630]/70 font-mono text-sm text-[#ECEBE4] shadow-xs">
              <AlignLeft className="w-3.5 h-3.5 text-[#E6C76B]" />
              <span className="font-bold">{wordIndex}</span>
              <span className="text-[#7E8079]">/</span>
              <span>{mode === 'words' ? wordLimit : targetWords.length}</span>
            </div>
          )}

          {/* Pause / Resume Button */}
          {isStarted && !isFinished && (
            <Tooltip content={isPaused ? "Resume (Space)" : "Pause (Esc)"}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePause();
                }}
                className="p-2 rounded-xl bg-[#272824] hover:bg-[#32332B] text-[#989A92] hover:text-[#ECEBE4] border border-[#353630] transition-colors shadow-xs"
                aria-label={isPaused ? "Resume test" : "Pause test"}
              >
                {isPaused ? <Play className="w-4 h-4 fill-current text-[#5DBE76]" /> : <Pause className="w-4 h-4" />}
              </button>
            </Tooltip>
          )}

          {/* Restart Button */}
          <Tooltip content="Restart test (Tab)">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestart();
              }}
              className="p-2 rounded-xl bg-[#272824] hover:bg-[#32332B] text-[#989A92] hover:text-[#ECEBE4] border border-[#353630] transition-colors shadow-xs"
              aria-label="Restart test"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Distraction-Free Text Card */}
      <div className="w-full relative rounded-2xl sm:rounded-3xl bg-[#272824]/40 dark:bg-[#1C2420]/60 border border-[#353630]/70 shadow-xl backdrop-blur-xs transition-all duration-200">
        <div
          ref={containerRef}
          className={`typing-text-surface w-full min-h-[200px] sm:min-h-[230px] md:min-h-[260px] max-h-[300px] sm:max-h-[340px] md:max-h-[390px] overflow-y-auto overflow-x-hidden no-scrollbar py-6 sm:py-8 md:py-10 px-5 sm:px-8 md:px-10 cursor-text font-mono tracking-wide rounded-2xl sm:rounded-3xl relative transition-all duration-200 ${
            !isFocused || isPaused ? 'opacity-30 blur-[1.5px]' : 'opacity-100'
          }`}
          style={{
            fontFamily: settings.fontFamily,
            lineHeight: 1.45,
            ['--typing-font-desktop' as string]: `${desktopFontSize}px`,
            ['--typing-font-tablet' as string]: `${tabletFontSize}px`,
            ['--typing-font-mobile' as string]: `${mobileFontSize}px`,
          }}
        >
          {/* Word Flex Container with Generous 16–24px Word Spacing & Compact Natural 1.45 Line Height */}
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 lg:gap-x-6 gap-y-1.5 sm:gap-y-2">
            {targetWords.map((word, wIdx) => {
              const isCurrent = wIdx === wordIndex;
              const isPast = wIdx < wordIndex;
              const pastTyped = typedHistory[wIdx] || '';

              return (
                <span
                  key={wIdx}
                  ref={(el) => {
                    wordRefs.current[wIdx] = el;
                  }}
                  className={`relative inline-block transition-all duration-150 rounded-lg px-2 py-0.5 border ${
                    isCurrent
                      ? 'bg-[var(--accent-subtle)]/45 border-[var(--accent-color)]/35 shadow-xs'
                      : 'border-transparent'
                  }`}
                  style={{ lineHeight: 1.45 }}
                >
                  {/* Past word rendering: clean, distinct correct & error feedback */}
                  {isPast && (
                    <>
                      {word.split('').map((char, cIdx) => {
                        const typedChar = pastTyped[cIdx];
                        const isCorrect = typedChar === char;
                        const isMissed = cIdx >= pastTyped.length;
                        return (
                          <span
                            key={cIdx}
                            className={
                              isCorrect
                                ? 'text-[#5DBE76] opacity-90 font-medium'
                                : isMissed
                                ? 'text-[#E55858] opacity-90 underline decoration-red-500/75'
                                : 'text-[#E55858] opacity-90 underline decoration-red-500/75'
                            }
                          >
                            {char}
                          </span>
                        );
                      })}
                      {pastTyped.length > word.length && (
                        <span className="text-[#E55858] opacity-80 underline decoration-red-500/75">
                          {pastTyped.slice(word.length)}
                        </span>
                      )}
                    </>
                  )}

                  {/* Current word rendering: high contrast, clear focus & caret */}
                  {isCurrent && (
                    <>
                      {word.split('').map((char, cIdx) => {
                        const typedChar = currentTyped[cIdx];
                        const isTyped = cIdx < currentTyped.length;
                        const isCaretHere = cIdx === currentTyped.length;
                        const isCorrect = typedChar === char;

                        return (
                          <span key={cIdx} className="relative inline-block">
                            {/* Caret */}
                            {isCaretHere && settings.caretStyle !== 'off' && !isPaused && (
                              <span
                                className={`absolute left-0 -top-1 bottom-0 pointer-events-none z-10 ${
                                  settings.caretStyle === 'line'
                                    ? 'caret-line w-[3px] bg-[var(--accent-color)] rounded-full'
                                    : settings.caretStyle === 'block'
                                    ? 'caret-block w-full bg-[var(--accent-color)]/35 rounded-xs'
                                    : 'caret-underline border-b-[3px] border-[var(--accent-color)]'
                                }`}
                              />
                            )}

                            <span
                              className={
                                !isTyped
                                  ? 'char-current-untyped text-[#ECEBE4] dark:text-[#F1F5F2] light:text-[#26342F] font-medium'
                                  : isCorrect
                                  ? 'char-correct text-[#5DBE76] font-semibold'
                                  : 'char-incorrect text-[#E55858] font-bold bg-red-500/20 px-0.5 rounded-xs underline decoration-red-500'
                              }
                            >
                              {char}
                            </span>
                          </span>
                        );
                      })}

                      {/* Extra characters typed beyond word length */}
                      {currentTyped.length > word.length && (
                        <span className="char-extra text-[#E55858] font-bold bg-red-500/25 px-0.5 rounded-xs underline decoration-red-500">
                          {currentTyped.slice(word.length)}
                        </span>
                      )}

                      {/* Caret after end of word */}
                      {currentTyped.length >= word.length && settings.caretStyle !== 'off' && !isPaused && (
                        <span className="inline-block w-[3px] h-[1.2em] bg-[var(--accent-color)] align-middle caret-line rounded-full ml-0.5" />
                      )}
                    </>
                  )}

                  {/* Untyped future words: clearly visible, high contrast, easy to read ahead */}
                  {!isPast && !isCurrent && (
                    <span className="char-untyped text-[#A2A79E] dark:text-[#A0A69D] font-normal transition-colors duration-150">
                      {word}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Paused Overlay */}
        {isPaused && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#20211D]/85 backdrop-blur-sm rounded-2xl sm:rounded-3xl cursor-pointer z-30 animate-fadeIn"
            onClick={togglePause}
          >
            <div className="flex flex-col items-center gap-3 p-6 sm:p-8 rounded-2xl bg-[#272824] border border-[#353630] shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-[#E6C76B]/15 border border-[#E6C76B]/30 flex items-center justify-center text-[#E6C76B]">
                <Pause className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#ECEBE4] font-mono">Test Paused</h3>
              <p className="text-xs sm:text-sm text-[#989A92] font-mono max-w-xs">
                Take a breath! Press <kbd className="px-2 py-0.5 rounded bg-[#20211D] border border-[#353630] text-[#ECEBE4]">Space</kbd> or click below to resume.
              </p>
              <Button variant="primary" size="md" onClick={togglePause} leftIcon={<Play className="w-4 h-4 fill-current" />}>
                Resume Test
              </Button>
            </div>
          </div>
        )}

        {/* Focus Overlay if clicked away */}
        {!isFocused && !isPaused && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#20211D]/80 backdrop-blur-xs rounded-2xl sm:rounded-3xl cursor-pointer z-20 animate-fadeIn"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#272824] border border-[#353630] text-sm font-mono text-[#E6C76B] shadow-2xl animate-pulse">
              <MousePointerClick className="w-4 h-4" />
              <span>Click anywhere or press any key to focus</span>
            </div>
          </div>
        )}
      </div>

      {/* Beginner-Friendly Distraction-Free Helper & Hint Bar */}
      <div className="mt-4 text-xs font-mono text-[#7E8079] flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center">
        {!isStarted ? (
          <span>
            Type to begin &bull; <kbd className="px-1.5 py-0.5 rounded-md bg-[#272824] border border-[#353630] text-[#ECEBE4] text-[11px] shadow-xs">Tab</kbd> restart &bull; <kbd className="px-1.5 py-0.5 rounded-md bg-[#272824] border border-[#353630] text-[#ECEBE4] text-[11px] shadow-xs">Esc</kbd> pause
          </span>
        ) : (
          <span>
            Find your rhythm &bull; <kbd className="px-1.5 py-0.5 rounded-md bg-[#272824] border border-[#353630] text-[#ECEBE4] text-[11px] shadow-xs">Tab</kbd> restart &bull; <kbd className="px-1.5 py-0.5 rounded-md bg-[#272824] border border-[#353630] text-[#ECEBE4] text-[11px] shadow-xs">Esc</kbd> pause
          </span>
        )}
      </div>

      {/* Virtual Keyboard */}
      {settings.showKeyboard && (
        <div className="w-full mt-6">
          <VirtualKeyboard
            currentKey={currentExpectedChar}
            isError={lastKeystrokeError}
          />
        </div>
      )}
    </div>
  );
};

