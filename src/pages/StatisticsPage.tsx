import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useToast } from '../context/ToastContext';
import { formatDuration, formatDate, formatDateTime } from '../utils/metrics';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Target,
  Clock,
  Flame,
  BookOpen,
  AlertTriangle,
  Play,
  Calendar,
  CheckCircle2,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

type TimeRange = '7d' | '30d' | 'all';

export const StatisticsPage: React.FC = () => {
  const {
    results,
    lessons,
    streak,
    weakKeys,
    allAchievements,
    unlockedAchievements,
    bestWpm,
    averageWpm,
    averageAccuracy,
    totalTests,
    totalTimeSeconds,
    deleteTestResult,
    clearAllHistory,
  } = useProgress();

  const { toast } = useToast();
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [historyLimit, setHistoryLimit] = useState<number>(15);
  const [clearHistoryModalOpen, setClearHistoryModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Filter results by range
  const filteredResults = useMemo(() => {
    if (timeRange === 'all') return results;
    const now = Date.now();
    const days = timeRange === '7d' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return results.filter((r) => r.timestamp >= cutoff);
  }, [results, timeRange]);

  // Chart data points in chronological order
  const chartData = useMemo(() => {
    return [...filteredResults]
      .reverse()
      .map((r, idx) => ({
        index: idx + 1,
        date: formatDate(r.timestamp),
        wpm: r.wpm,
        rawWpm: r.rawWpm,
        accuracy: r.accuracy,
      }));
  }, [filteredResults]);

  // Weak keys sorted
  const sortedWeakKeys = useMemo(() => {
    return Object.entries(weakKeys)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [weakKeys]);

  // Lessons completed
  const completedLessonsCount = Object.values(lessons).filter((l) => l.completed).length;
  const coursePercent = Math.round((completedLessonsCount / 15) * 100);

  // Handle single deletion
  const handleDeleteSingle = (id: string) => {
    deleteTestResult(id);
    toast.info('Session removed from history.');
    setItemToDelete(null);
  };

  // Handle clear all history
  const handleConfirmClearAll = () => {
    clearAllHistory();
    setClearHistoryModalOpen(false);
    toast.success('All typing history cleared.');
  };

  // Empty State if no tests taken yet
  if (totalTests === 0) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center justify-center text-center animate-fadeIn min-h-[500px]">
        <div className="w-16 h-16 rounded-2xl bg-[#272824] border border-[#353630] flex items-center justify-center text-[#E6C76B] mb-4">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4] mb-2 font-mono">
          No Typing History Yet
        </h1>
        <p className="text-xs sm:text-sm text-[#989A92] max-w-md mb-6 leading-relaxed font-sans">
          Complete your first typing test to unlock in-depth analytics, speed progression graphs, accuracy trends, and mistake breakdowns.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/')}
          leftIcon={<Play className="w-4 h-4 fill-current" />}
        >
          Start Typing Now
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 animate-fadeIn pb-12">
      {/* Header with Time Filter */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4]">
            Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#989A92] mt-0.5">
            Verified performance metrics derived from your actual typing sessions.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#272824] border border-[#353630] text-xs font-mono">
          {(['7d', '30d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all duration-150 ${
                timeRange === range
                  ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                  : 'text-[#989A92] hover:text-[#ECEBE4]'
              }`}
            >
              {range === 'all' ? 'All Time' : range === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[#272824] border border-[#353630]">
          <span className="text-[10px] font-mono text-[#989A92] uppercase block">Best WPM</span>
          <div className="text-3xl font-bold font-mono text-[#E6C76B] my-1">{bestWpm}</div>
          <span className="text-[10px] text-[#7E8079]">All-time peak</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#272824] border border-[#353630]">
          <span className="text-[10px] font-mono text-[#989A92] uppercase block">Avg WPM</span>
          <div className="text-3xl font-bold font-mono text-[#ECEBE4] my-1">{averageWpm}</div>
          <span className="text-[10px] text-[#7E8079]">Across all tests</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#272824] border border-[#353630]">
          <span className="text-[10px] font-mono text-[#989A92] uppercase block">Accuracy</span>
          <div className="text-3xl font-bold font-mono text-[#5DBE76] my-1">{averageAccuracy}%</div>
          <span className="text-[10px] text-[#7E8079]">Average precision</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#272824] border border-[#353630]">
          <span className="text-[10px] font-mono text-[#989A92] uppercase block">Total Tests</span>
          <div className="text-3xl font-bold font-mono text-[#ECEBE4] my-1">{totalTests}</div>
          <span className="text-[10px] text-[#7E8079]">Completed</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#272824] border border-[#353630]">
          <span className="text-[10px] font-mono text-[#989A92] uppercase block">Practice Time</span>
          <div className="text-2xl font-bold font-mono text-[#ECEBE4] my-1">
            {formatDuration(totalTimeSeconds)}
          </div>
          <span className="text-[10px] text-[#7E8079]">Active typing</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#272824] border border-[#353630]">
          <span className="text-[10px] font-mono text-[#989A92] uppercase block">Streak</span>
          <div className="text-3xl font-bold font-mono text-orange-400 my-1 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-orange-400" />
            <span>{streak.currentStreak}d</span>
          </div>
          <span className="text-[10px] text-[#7E8079]">Best: {streak.longestStreak} days</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* WPM Trend Chart */}
        <div className="p-5 rounded-2xl bg-[#272824] border border-[#353630]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#E6C76B]" />
              <span>Speed Progression (WPM)</span>
            </h2>
            <span className="text-xs font-mono text-[#989A92]">
              {chartData.length} tests plotted
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="index" stroke="var(--subtext-color)" tick={{ fontSize: 11, fill: 'var(--subtext-color)' }} />
                <YAxis stroke="var(--subtext-color)" tick={{ fontSize: 11, fill: 'var(--subtext-color)' }} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-color)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-color)',
                  }}
                  formatter={(val: any) => [`${val} WPM`, 'Speed']}
                />
                <Area
                  type="monotone"
                  dataKey="wpm"
                  stroke="var(--accent-color)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#wpmGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Trend Chart */}
        <div className="p-5 rounded-2xl bg-[#272824] border border-[#353630]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#5DBE76]" />
              <span>Accuracy Consistency (%)</span>
            </h2>
            <span className="text-xs font-mono text-[#989A92]">
              Avg: {averageAccuracy}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#353630" vertical={false} />
                <XAxis dataKey="index" stroke="#7E8079" tick={{ fontSize: 11, fill: '#7E8079' }} />
                <YAxis
                  stroke="#7E8079"
                  tick={{ fontSize: 11, fill: '#7E8079' }}
                  domain={[70, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181915',
                    borderColor: '#353630',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#ECEBE4',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Accuracy']}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#5DBE76"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#5DBE76' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row: Academy Course Progress + Mistake Review */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Academy Progress */}
        <div className="p-5 rounded-2xl bg-[#272824] border border-[#353630] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#E6C76B]" />
                <span>Academy Curriculum Progress</span>
              </h2>
              <Link to="/learn" className="text-xs font-mono text-[#E6C76B] hover:underline">
                Go to lessons &rarr;
              </Link>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#989A92] mb-2">
              <span>{completedLessonsCount} of 15 Lessons Completed</span>
              <span className="font-bold text-[#ECEBE4]">{coursePercent}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-[#20211D] border border-[#353630] overflow-hidden mb-4">
              <div
                className="h-full bg-[#E6C76B] transition-all duration-300 rounded-full"
                style={{ width: `${coursePercent}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-[#989A92] leading-relaxed font-sans">
            Complete all 15 lessons to master the home row, vertical stretches, shift technique, and punctuation.
          </p>
        </div>

        {/* Mistake Hotspots */}
        <div className="p-5 rounded-2xl bg-[#272824] border border-[#353630] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E55858]" />
                <span>Frequently Mistyped Keys</span>
              </h2>
              <Link to="/practice" className="text-xs font-mono text-[#E6C76B] hover:underline">
                Targeted drills &rarr;
              </Link>
            </div>

            {sortedWeakKeys.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {sortedWeakKeys.map(([char, count]) => (
                  <div
                    key={char}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#20211D] border border-[#353630] font-mono text-xs"
                  >
                    <span className="font-bold text-[#E55858] text-sm">
                      {char === ' ' ? 'SPACE' : char}
                    </span>
                    <span className="text-[#989A92]">{count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#989A92] font-sans mb-4">
                No recurring error patterns logged yet. Take more typing tests to populate weak keys.
              </p>
            )}
          </div>

          {sortedWeakKeys.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => navigate('/trainer')}
                leftIcon={<Zap className="w-3.5 h-3.5 text-[#E6C76B]" />}
              >
                Smart Trainer
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/practice')}
              >
                Practice Drills
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Achievements Showcase */}
      <div className="p-5 rounded-2xl bg-[#272824] border border-[#353630] mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#E6C76B]" />
            <span>Achievements ({unlockedAchievements.length} / {allAchievements.length})</span>
          </h2>
          <Link
            to="/achievements"
            className="text-xs font-mono text-[#E6C76B] hover:underline flex items-center gap-1"
          >
            <span>View All &amp; Details</span> &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allAchievements.map((ach) => {
            const unlocked = unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  unlocked
                    ? 'bg-[#20211D] border-[#E6C76B]/40 shadow-xs'
                    : 'bg-[#20211D]/40 border-[#30312B] opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#ECEBE4] font-mono">
                    {ach.title}
                  </span>
                  {unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-[#5DBE76]" />
                  ) : (
                    <span className="text-[10px] font-mono text-[#7E8079]">Locked</span>
                  )}
                </div>
                <p className="text-[11px] text-[#989A92] leading-tight font-sans">
                  {ach.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Test History Table */}
      <div className="p-5 rounded-2xl bg-[#272824] border border-[#353630]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E6C76B]" />
            <span>Recent Test History</span>
          </h2>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#989A92]">
              <span>Show:</span>
              {[15, 30, 50].map((l) => (
                <button
                  key={l}
                  onClick={() => setHistoryLimit(l)}
                  className={`px-2 py-0.5 rounded-lg ${historyLimit === l ? 'bg-[#20211D] text-[#E6C76B] font-bold' : 'hover:text-[#ECEBE4]'}`}
                >
                  {l}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="xs"
              onClick={() => setClearHistoryModalOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
            >
              Clear All
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#353630] text-[#7E8079]">
                <th className="pb-2">Date</th>
                <th className="pb-2">Mode</th>
                <th className="pb-2">WPM</th>
                <th className="pb-2">Raw</th>
                <th className="pb-2">Accuracy</th>
                <th className="pb-2">Duration</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30312B]">
              {results.slice(0, historyLimit).map((r) => (
                <tr key={r.id} className="hover:bg-[#20211D]/40 transition-colors">
                  <td className="py-2.5 text-[#989A92]">{formatDateTime(r.timestamp)}</td>
                  <td className="py-2.5 text-[#ECEBE4] capitalize">{r.mode}</td>
                  <td className="py-2.5 font-bold text-[#E6C76B]">{r.wpm}</td>
                  <td className="py-2.5 text-[#989A92]">{r.rawWpm}</td>
                  <td className="py-2.5 text-[#5DBE76] font-semibold">{r.accuracy}%</td>
                  <td className="py-2.5 text-[#989A92]">{formatDuration(r.durationSeconds)}</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => setItemToDelete(r.id)}
                      className="p-1 rounded-md text-[#7E8079] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete this record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear All Modal Confirmation */}
      <Modal
        isOpen={clearHistoryModalOpen}
        onClose={() => setClearHistoryModalOpen(false)}
        title="Clear All Typing History?"
        description="This will permanently remove all saved test sessions and timeline records from this device. Achievements and academy lesson stars will be preserved."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setClearHistoryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmClearAll}>
              Yes, Clear History
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#989A92]">
          Are you sure you want to proceed? This operation cannot be undone.
        </p>
      </Modal>

      {/* Delete Single Item Modal Confirmation */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        title="Remove Session Record?"
        description="Are you sure you want to delete this specific test result from your local history?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => itemToDelete && handleDeleteSingle(itemToDelete)}
            >
              Delete Record
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#989A92]">
          This record will be permanently deleted from your statistics.
        </p>
      </Modal>
    </div>
  );
};
