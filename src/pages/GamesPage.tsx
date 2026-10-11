import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { soundEngine } from '../utils/sound';
import { COMMON_WORDS_200, EXTENDED_WORDS } from '../data/wordLists';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Gamepad2,
  Zap,
  ShieldAlert,
  Hourglass,
  Trophy,
  RotateCcw,
  Play,
  Pause,
  Heart,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';

type GameMode = 'word-sprint' | 'accuracy-challenge' | 'time-challenge';

export const GamesPage: React.FC = () => {
  const { gameScores, saveGameResult } = useProgress();
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();

  const [activeGame, setActiveGame] = useState<GameMode>('word-sprint');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Word Sprint state
  const [sprintDistance, setSprintDistance] = useState(0);
  const targetSprintDistance = 500;
  const [sprintLives, setSprintLives] = useState(3);
  const [currentWord, setCurrentWord] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);

  // Accuracy Challenge state
  const [health, setHealth] = useState(100);
  const [accuracyPassage, setAccuracyPassage] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  // Time Challenge state
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [wordsCompletedCount, setWordsCompletedCount] = useState(0);
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // High scores from context
  const sprintHighScore = gameScores['word-sprint'] || 0;
  const accuracyHighScore = gameScores['accuracy-challenge'] || 0;
  const timeHighScore = gameScores['time-challenge'] || 0;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Initialize Word Sprint
  const initWordSprint = () => {
    const words = Array.from({ length: 50 }, () => {
      const pool = [...COMMON_WORDS_200, ...EXTENDED_WORDS];
      return pool[Math.floor(Math.random() * pool.length)];
    });
    setWordPool(words);
    setWordIndex(0);
    setCurrentWord(words[0]);
    setInputVal('');
    setSprintDistance(0);
    setSprintLives(3);
    setScore(0);
    setStreak(0);
    setIsPlaying(true);
    setIsPaused(false);
    setIsGameOver(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Initialize Accuracy Challenge
  const initAccuracyChallenge = () => {
    const sentences = [
      "Precision is the foundational secret to velocity. Never sacrifice accuracy for speed, as every deliberate keystroke reinforces flawless muscle memory for the future.",
      "A steady rhythm triumphs over frantic haste. Keep your posture tall, your breathing relaxed, and your mind anchored in absolute calmness.",
      "The master typist does not look at the keys, nor does the pianist glance at their fingers. Faith in repetition transforms practice into pure instinct."
    ];
    const chosen = sentences[Math.floor(Math.random() * sentences.length)];
    setAccuracyPassage(chosen);
    setCharIndex(0);
    setHealth(100);
    setScore(0);
    setStreak(0);
    setIsPlaying(true);
    setIsPaused(false);
    setIsGameOver(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Initialize Time Challenge
  const initTimeChallenge = () => {
    const words = Array.from({ length: 100 }, () => {
      const pool = [...COMMON_WORDS_200, ...EXTENDED_WORDS];
      return pool[Math.floor(Math.random() * pool.length)];
    });
    setWordPool(words);
    setWordIndex(0);
    setCurrentWord(words[0]);
    setInputVal('');
    setTimeRemaining(20);
    setWordsCompletedCount(0);
    setScore(0);
    setStreak(0);
    setIsPlaying(true);
    setIsPaused(false);
    setIsGameOver(false);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endGame('time-challenge', 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Start selected game
  const startGame = () => {
    if (activeGame === 'word-sprint') initWordSprint();
    else if (activeGame === 'accuracy-challenge') initAccuracyChallenge();
    else if (activeGame === 'time-challenge') initTimeChallenge();
  };

  // End game handler
  const endGame = (gameId: GameMode, finalScore: number) => {
    setIsPlaying(false);
    setIsPaused(false);
    setIsGameOver(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const targetScore = finalScore > 0 ? finalScore : score;
    const { isNewBest } = saveGameResult(gameId, targetScore);
    if (isNewBest) {
      toast.success(`New High Score in ${gameId}: ${targetScore} pts! 🏆`);
    } else {
      toast.info(`Game Over! Final Score: ${targetScore} pts.`);
    }
  };

  // Pause / Resume toggle
  const togglePause = () => {
    if (!isPlaying || isGameOver) return;
    if (!isPaused) {
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsPaused(false);
      if (activeGame === 'time-challenge') {
        timerRef.current = window.setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              endGame('time-challenge', 0);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Word Sprint input handler
  const handleSprintInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPaused) return;
    const val = e.target.value;
    setInputVal(val);

    soundEngine.playKey(settings.soundTheme, settings.soundVolume);

    if (val.trim() === currentWord) {
      const nextDistance = sprintDistance + 25;
      const nextStreak = streak + 1;
      const wordScore = 50 + nextStreak * 15;
      const nextScore = score + wordScore;

      setSprintDistance(nextDistance);
      setStreak(nextStreak);
      setScore(nextScore);
      setInputVal('');

      if (nextDistance >= targetSprintDistance) {
        soundEngine.playCompletionChime(settings.soundVolume);
        endGame('word-sprint', nextScore + 500);
        return;
      }

      const nextIndex = wordIndex + 1;
      setWordIndex(nextIndex);
      setCurrentWord(wordPool[nextIndex] || 'finish');
    } else if (val.length > 0 && !currentWord.startsWith(val)) {
      soundEngine.playError(settings.soundVolume);
      setStreak(0);
      const nextLives = sprintLives - 1;
      setSprintLives(nextLives);
      setInputVal('');

      if (nextLives <= 0) {
        endGame('word-sprint', score);
      }
    }
  };

  // Accuracy Challenge KeyDown handler
  const handleAccuracyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      startGame();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      togglePause();
      return;
    }

    if (!isPlaying || isPaused || isGameOver || e.key.length !== 1) return;

    const expected = accuracyPassage[charIndex];
    if (!expected) return;

    if (e.key === expected) {
      soundEngine.playKey(settings.soundTheme, settings.soundVolume);
      const nextIndex = charIndex + 1;
      const nextStreak = streak + 1;
      const nextScore = score + 10 + Math.floor(nextStreak / 5) * 5;

      setCharIndex(nextIndex);
      setStreak(nextStreak);
      setScore(nextScore);

      if (nextIndex >= accuracyPassage.length) {
        const bonus = health * 10;
        soundEngine.playCompletionChime(settings.soundVolume);
        endGame('accuracy-challenge', nextScore + bonus);
      }
    } else {
      soundEngine.playError(settings.soundVolume);
      setStreak(0);
      const nextHealth = Math.max(0, health - 15);
      setHealth(nextHealth);

      if (nextHealth <= 0) {
        endGame('accuracy-challenge', score);
      }
    }
  };

  // Time Challenge input handler
  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPaused) return;
    const val = e.target.value;
    setInputVal(val);

    soundEngine.playKey(settings.soundTheme, settings.soundVolume);

    if (val.trim() === currentWord) {
      const bonusSec = 2;
      setTimeRemaining((prev) => Math.min(60, prev + bonusSec));
      const nextCount = wordsCompletedCount + 1;
      setWordsCompletedCount(nextCount);

      const nextStreak = streak + 1;
      const wordScore = 40 + nextStreak * 10;
      const nextScore = score + wordScore;

      setStreak(nextStreak);
      setScore(nextScore);
      setInputVal('');

      const nextIndex = wordIndex + 1;
      setWordIndex(nextIndex);
      setCurrentWord(wordPool[nextIndex] || 'swift');
    } else if (val.length > 0 && !currentWord.startsWith(val)) {
      soundEngine.playError(settings.soundVolume);
      setStreak(0);
      setInputVal('');
    }
  };

  const toggleSound = () => {
    updateSettings({
      soundTheme: settings.soundTheme === 'off' ? 'click' : 'off',
    });
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#272824] border border-[#353630]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#E6C76B] uppercase tracking-wider mb-1">
            <Gamepad2 className="w-4 h-4" />
            <span>RizKey Arcades</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4]">
            Typing Challenge Games
          </h1>
          <p className="text-xs sm:text-sm text-[#989A92] mt-1 max-w-xl">
            Push your reflexes, focus, and adrenaline with three genuinely interactive typing challenges.
          </p>
        </div>

        {/* Game Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#20211D] border border-[#353630]">
          <button
            onClick={() => {
              setActiveGame('word-sprint');
              setIsPlaying(false);
              setIsGameOver(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
              activeGame === 'word-sprint'
                ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                : 'text-[#989A92] hover:text-[#ECEBE4]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Word Sprint</span>
          </button>

          <button
            onClick={() => {
              setActiveGame('accuracy-challenge');
              setIsPlaying(false);
              setIsGameOver(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
              activeGame === 'accuracy-challenge'
                ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                : 'text-[#989A92] hover:text-[#ECEBE4]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Shield</span>
          </button>

          <button
            onClick={() => {
              setActiveGame('time-challenge');
              setIsPlaying(false);
              setIsGameOver(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
              activeGame === 'time-challenge'
                ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                : 'text-[#989A92] hover:text-[#ECEBE4]'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>Time Frenzy</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-xl text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#272824] transition-colors"
            title="Toggle sound"
          >
            {settings.soundTheme === 'off' ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#E6C76B]" />}
          </button>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="p-6 sm:p-10 rounded-2xl bg-[#272824] border border-[#353630] flex flex-col items-center justify-center min-h-[420px] relative">
        {!isPlaying && !isGameOver && (
          <div className="text-center max-w-md animate-fadeIn">
            {activeGame === 'word-sprint' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#E6C76B]/10 border border-[#E6C76B]/30 flex items-center justify-center mx-auto mb-4 text-[#E6C76B]">
                  <Zap className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-[#ECEBE4] mb-2 font-mono">Word Sprint 500m</h2>
                <p className="text-xs text-[#989A92] mb-4 leading-relaxed font-sans">
                  Sprint across a 500-meter track! Type each word accurately to propel forward (+25m). Mistakes cost lives. Finish before your 3 lives expire.
                </p>
                <div className="mb-6">
                  <Badge variant="amber" size="sm" icon={<Trophy className="w-3.5 h-3.5" />}>
                    High Score: {sprintHighScore} pts
                  </Badge>
                </div>
              </>
            )}

            {activeGame === 'accuracy-challenge' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#5DBE76]/10 border border-[#5DBE76]/30 flex items-center justify-center mx-auto mb-4 text-[#5DBE76]">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-[#ECEBE4] mb-2 font-mono">Precision Shield</h2>
                <p className="text-xs text-[#989A92] mb-4 leading-relaxed font-sans">
                  Maintain 100% health shield while typing challenging passages. Every single error inflicts -15 damage. Complete the passage before your shield breaks!
                </p>
                <div className="mb-6">
                  <Badge variant="green" size="sm" icon={<Trophy className="w-3.5 h-3.5" />}>
                    High Score: {accuracyHighScore} pts
                  </Badge>
                </div>
              </>
            )}

            {activeGame === 'time-challenge' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-4 text-orange-400">
                  <Hourglass className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-[#ECEBE4] mb-2 font-mono">Time Frenzy Survival</h2>
                <p className="text-xs text-[#989A92] mb-4 leading-relaxed font-sans">
                  Start with only 20 seconds on the clock. Every correctly typed word grants +2 bonus seconds and increases combo points. Survive as long as you can!
                </p>
                <div className="mb-6">
                  <Badge variant="orange" size="sm" icon={<Trophy className="w-3.5 h-3.5" />}>
                    High Score: {timeHighScore} pts
                  </Badge>
                </div>
              </>
            )}

            <div>
              <Button
                variant="primary"
                size="md"
                onClick={startGame}
                leftIcon={<Play className="w-4 h-4 fill-current" />}
              >
                Start Game
              </Button>
            </div>
          </div>
        )}

        {/* Game In-Progress Screens */}
        {isPlaying && (
          <div className="w-full max-w-xl animate-fadeIn relative">
            {/* WORD SPRINT PLAY SCREEN */}
            {activeGame === 'word-sprint' && (
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-4 text-[#989A92]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#ECEBE4] font-bold text-sm">{sprintDistance}m</span>
                    <span>/ {targetSprintDistance}m</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-red-400">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Heart
                        key={i}
                        className={`w-4 h-4 ${
                          i < sprintLives ? 'fill-red-500 text-red-500' : 'text-[#353630]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[#E6C76B] font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{streak}x combo</span>
                  </div>
                  <div className="font-bold text-[#ECEBE4] text-sm">
                    {score} pts
                  </div>
                </div>

                <div className="w-full h-3 rounded-full bg-[#20211D] border border-[#353630] overflow-hidden mb-8 relative">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[#E6C76B] transition-all duration-300 rounded-full"
                    style={{ width: `${(sprintDistance / targetSprintDistance) * 100}%` }}
                  />
                </div>

                <div className="text-center py-6">
                  <span className="text-xs font-mono text-[#989A92] uppercase tracking-wider block mb-2">
                    Type to sprint:
                  </span>
                  <div className="text-4xl sm:text-5xl font-mono font-bold text-[#ECEBE4] tracking-wider mb-6">
                    {currentWord}
                  </div>

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={handleSprintInput}
                    placeholder="type here..."
                    className="w-full max-w-xs mx-auto text-center px-4 py-3 rounded-xl bg-[#20211D] border-2 border-[#E6C76B] text-[#ECEBE4] font-mono text-xl focus:outline-none shadow-lg"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* ACCURACY CHALLENGE PLAY SCREEN */}
            {activeGame === 'accuracy-challenge' && (
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-4 text-[#989A92]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#5DBE76] font-bold text-sm">Shield: {health}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#E6C76B] font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{streak} streak</span>
                  </div>
                  <div className="font-bold text-[#ECEBE4] text-sm">
                    {score} pts
                  </div>
                </div>

                <div className="w-full h-3 rounded-full bg-[#20211D] border border-[#353630] overflow-hidden mb-6">
                  <div
                    className={`h-full transition-all duration-200 rounded-full ${
                      health > 50 ? 'bg-[#5DBE76]' : health > 25 ? 'bg-amber-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${health}%` }}
                  />
                </div>

                <div
                  className="p-5 rounded-2xl bg-[#20211D] border border-[#353630] font-mono text-lg leading-relaxed mb-6 cursor-text"
                  onClick={() => inputRef.current?.focus()}
                >
                  {accuracyPassage.split('').map((ch, idx) => {
                    const isTyped = idx < charIndex;
                    const isCurrent = idx === charIndex;
                    return (
                      <span
                        key={idx}
                        className={
                          isTyped
                            ? 'text-[#5DBE76]'
                            : isCurrent
                            ? 'text-[#E6C76B] bg-[#E6C76B]/20 border-b-2 border-[#E6C76B]'
                            : 'text-[#7E8079]'
                        }
                      >
                        {ch}
                      </span>
                    );
                  })}
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  className="opacity-0 absolute pointer-events-none"
                  onKeyDown={handleAccuracyKeyDown}
                  autoFocus
                />
                <p className="text-center text-xs font-mono text-[#7E8079]">
                  Type keys cleanly without looking down. Errors drain shield. Press <kbd className="px-1 py-0.5 rounded bg-[#20211D] text-[#ECEBE4]">Esc</kbd> to pause.
                </p>
              </div>
            )}

            {/* TIME CHALLENGE PLAY SCREEN */}
            {activeGame === 'time-challenge' && (
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-4 text-[#989A92]">
                  <div className="flex items-center gap-1.5 text-base font-bold text-orange-400">
                    <Hourglass className="w-4 h-4 animate-spin" />
                    <span>{timeRemaining}s remaining</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#E6C76B] font-bold">
                    <span>{wordsCompletedCount} words</span>
                  </div>
                  <div className="font-bold text-[#ECEBE4] text-sm">
                    {score} pts
                  </div>
                </div>

                <div className="w-full h-3 rounded-full bg-[#20211D] border border-[#353630] overflow-hidden mb-8">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, (timeRemaining / 30) * 100)}%` }}
                  />
                </div>

                <div className="text-center py-6">
                  <span className="text-xs font-mono text-[#989A92] uppercase tracking-wider block mb-2">
                    Fast! Type:
                  </span>
                  <div className="text-4xl sm:text-5xl font-mono font-bold text-[#ECEBE4] tracking-wider mb-6">
                    {currentWord}
                  </div>

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={handleTimeInput}
                    placeholder="type fast..."
                    className="w-full max-w-xs mx-auto text-center px-4 py-3 rounded-xl bg-[#20211D] border-2 border-orange-400 text-[#ECEBE4] font-mono text-xl focus:outline-none shadow-lg"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game Over / Victory Screen */}
        {isGameOver && (
          <div className="text-center max-w-md animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-[#E6C76B]/15 border border-[#E6C76B]/40 flex items-center justify-center mx-auto mb-4 text-[#E6C76B]">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-[#ECEBE4] mb-1 font-mono">Game Over!</h2>
            <p className="text-xs text-[#989A92] mb-6 font-sans">
              Your final score has been saved to your local high score records.
            </p>

            <div className="p-4 rounded-2xl bg-[#20211D] border border-[#353630] mb-6 font-mono">
              <span className="text-xs text-[#989A92] uppercase block">Final Score</span>
              <span className="text-4xl font-bold text-[#E6C76B]">{score}</span>
              <div className="text-xs text-[#989A92] mt-1">
                Personal Record: {Math.max(score, gameScores[activeGame] || 0)} pts
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={startGame}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Play Again
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsGameOver(false);
                  setIsPlaying(false);
                }}
              >
                Select Another Game
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
