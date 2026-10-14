import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useToast } from '../context/ToastContext';
import { TypingEngine } from '../components/typing/TypingEngine';
import { ResultsView } from '../components/typing/ResultsView';
import { Button } from '../components/ui/Button';
import { TestResult, Difficulty } from '../types/typing';
import {
  generateWords,
  getRandomSentence,
  getRandomParagraph,
  DIFFICULT_WORDS,
} from '../data/wordLists';
import {
  Target,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  FileText,
  Code2,
  BookOpen,
  ShieldCheck,
  Hash,
  Type,
  AlignLeft,
} from 'lucide-react';

function generateRandomLetters(count: number): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const l1 = letters[Math.floor(Math.random() * letters.length)];
    const l2 = letters[Math.floor(Math.random() * letters.length)];
    const l3 = letters[Math.floor(Math.random() * letters.length)];
    parts.push(`${l1}${l2}${l3}`);
  }
  return parts.join(' ');
}

type DrillId =
  | 'letters'
  | 'words'
  | 'sentences'
  | 'accuracy'
  | 'speed'
  | 'punctuation'
  | 'numbers'
  | 'custom'
  | 'passages';

interface DrillConfig {
  id: DrillId;
  title: string;
  category: 'basics' | 'skills' | 'personal';
  description: string;
  icon: any;
  badge?: string;
}

const DRILL_OPTIONS: DrillConfig[] = [
  // 1. Build the Basics
  {
    id: 'letters',
    title: 'Practise Letters',
    category: 'basics',
    description: 'Master individual character keystrokes and isolated muscle memory.',
    icon: Type,
  },
  {
    id: 'words',
    title: 'Practise Words',
    category: 'basics',
    description: 'Improve your familiarity and muscle memory with common English words.',
    icon: AlignLeft,
  },
  {
    id: 'sentences',
    title: 'Practise Sentences',
    category: 'basics',
    description: 'Build typing rhythm and fluid continuity across full, grammatical sentences.',
    icon: Sparkles,
  },

  // 2. Improve Your Skills
  {
    id: 'accuracy',
    title: 'Improve Accuracy',
    category: 'skills',
    description: 'Focus on typing correctly and eliminating micro-stutters before pushing speed.',
    icon: ShieldCheck,
    badge: 'Precision',
  },
  {
    id: 'speed',
    title: 'Increase Speed',
    category: 'skills',
    description: 'Build fast finger reflexes and burst speed while maintaining steady rhythm.',
    icon: Zap,
    badge: 'Velocity',
  },
  {
    id: 'punctuation',
    title: 'Practise Punctuation',
    category: 'skills',
    description: 'Master commas, periods, quotation marks, and semicolons without hesitation.',
    icon: Sliders,
  },
  {
    id: 'numbers',
    title: 'Practise Numbers',
    category: 'skills',
    description: 'Build confidence with the top numeric row and symbol coordination.',
    icon: Hash,
  },

  // 3. Personal Practice
  {
    id: 'custom',
    title: 'Custom Text',
    category: 'personal',
    description: 'Practise typing with any custom notes, essays, or passages you choose.',
    icon: FileText,
  },
  {
    id: 'passages',
    title: 'Saved Literature Passages',
    category: 'personal',
    description: 'Practise famous literature, speeches, and philosophical quotes.',
    icon: BookOpen,
  },
];

export const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const { addTestResult } = useProgress();
  const { toast } = useToast();

  const [activeDrill, setActiveDrill] = useState<DrillId | null>(null);
  const [wordCount, setWordCount] = useState<15 | 30 | 60>(30);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState('');

  const [drillText, setDrillText] = useState('');
  const [activeResult, setActiveResult] = useState<TestResult | null>(null);
  const [engineKey, setEngineKey] = useState(0);

  const activeConfig = DRILL_OPTIONS.find((d) => d.id === activeDrill);

  // Generate text for the chosen drill
  const generateTextForDrill = (
    drillId: DrillId,
    overrideCount = wordCount,
    overrideDifficulty = difficulty
  ) => {
    let text = '';
    const count = overrideCount;

    switch (drillId) {
      case 'letters': {
        text = generateRandomLetters(count);
        break;
      }
      case 'words':
        text = generateWords({ count, difficulty: overrideDifficulty });
        break;
      case 'sentences':
        text = Array.from({ length: Math.max(2, Math.round(count / 10)) }, () => getRandomSentence()).join(' ');
        break;
      case 'accuracy': {
        // Tricky, precision words
        text = Array.from({ length: count }, () => {
          const idx = Math.floor(Math.random() * DIFFICULT_WORDS.length);
          return DIFFICULT_WORDS[idx];
        }).join(' ');
        break;
      }
      case 'speed':
        // High frequency smooth flowing words
        text = generateWords({ count, difficulty: 'beginner' });
        break;
      case 'punctuation':
        text = generateWords({ count, punctuation: true });
        break;
      case 'numbers':
        text = generateWords({ count, numbers: true });
        break;
      case 'passages':
        text = getRandomParagraph();
        break;
      case 'custom':
        if (!customInput.trim()) {
          text = 'Practice builds permanent muscle memory. Type this starter text or paste your own custom passage above.';
        } else {
          text = customInput.trim();
        }
        break;
      default:
        text = generateWords({ count });
    }

    setDrillText(text);
    setActiveResult(null);
    setEngineKey((k) => k + 1);
  };

  const handleSelectDrill = (drillId: DrillId) => {
    setActiveDrill(drillId);
    generateTextForDrill(drillId);
  };

  const handleTestComplete = (rawResult: Omit<TestResult, 'isPersonalBest'>) => {
    const { result, isPersonalBest } = addTestResult(rawResult);
    setActiveResult(result);
    if (isPersonalBest) {
      toast.success('New Personal Best speed achieved in Practice!');
    } else {
      toast.info('Drill completed!');
    }
  };

  const handleCustomApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) {
      setCustomError('Please paste or enter some text first.');
      return;
    }
    const cleaned = customInput.replace(/\s+/g, ' ').trim();
    if (cleaned.length < 5) {
      setCustomError('Text is too short. Please provide at least a few words.');
      return;
    }
    setCustomError('');
    setDrillText(cleaned);
    setActiveResult(null);
    setEngineKey((k) => k + 1);
    toast.success('Custom text loaded into practice drill!');
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 animate-fadeIn pb-16">
      {/* ========================================================
          VIEW A: ACTIVE DRILL WORKSPACE (Clean, focused activity)
         ======================================================== */}
      {activeDrill && activeConfig ? (
        <div className="space-y-6">
          {/* Top Breadcrumb & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#353630]">
            <div>
              <button
                onClick={() => setActiveDrill(null)}
                className="flex items-center gap-1.5 text-xs font-mono text-[var(--accent-color)] hover:underline mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Practice Categories</span>
              </button>

              <h1 className="text-2xl font-bold text-[#ECEBE4] flex items-center gap-2.5">
                <activeConfig.icon className="w-6 h-6 text-[var(--accent-color)]" />
                <span>{activeConfig.title}</span>
              </h1>
              <p className="text-xs text-[#989A92] mt-0.5">
                {activeConfig.description}
              </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {activeDrill !== 'custom' && activeDrill !== 'passages' && (
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#272824] border border-[#353630] text-xs font-mono">
                  <span className="text-[#989A92] px-2">Words:</span>
                  {([15, 30, 60] as const).map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => {
                        setWordCount(cnt);
                        generateTextForDrill(activeDrill, cnt, difficulty);
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        wordCount === cnt
                          ? 'bg-[#20211D] text-[var(--accent-color)] font-bold border border-[#353630]'
                          : 'text-[#989A92] hover:text-[#ECEBE4]'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              )}

              {activeDrill === 'words' && (
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#272824] border border-[#353630] text-xs font-mono">
                  <span className="text-[#989A92] px-2">Level:</span>
                  {(['beginner', 'normal', 'advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setDifficulty(lvl);
                        generateTextForDrill('words', wordCount, lvl);
                      }}
                      className={`px-2 py-1 rounded-lg capitalize transition-colors ${
                        difficulty === lvl
                          ? 'bg-[#20211D] text-[var(--accent-color)] font-bold border border-[#353630]'
                          : 'text-[#989A92] hover:text-[#ECEBE4]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => generateTextForDrill(activeDrill, wordCount, difficulty)}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                New Drill
              </Button>
            </div>
          </div>

          {/* Custom Text input area if custom drill is chosen */}
          {activeDrill === 'custom' && (
            <form onSubmit={handleCustomApply} className="p-4 rounded-2xl bg-[#272824] border border-[#353630] space-y-3 font-mono text-xs">
              <label className="block text-[#989A92] uppercase font-semibold">
                Paste Custom Text to Practice
              </label>
              <textarea
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  setCustomError('');
                }}
                rows={3}
                placeholder="Paste any article, paragraph, literature, or custom notes here..."
                className="w-full p-3 rounded-xl bg-[#20211D] border border-[#353630] text-[#ECEBE4] focus:outline-none focus:border-[var(--accent-color)] resize-none leading-relaxed"
              />
              {customError && <p className="text-red-400">{customError}</p>}
              <div className="flex items-center justify-between">
                <span className="text-[#7E8079]">
                  {customInput.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <Button type="submit" variant="primary" size="sm">
                  Apply Text
                </Button>
              </div>
            </form>
          )}

          {/* Dedicated Typing Engine or Results View */}
          {drillText && (
            <div className="bg-[#272824]/60 border border-[#353630] rounded-2xl p-6 sm:p-8">
              {activeResult ? (
                <div className="space-y-6">
                  <ResultsView
                    result={activeResult}
                    onRetry={() => generateTextForDrill(activeDrill)}
                    onNextTest={() => generateTextForDrill(activeDrill)}
                  />
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveDrill(null)}
                      leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                    >
                      Choose Another Practice Option
                    </Button>
                  </div>
                </div>
              ) : (
                <TypingEngine
                  key={engineKey}
                  initialText={drillText}
                  mode="custom"
                  onComplete={handleTestComplete}
                  onRestart={() => generateTextForDrill(activeDrill)}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================
           VIEW B: PRACTICE SELECTION DIRECTORY (Clean categories)
           ======================================================== */
        <div>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4] flex items-center gap-3">
              <Target className="w-7 h-7 text-[var(--accent-color)]" />
              <span>Practice Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#989A92] mt-1 max-w-2xl">
              Choose a focused skill exercise to build confidence, eliminate hesitation, and target specific areas of improvement.
            </p>
          </div>

          <div className="space-y-8">
            {/* Category 1: Build the Basics */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-color)]" />
                <h2 className="text-sm font-mono uppercase font-bold text-[#ECEBE4] tracking-wider">
                  Build the Basics
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DRILL_OPTIONS.filter((d) => d.category === 'basics').map((drill) => {
                  const Icon = drill.icon;
                  return (
                    <button
                      key={drill.id}
                      onClick={() => handleSelectDrill(drill.id)}
                      className="p-5 rounded-2xl bg-[#272824] border border-[#353630] hover:border-[var(--accent-color)] transition-all text-left group flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-9 h-9 rounded-xl bg-[#20211D] flex items-center justify-center text-[var(--accent-color)] mb-3 group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-[#ECEBE4] mb-1.5 group-hover:text-[var(--accent-color)] transition-colors">
                          {drill.title}
                        </h3>
                        <p className="text-xs text-[#989A92] leading-relaxed">
                          {drill.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#353630]/60 flex items-center justify-between text-xs font-mono text-[var(--accent-color)]">
                        <span>Start drill</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category 2: Improve Your Skills */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#5DBE76]" />
                <h2 className="text-sm font-mono uppercase font-bold text-[#ECEBE4] tracking-wider">
                  Improve Your Skills
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {DRILL_OPTIONS.filter((d) => d.category === 'skills').map((drill) => {
                  const Icon = drill.icon;
                  return (
                    <button
                      key={drill.id}
                      onClick={() => handleSelectDrill(drill.id)}
                      className="p-5 rounded-2xl bg-[#272824] border border-[#353630] hover:border-[#5DBE76] transition-all text-left group flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-9 h-9 rounded-xl bg-[#20211D] flex items-center justify-center text-[#5DBE76] mb-3 group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-[#ECEBE4] mb-1.5 group-hover:text-[#5DBE76] transition-colors">
                          {drill.title}
                        </h3>
                        <p className="text-xs text-[#989A92] leading-relaxed">
                          {drill.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#353630]/60 flex items-center justify-between text-xs font-mono text-[#5DBE76]">
                        <span>Start drill</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category 3: Personal Practice */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <h2 className="text-sm font-mono uppercase font-bold text-[#ECEBE4] tracking-wider">
                  Personal Practice &amp; Code
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Custom Text option */}
                <button
                  onClick={() => handleSelectDrill('custom')}
                  className="p-5 rounded-2xl bg-[#272824] border border-[#353630] hover:border-purple-400 transition-all text-left group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#20211D] flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-[#ECEBE4] mb-1.5 group-hover:text-purple-400 transition-colors">
                      Custom Text
                    </h3>
                    <p className="text-xs text-[#989A92] leading-relaxed">
                      Practise using text you choose or paste into the runner.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#353630]/60 flex items-center justify-between text-xs font-mono text-purple-400">
                    <span>Open custom runner</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Saved Passages */}
                <button
                  onClick={() => handleSelectDrill('passages')}
                  className="p-5 rounded-2xl bg-[#272824] border border-[#353630] hover:border-purple-400 transition-all text-left group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#20211D] flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-[#ECEBE4] mb-1.5 group-hover:text-purple-400 transition-colors">
                      Saved Passages
                    </h3>
                    <p className="text-xs text-[#989A92] leading-relaxed">
                      Practise literature, philosophy, and speech excerpts.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#353630]/60 flex items-center justify-between text-xs font-mono text-purple-400">
                    <span>Practise passage</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Programming Text -> Developer Lab */}
                <button
                  onClick={() => navigate('/developer-lab')}
                  className="p-5 rounded-2xl bg-[#272824] border border-[#353630] hover:border-purple-400 transition-all text-left group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#20211D] flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-[#ECEBE4] mb-1.5 group-hover:text-purple-400 transition-colors">
                      Programming Text
                    </h3>
                    <p className="text-xs text-[#989A92] leading-relaxed">
                      Train on TypeScript, Python, JSX, SQL, Rust, Bash, and symbols.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#353630]/60 flex items-center justify-between text-xs font-mono text-purple-400">
                    <span>Open Developer Lab</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
