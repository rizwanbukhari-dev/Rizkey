import React from 'react';
import { TestMode, TimeLimit, WordLimit, Difficulty } from '../../types/typing';
import { Clock, AlignLeft, Quote, Sparkles, Sliders } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface ModeSelectorProps {
  mode: TestMode;
  timeLimit: TimeLimit;
  wordLimit: WordLimit;
  difficulty: Difficulty;
  includePunctuation: boolean;
  includeNumbers: boolean;
  onModeChange: (mode: TestMode) => void;
  onTimeLimitChange: (limit: TimeLimit) => void;
  onWordLimitChange: (limit: WordLimit) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onTogglePunctuation: () => void;
  onToggleNumbers: () => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  timeLimit,
  wordLimit,
  difficulty,
  includePunctuation,
  includeNumbers,
  onModeChange,
  onTimeLimitChange,
  onWordLimitChange,
  onDifficultyChange,
  onTogglePunctuation,
  onToggleNumbers,
  disabled = false,
}) => {
  const timeOptions: TimeLimit[] = [15, 30, 60, 120];
  const wordOptions: WordLimit[] = [10, 25, 50, 100];
  const difficultyOptions: Difficulty[] = ['beginner', 'normal', 'advanced'];

  return (
    <div
      role="toolbar"
      aria-label="Typing test configuration toolbar"
      className={`inline-flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-3 py-2 rounded-2xl bg-[#272824] border border-[#353630] text-xs font-mono transition-all duration-150 select-none shadow-sm ${
        disabled ? 'opacity-40 pointer-events-none' : ''
      }`}
    >
      {/* Toggles: Punctuation & Numbers */}
      <div className="flex items-center gap-1 pr-1.5 sm:pr-2 border-r border-[#353630]">
        <Tooltip content={includePunctuation ? "Disable punctuation" : "Enable punctuation"}>
          <button
            onClick={onTogglePunctuation}
            aria-pressed={includePunctuation}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all duration-150 ${
              includePunctuation
                ? 'text-[#E6C76B] font-bold bg-[#20211D] shadow-xs'
                : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#20211D]/40'
            }`}
          >
            <span className="font-bold">@</span>
            <span className="hidden sm:inline">punctuation</span>
          </button>
        </Tooltip>

        <Tooltip content={includeNumbers ? "Disable numbers" : "Enable numbers"}>
          <button
            onClick={onToggleNumbers}
            aria-pressed={includeNumbers}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all duration-150 ${
              includeNumbers
                ? 'text-[#E6C76B] font-bold bg-[#20211D] shadow-xs'
                : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#20211D]/40'
            }`}
          >
            <span className="font-bold">#</span>
            <span className="hidden sm:inline">numbers</span>
          </button>
        </Tooltip>
      </div>

      {/* Modes */}
      <div className="flex items-center gap-1 pr-1.5 sm:pr-2 border-r border-[#353630]">
        <Tooltip content="Timed test mode">
          <button
            onClick={() => onModeChange('time')}
            aria-pressed={mode === 'time'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all duration-150 ${
              mode === 'time'
                ? 'text-[#E6C76B] font-bold bg-[#20211D] shadow-xs'
                : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#20211D]/40'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>time</span>
          </button>
        </Tooltip>

        <Tooltip content="Word count mode">
          <button
            onClick={() => onModeChange('words')}
            aria-pressed={mode === 'words'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all duration-150 ${
              mode === 'words'
                ? 'text-[#E6C76B] font-bold bg-[#20211D] shadow-xs'
                : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#20211D]/40'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>words</span>
          </button>
        </Tooltip>

        <Tooltip content="Inspiring quotes mode">
          <button
            onClick={() => onModeChange('quote')}
            aria-pressed={mode === 'quote'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all duration-150 ${
              mode === 'quote'
                ? 'text-[#E6C76B] font-bold bg-[#20211D] shadow-xs'
                : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#20211D]/40'
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            <span>quote</span>
          </button>
        </Tooltip>

        <Tooltip content="Complete sentence mode">
          <button
            onClick={() => onModeChange('sentences')}
            aria-pressed={mode === 'sentences'}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all duration-150 ${
              mode === 'sentences'
                ? 'text-[#E6C76B] font-bold bg-[#20211D] shadow-xs'
                : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#20211D]/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>sentences</span>
          </button>
        </Tooltip>
      </div>

      {/* Sub-options for time mode */}
      {mode === 'time' && (
        <div className="flex items-center gap-1 pr-1.5 sm:pr-2 border-r border-[#353630]">
          {timeOptions.map((t) => (
            <button
              key={t}
              onClick={() => onTimeLimitChange(t)}
              aria-pressed={timeLimit === t}
              className={`px-2 py-0.5 rounded-lg transition-all duration-150 ${
                timeLimit === t
                  ? 'text-[#E6C76B] font-bold bg-[#20211D]'
                  : 'text-[#989A92] hover:text-[#ECEBE4]'
              }`}
            >
              {t}s
            </button>
          ))}
        </div>
      )}

      {/* Sub-options for words mode */}
      {mode === 'words' && (
        <div className="flex items-center gap-1 pr-1.5 sm:pr-2 border-r border-[#353630]">
          {wordOptions.map((w) => (
            <button
              key={w}
              onClick={() => onWordLimitChange(w)}
              aria-pressed={wordLimit === w}
              className={`px-2 py-0.5 rounded-lg transition-all duration-150 ${
                wordLimit === w
                  ? 'text-[#E6C76B] font-bold bg-[#20211D]'
                  : 'text-[#989A92] hover:text-[#ECEBE4]'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {/* Difficulty selector */}
      <div className="hidden lg:flex items-center gap-1">
        <Sliders className="w-3 h-3 text-[#7E8079] mr-0.5" />
        {difficultyOptions.map((d) => (
          <button
            key={d}
            onClick={() => onDifficultyChange(d)}
            aria-pressed={difficulty === d}
            className={`capitalize px-2 py-0.5 rounded-lg text-[11px] transition-all duration-150 ${
              difficulty === d
                ? 'text-[#E6C76B] font-bold bg-[#20211D]'
                : 'text-[#989A92] hover:text-[#ECEBE4]'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
};
