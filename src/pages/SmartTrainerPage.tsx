import React, { useState, useEffect, useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useToast } from '../context/ToastContext';
import { TypingEngine } from '../components/typing/TypingEngine';
import { ResultsView } from '../components/typing/ResultsView';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TestResult } from '../types/typing';
import { generateWeakKeyWords, generateWords } from '../data/wordLists';
import {
  BrainCircuit,
  Sparkles,
  Zap,
  Target,
  Layers,
  Activity,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

type TrainerModule = 'weak-keys' | 'home-row' | 'digraphs' | 'rhythm' | 'symbols';

const COMMON_DIGRAPHS = [
  'that then them their there this with they the',
  'here where were there hero other another whether',
  'into line fine mind find kind ring sing thing',
  'water paper later player letter under over after',
  'and land hand stand sand plan plant than demand',
  'great read ready real reason reach clear year',
  'need seed feed speed weed bleed breed freed',
  'only one once upon bone stone lone alone phone',
  'best rest test west nest chest guest quest fast',
  'stop step stand state start still story style',
];

const HOME_ROW_DRILLS = [
  'asdf jkl; asdf jkl; aadd ssff jjkk ll;; fall glad flask salad',
  'ask dads fall glad flask salad dash flash alfalfa slash gala',
  'half glad asks falls flash salads fall flask dads gala alfalfa',
  'all falls salads flasks slash glad alfalfa flash dads ask gala',
];

const SYMBOL_DRILLS = [
  'item: (value + 1); result = [a, b]; "quote" & \'test\'; x -> y;',
  '{ key: "data", active: true }; count = (x > y ? 1 : 0); status = 200;',
  'for (let i = 0; i < len; i++) { items[i] = (v * 2); }; return items;',
];

export const SmartTrainerPage: React.FC = () => {
  const { weakKeys, results, averageAccuracy, averageWpm, totalTests, addTestResult } = useProgress();
  const { toast } = useToast();

  const [activeModule, setActiveModule] = useState<TrainerModule>('weak-keys');
  const [drillLength, setDrillLength] = useState<15 | 30 | 50>(30);
  const [currentText, setCurrentText] = useState('');
  const [activeResult, setActiveResult] = useState<TestResult | null>(null);
  const [engineKey, setEngineKey] = useState(0);

  // Top weak keys sorted by error frequency
  const sortedWeakKeys = useMemo(() => {
    return Object.entries(weakKeys)
      .sort((a, b) => b[1] - a[1])
      .map(([k, count]) => ({ key: k, count }))
      .slice(0, 8);
  }, [weakKeys]);

  // Generate drill text based on module
  const generateDrill = () => {
    let text = '';
    const wordTarget = drillLength;

    switch (activeModule) {
      case 'weak-keys': {
        const targetKeys = sortedWeakKeys.length > 0
          ? sortedWeakKeys.map((w) => w.key)
          : ['q', 'z', 'p', 'b', 'x'];
        text = generateWeakKeyWords(targetKeys, wordTarget);
        break;
      }
      case 'home-row': {
        const pool = [...HOME_ROW_DRILLS];
        const selected = pool[Math.floor(Math.random() * pool.length)];
        const words = selected.split(' ');
        const repeated: string[] = [];
        while (repeated.length < wordTarget) {
          repeated.push(words[repeated.length % words.length]);
        }
        text = repeated.join(' ');
        break;
      }
      case 'digraphs': {
        const shuffled = [...COMMON_DIGRAPHS].sort(() => 0.5 - Math.random());
        const combined = shuffled.join(' ').split(' ');
        text = combined.slice(0, wordTarget).join(' ');
        break;
      }
      case 'rhythm': {
        // High frequency rhythmic words with balanced syllables
        text = generateWords({ count: wordTarget, difficulty: 'beginner' });
        break;
      }
      case 'symbols': {
        const pool = [...SYMBOL_DRILLS];
        const selected = pool[Math.floor(Math.random() * pool.length)];
        text = selected;
        break;
      }
      default:
        text = generateWords({ count: wordTarget });
    }

    setCurrentText(text);
    setActiveResult(null);
    setEngineKey((k) => k + 1);
  };

  useEffect(() => {
    generateDrill();
  }, [activeModule, drillLength]);

  const handleTestComplete = (rawResult: Omit<TestResult, 'isPersonalBest'>) => {
    const { result, isPersonalBest } = addTestResult(rawResult);
    setActiveResult(result);
    if (isPersonalBest) {
      toast.success('New Personal Best speed achieved in Smart Trainer!');
    } else {
      toast.info('Smart Trainer workout session completed!');
    }
  };

  const modules = [
    {
      id: 'weak-keys' as TrainerModule,
      title: 'Targeted Key Eradication',
      desc: 'Builds words around your exact recorded mistypes to dissolve hesitation.',
      icon: Target,
      badge: sortedWeakKeys.length > 0 ? `${sortedWeakKeys.length} Weak Keys` : 'Algorithmic',
      badgeVariant: 'amber' as const,
    },
    {
      id: 'home-row' as TrainerModule,
      title: 'Home-Row Anchor & Independence',
      desc: 'Isolates ASDF JKL; to anchor your muscle memory and eliminate drift.',
      icon: Layers,
      badge: 'Posture',
      badgeVariant: 'green' as const,
    },
    {
      id: 'digraphs' as TrainerModule,
      title: 'High-Frequency Digraphs',
      desc: 'Drills the 10 most common English transitions: th, he, in, er, an, re, ed.',
      icon: TrendingUp,
      badge: 'Speed Flow',
      badgeVariant: 'blue' as const,
    },
    {
      id: 'rhythm' as TrainerModule,
      title: 'Rhythmic Cadence Sprints',
      desc: 'Evenly balanced words designed to stabilize keystroke consistency.',
      icon: Activity,
      badge: 'Consistency',
      badgeVariant: 'orange' as const,
    },
    {
      id: 'symbols' as TrainerModule,
      title: 'Punctuation & Syntax Control',
      desc: 'Train muscle memory for brackets, quotes, semicolons, and operators.',
      icon: Zap,
      badge: 'Precision',
      badgeVariant: 'gray' as const,
    },
  ];

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="amber" size="sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Adaptive AI Gym
          </Badge>
          <span className="text-xs font-mono text-[#989A92]">
            Based on {totalTests} completed sessions
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4] flex items-center gap-3">
          <BrainCircuit className="w-7 h-7 text-[#E6C76B]" />
          <span>Smart Adaptive Trainer</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#989A92] mt-1 max-w-2xl">
          Diagnoses your real keystroke error patterns, detects micro-stutters, and dynamically generates customized training drills to boost speed and precision.
        </p>
      </div>

      {/* Diagnostics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Diagnostic 1: Error Hotspots */}
        <div className="p-4 rounded-2xl bg-[#272824] border border-[#353630]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#989A92] uppercase font-semibold">
              Error Hotspots
            </span>
            <Target className="w-4 h-4 text-[#E6C76B]" />
          </div>
          {sortedWeakKeys.length > 0 ? (
            <div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {sortedWeakKeys.map((item) => (
                  <span
                    key={item.key}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 font-mono text-xs font-bold"
                  >
                    {item.key.toUpperCase()}
                    <span className="text-[10px] opacity-75 font-normal">({item.count})</span>
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-[#7E8079]">
                These keys trigger the highest hesitation and mistypes in your tests.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero chronic error keys</span>
              </div>
              <p className="text-[11px] text-[#7E8079]">
                Take more standard tests to help the trainer map your finger tendencies.
              </p>
            </div>
          )}
        </div>

        {/* Diagnostic 2: Accuracy Health */}
        <div className="p-4 rounded-2xl bg-[#272824] border border-[#353630]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#989A92] uppercase font-semibold">
              Accuracy Baseline
            </span>
            <Activity className="w-4 h-4 text-[#5DBE76]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#ECEBE4] mb-1">
            {averageAccuracy > 0 ? `${averageAccuracy}%` : '—'}
          </div>
          <p className="text-[11px] text-[#7E8079]">
            {averageAccuracy >= 96
              ? 'Excellent motor control. Focus on building burst speed.'
              : averageAccuracy >= 90
              ? 'Good baseline. Slow down slightly on transitions to reach 97%+.'
              : 'Accuracy prioritized. Strive for 95%+ before speeding up.'}
          </p>
        </div>

        {/* Diagnostic 3: Speed Benchmark */}
        <div className="p-4 rounded-2xl bg-[#272824] border border-[#353630]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#989A92] uppercase font-semibold">
              Average Velocity
            </span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#E6C76B] mb-1">
            {averageWpm > 0 ? `${averageWpm} WPM` : '—'}
          </div>
          <p className="text-[11px] text-[#7E8079]">
            Target: {Math.max(40, Math.round((averageWpm || 30) * 1.15))} WPM with consistent rhythm and &lt; 2 mistakes per minute.
          </p>
        </div>
      </div>

      {/* Module Selector Cards */}
      <div className="mb-6">
        <label className="block text-xs font-mono text-[#989A92] uppercase font-semibold mb-3">
          Select Targeted Workout Routine
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((m) => {
            const Icon = m.icon;
            const isSelected = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={`p-4 rounded-2xl text-left transition-all duration-150 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#272824] border-[#E6C76B] shadow-sm'
                    : 'bg-[#20211D] border-[#353630] hover:border-[#7E8079] hover:bg-[#272824]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected ? 'bg-[#E6C76B] text-[#20211D]' : 'bg-[#272824] text-[#E6C76B]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#ECEBE4]">{m.title}</span>
                    </div>
                    <Badge variant={m.badgeVariant} size="xs">
                      {m.badge}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#989A92] leading-relaxed mt-1">
                    {m.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#272824] border border-[#353630] mb-6 text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className="text-[#989A92]">Drill Length:</span>
          {([15, 30, 50] as const).map((len) => (
            <button
              key={len}
              onClick={() => setDrillLength(len)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                drillLength === len
                  ? 'bg-[#20211D] text-[#E6C76B] font-bold border border-[#353630]'
                  : 'text-[#989A92] hover:text-[#ECEBE4]'
              }`}
            >
              {len} words
            </button>
          ))}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={generateDrill}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Regenerate Drill
        </Button>
      </div>

      {/* Interactive Typing Engine / Results */}
      {currentText && (
        <div className="bg-[#272824]/60 border border-[#353630] rounded-2xl p-6 sm:p-8">
          {activeResult ? (
            <ResultsView
              result={activeResult}
              onRetry={generateDrill}
              onNextTest={generateDrill}
            />
          ) : (
            <TypingEngine
              key={engineKey}
              initialText={currentText}
              mode="custom"
              onComplete={handleTestComplete}
              onRestart={generateDrill}
            />
          )}
        </div>
      )}
    </div>
  );
};
