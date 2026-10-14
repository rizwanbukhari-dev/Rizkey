import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  Play,
  BarChart3,
  Trophy,
  Target,
  Clock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TestResult } from '../../types/typing';
import { formatDuration, calculateConsistency } from '../../utils/metrics';

interface ResultsViewProps {
  result: TestResult;
  onRetry: () => void;
  onNextTest: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  onRetry,
  onNextTest,
}) => {
  const {
    wpm,
    rawWpm,
    accuracy,
    charStats,
    durationSeconds,
    mode,
    timeline,
    mistakes,
    isPersonalBest,
  } = result;

  // Keyboard shortcut listener for Tab -> Next test
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        onNextTest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextTest]);

  const consistency = calculateConsistency(timeline.map((t) => t.wpm));

  // Mistakes sorted by count descending
  const mistakeEntries = Object.entries(mistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 animate-fadeIn">
      {/* Header with Personal Best Notification */}
      {isPersonalBest && (
        <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6C76B]/15 border border-[#E6C76B]/40 text-[#E6C76B] text-xs font-mono font-medium animate-bounce">
          <Trophy className="w-4 h-4" />
          <span>New Personal Best! Congratulations!</span>
        </div>
      )}

      {/* Main Big Stats Hero */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Net WPM */}
        <div className="bg-[#272824] border border-[#353630] rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs font-mono text-[#989A92] uppercase tracking-wider">
            Net WPM
          </span>
          <div className="text-5xl md:text-6xl font-bold font-mono text-[#E6C76B] my-2">
            {wpm}
          </div>
          <div className="text-xs text-[#989A92] flex items-center gap-1 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#E6C76B]" />
            <span>Raw: {rawWpm} WPM</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-[#272824] border border-[#353630] rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs font-mono text-[#989A92] uppercase tracking-wider">
            Accuracy
          </span>
          <div className="text-5xl md:text-6xl font-bold font-mono text-[#5DBE76] my-2">
            {accuracy}%
          </div>
          <div className="text-xs text-[#989A92] flex items-center gap-1 font-mono">
            <Target className="w-3.5 h-3.5 text-[#5DBE76]" />
            <span>Consistency: {consistency}%</span>
          </div>
        </div>

        {/* Character Breakdown */}
        <div className="bg-[#272824] border border-[#353630] rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs font-mono text-[#989A92] uppercase tracking-wider">
            Characters
          </span>
          <div className="font-mono text-2xl font-semibold text-[#ECEBE4] my-2 flex items-baseline gap-1.5">
            <span className="text-[#5DBE76]">{charStats.correct}</span>
            <span className="text-[#989A92] text-sm">/</span>
            <span className="text-[#E55858]">{charStats.incorrect}</span>
            <span className="text-[#989A92] text-sm">/</span>
            <span className="text-[#989A92] text-sm">{charStats.extra || 0}</span>
          </div>
          <span className="text-xs text-[#989A92] font-mono">
            correct / errors / extra
          </span>
        </div>

        {/* Test Details */}
        <div className="bg-[#272824] border border-[#353630] rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs font-mono text-[#989A92] uppercase tracking-wider">
            Test Details
          </span>
          <div className="text-2xl font-bold font-mono text-[#ECEBE4] my-2 capitalize">
            {mode} mode
          </div>
          <div className="text-xs text-[#989A92] flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Duration: {formatDuration(durationSeconds)}</span>
          </div>
        </div>
      </div>

      {/* WPM & Error Timeline Chart */}
      {timeline.length > 1 && (
        <div className="bg-[#272824] border border-[#353630] rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#E6C76B]" />
              <span>Speed & Consistency Timeline</span>
            </h2>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#E6C76B]" />
                <span className="text-[#989A92]">WPM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#5DBE76]/70" />
                <span className="text-[#989A92]">Raw</span>
              </div>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#353630" vertical={false} />
                <XAxis
                  dataKey="second"
                  stroke="#7E8079"
                  tick={{ fontSize: 11, fill: '#7E8079' }}
                  tickFormatter={(val) => `${val}s`}
                />
                <YAxis
                  stroke="#7E8079"
                  tick={{ fontSize: 11, fill: '#7E8079' }}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#20211D',
                    borderColor: '#353630',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#ECEBE4',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} wpm`,
                    name === 'wpm' ? 'Net WPM' : 'Raw WPM',
                  ]}
                  labelFormatter={(lbl) => `Second: ${lbl}s`}
                />
                <Line
                  type="monotone"
                  dataKey="rawWpm"
                  stroke="#5DBE76"
                  strokeWidth={1.5}
                  dot={false}
                  opacity={0.6}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="var(--accent-color)"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: 'var(--accent-color)' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mistake Review */}
      {mistakeEntries.length > 0 && (
        <div className="bg-[#272824] border border-[#353630] rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E55858]" />
              <span>Mistake Analysis (Frequently Missed Keys)</span>
            </h2>
            <Link
              to="/practice"
              className="text-xs font-mono text-[#E6C76B] hover:underline"
            >
              Practice weak keys &rarr;
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {mistakeEntries.map(([char, count]) => (
              <div
                key={char}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#20211D] border border-[#353630] font-mono text-xs"
              >
                <span className="font-bold text-[#E55858] text-sm">
                  {char === ' ' ? 'SPACE' : char}
                </span>
                <span className="text-[#989A92]">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#272824] hover:bg-[#32332B] text-[#ECEBE4] border border-[#353630] font-mono text-sm font-medium transition-colors"
          title="Restart same test"
        >
          <RotateCcw className="w-4 h-4 text-[#989A92]" />
          <span>Retry</span>
        </button>

        <button
          onClick={onNextTest}
          autoFocus
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E6C76B] hover:bg-[#F0D47C] text-[#20211D] font-mono text-sm font-bold shadow-md transition-all hover:scale-105"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Next Test (Tab)</span>
        </button>

        <Link
          to="/statistics"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#272824] hover:bg-[#32332B] text-[#989A92] hover:text-[#ECEBE4] border border-[#353630] font-mono text-sm font-medium transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span>All Statistics</span>
        </Link>
      </div>
    </div>
  );
};
