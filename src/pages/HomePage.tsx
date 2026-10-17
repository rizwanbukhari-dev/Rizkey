import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InstallButton } from '../components/common/InstallButton';
import { storage } from '../utils/storage';
import { formatDuration } from '../utils/metrics';
import {
  Keyboard,
  BookOpen,
  Target,
  BrainCircuit,
  Flame,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Calendar,
} from 'lucide-react';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    results,
    totalTests,
    bestWpm,
    averageWpm,
    averageAccuracy,
    streak,
    lessons,
  } = useProgress();

  const completedLessons = Object.values(lessons).filter((l) => l.completed).length;

  // Real today activity from storage
  const todayStr = getTodayDateString();
  const allActivities = storage.getDailyActivities();
  const todayData = allActivities[todayStr] || { count: 0, practiceSeconds: 0 };
  const dailyGoalTarget = 3; // 3 tests per day goal
  const dailyProgressPercent = Math.min(100, Math.round((todayData.count / dailyGoalTarget) * 100));

  // Determine next lesson to recommend
  const nextLessonId = Math.min(15, completedLessons + 1);

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 animate-fadeIn pb-16 min-w-0">
      {/* 1. Welcome Hero Section */}
      <div className="text-center py-6 sm:py-10 mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Badge variant="amber" size="sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Find your rhythm. Master your keys.
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#ECEBE4] mb-4">
          Effortless Touch Typing Mastery
        </h1>

        <p className="text-sm sm:text-base text-[#989A92] max-w-2xl mx-auto leading-relaxed mb-8">
          Build natural muscle memory, eliminate keyboard hesitation, and double your typing speed with clean, distraction-free practice.
        </p>

        {/* Primary Call-to-Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/test')}
            leftIcon={<Keyboard className="w-4 h-4 fill-current" />}
            className="shadow-lg"
          >
            Start Typing Test
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/learn')}
            leftIcon={<BookOpen className="w-4 h-4 text-[#E6C76B]" />}
          >
            {completedLessons > 0
              ? `Continue Course (Lesson ${nextLessonId})`
              : 'Explore Touch Typing Academy'}
          </Button>
        </div>
      </div>

      {/* 2. Today's Practice Target & Real Progress Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Today's Goal Card */}
        <div className="p-5 rounded-2xl bg-[#272824] border border-[#353630] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#989A92] uppercase font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E6C76B]" />
                <span>Today's Target</span>
              </span>
              <span className="text-xs font-mono font-bold text-[#ECEBE4]">
                {todayData.count} / {dailyGoalTarget} tests
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-[#20211D] border border-[#353630] overflow-hidden my-3">
              <div
                className="h-full bg-[var(--accent-color)] rounded-full transition-all duration-500"
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>

            <p className="text-xs text-[#7E8079]">
              {todayData.count >= dailyGoalTarget
                ? 'Daily goal achieved! Great dedication to consistent muscle memory.'
                : `${dailyGoalTarget - todayData.count} more session${dailyGoalTarget - todayData.count > 1 ? 's' : ''} to reach today's recommended rhythm.`}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-[#353630]/60 flex items-center justify-between text-xs font-mono text-[#989A92]">
            <span>Today's practice time:</span>
            <span className="text-[#ECEBE4] font-bold">{formatDuration(todayData.practiceSeconds)}</span>
          </div>
        </div>

        {/* Real Progress Stats Summary */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-[#272824] border border-[#353630] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#353630]">
            <span className="text-xs font-mono text-[#989A92] uppercase font-semibold">
              Real Performance Snapshot
            </span>
            <Link
              to="/statistics"
              className="text-xs font-mono text-[var(--accent-color)] hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="p-3 rounded-xl bg-[#20211D] border border-[#353630]">
              <span className="text-[10px] text-[#989A92] uppercase block">Best Speed</span>
              <div className="text-2xl font-bold text-[var(--accent-color)] mt-0.5">
                {bestWpm > 0 ? `${bestWpm} WPM` : '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#20211D] border border-[#353630]">
              <span className="text-[10px] text-[#989A92] uppercase block">Average Speed</span>
              <div className="text-2xl font-bold text-[#ECEBE4] mt-0.5">
                {averageWpm > 0 ? `${averageWpm} WPM` : '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#20211D] border border-[#353630]">
              <span className="text-[10px] text-[#989A92] uppercase block">Accuracy</span>
              <div className="text-2xl font-bold text-[#5DBE76] mt-0.5">
                {averageAccuracy > 0 ? `${averageAccuracy}%` : '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#20211D] border border-[#353630]">
              <span className="text-[10px] text-[#989A92] uppercase block">Current Streak</span>
              <div className="text-2xl font-bold text-orange-400 mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-orange-400" />
                <span>{streak.currentStreak}d</span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-[#7E8079] flex items-center justify-between">
            <span>{totalTests} total test sessions recorded</span>
            <span>{completedLessons} of 15 academy lessons mastered</span>
          </div>
        </div>
      </div>

      {/* 3. Four Core Destination Pathways */}
      <div className="mb-8">
        <h2 className="text-xs font-mono uppercase font-semibold text-[#989A92] mb-3">
          Explore Learning &amp; Training Modes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Typing Test */}
          <Link
            to="/test"
            className="p-5 rounded-2xl bg-[#272824] border border-[#353630] hover:border-[var(--accent-color)] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#20211D] flex items-center justify-center text-[var(--accent-color)] mb-3 group-hover:scale-105 transition-transform">
                <Keyboard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#ECEBE4] mb-1 group-hover:text-[var(--accent-color)] transition-colors">
                Typing Test
              </h3>
              <p className="text-xs text-[#989A92] leading-relaxed">
                Clean, distraction-free speed test with customizable timer, word count, and real-time WPM graphs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#353630]/60 flex items-center justify-between text-xs font-mono text-[var(--accent-color)]">
              <span>Start test</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Practice Center */}
          <Link
            to="/practice"
            className="p-5 rounded-2xl bg-[#272824] border border-[#353630] hover:border-[var(--accent-color)] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#20211D] flex items-center justify-center text-[#5DBE76] mb-3 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#ECEBE4] mb-1 group-hover:text-[#5DBE76] transition-colors">
                Practice Center
              </h3>
              <p className="text-xs text-[#989A92] leading-relaxed">
                Structured categories: letters, common words, sentences, punctuation, and accuracy boosters.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#353630]/60 flex items-center justify-between text-xs font-mono text-[#5DBE76]">
              <span>Choose drill</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Training Academy */}
          <Link
            to="/learn"
            className="p-5 rounded-2xl bg-[#272824] border border-[#353630] hover:border-[var(--accent-color)] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#20211D] flex items-center justify-center text-sky-400 mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#ECEBE4] mb-1 group-hover:text-sky-400 transition-colors">
                Guided Academy
              </h3>
              <p className="text-xs text-[#989A92] leading-relaxed">
                8-stage guided curriculum from proper posture and home-row anchors to high-speed assessment.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#353630]/60 flex items-center justify-between text-xs font-mono text-sky-400">
              <span>View stages</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Smart Trainer */}
          <Link
            to="/smart-trainer"
            className="p-5 rounded-2xl bg-[#272824] border border-[#353630] hover:border-[var(--accent-color)] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#20211D] flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#ECEBE4] mb-1 group-hover:text-purple-400 transition-colors">
                Smart Trainer
              </h3>
              <p className="text-xs text-[#989A92] leading-relaxed">
                Algorithmic gym diagnosing your real mistypes, finger hesitation, and generating custom drills.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#353630]/60 flex items-center justify-between text-xs font-mono text-purple-400">
              <span>Adaptive gym</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Recent Activity or First-Time Onboarding */}
      <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630]">
        <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2 mb-4 pb-2 border-b border-[#353630]">
          <TrendingUp className="w-4 h-4 text-[var(--accent-color)]" />
          <span>{totalTests > 0 ? 'Recent Test Activity' : 'Getting Started with Touch Typing'}</span>
        </h2>

        {totalTests > 0 ? (
          <div className="space-y-3 font-mono text-xs">
            <div className="divide-y divide-[#353630]">
              {results.slice(0, 3).map((res) => (
                <div key={res.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Badge variant={res.isPersonalBest ? 'amber' : 'gray'} size="xs">
                      {res.mode}
                    </Badge>
                    <span className="text-[#ECEBE4] font-bold">{res.wpm} WPM</span>
                    <span className="text-[#989A92]">({res.accuracy}% acc)</span>
                  </div>

                  <span className="text-[#7E8079]">
                    {new Date(res.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                to="/statistics"
                className="text-xs font-mono text-[var(--accent-color)] hover:underline flex items-center gap-1"
              >
                <span>View all {totalTests} sessions in history</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Onboarding State for New Users */
          <div className="space-y-3 text-xs leading-relaxed text-[#989A92]">
            <p className="text-[#ECEBE4] font-medium">
              Welcome to RizKey! To build rapid typing without looking at the keys, follow these golden rules:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-[#7E8079] font-mono">
              <li>Feel the raised bumps on <strong className="text-[#ECEBE4]">F</strong> and <strong className="text-[#ECEBE4]">J</strong> with your index fingers.</li>
              <li>Always return your fingers to the home row after reaching for any key.</li>
              <li>Focus 100% on <strong className="text-[#5DBE76]">accuracy</strong> first; natural speed follows automatically.</li>
            </ol>
            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={() => navigate('/test')}>
                Take Your First 30-Second Benchmark
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* PWA App Installation Feature Banner */}
      <InstallButton variant="card" className="mt-8" />
    </div>
  );
};
