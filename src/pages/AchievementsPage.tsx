import React, { useState, useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Badge } from '../components/ui/Badge';
import { Achievement } from '../types/typing';
import {
  Trophy,
  Award,
  Lock,
  CheckCircle2,
  Search,
  Sparkles,
  Zap,
  Target,
  Flame,
  BookOpen,
  Gamepad2,
} from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const {
    allAchievements,
    unlockedAchievements,
    bestWpm,
    totalTests,
    streak,
    lessons,
    results,
    gameScores,
  } = useProgress();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const completedLessonsCount = Object.values(lessons).filter((l) => l.completed).length;
  const unlockedCount = unlockedAchievements.length;
  const totalCount = allAchievements.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Compute live progress towards individual locked achievements
  const getProgressInfo = (ach: Achievement): { current: number; max: number; label: string } | null => {
    switch (ach.id) {
      case 'first_test':
        return { current: Math.min(1, totalTests), max: 1, label: `${totalTests} / 1 test` };
      case 'speed_50':
        return { current: Math.min(50, bestWpm), max: 50, label: `${bestWpm} / 50 WPM` };
      case 'speed_80':
        return { current: Math.min(80, bestWpm), max: 80, label: `${bestWpm} / 80 WPM` };
      case 'speed_100':
        return { current: Math.min(100, bestWpm), max: 100, label: `${bestWpm} / 100 WPM` };
      case 'century_club':
        return { current: Math.min(100, totalTests), max: 100, label: `${totalTests} / 100 tests` };
      case 'dedication_7':
        return { current: Math.min(7, streak.currentStreak), max: 7, label: `${streak.currentStreak} / 7 days` };
      case 'academy_scholar':
        return { current: Math.min(15, completedLessonsCount), max: 15, label: `${completedLessonsCount} / 15 lessons` };
      case 'perfectionist': {
        const hasPerfect = results.some((r) => r.accuracy === 100 && r.wpm >= 30);
        return { current: hasPerfect ? 1 : 0, max: 1, label: hasPerfect ? 'Achieved' : 'Need 100% test at 30+ WPM' };
      }
      case 'game_champion': {
        const highestScore = Math.max(0, ...Object.values(gameScores));
        return { current: Math.min(500, highestScore), max: 500, label: `${highestScore} / 500 arcade score` };
      }
      default:
        return null;
    }
  };

  const filteredAchievements = useMemo(() => {
    return allAchievements.filter((ach) => {
      const isUnlocked = unlockedAchievements.includes(ach.id);

      // Status filter
      if (statusFilter === 'unlocked' && !isUnlocked) return false;
      if (statusFilter === 'locked' && isUnlocked) return false;

      // Category filter
      if (activeCategory !== 'all' && ach.category !== activeCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          ach.title.toLowerCase().includes(query) ||
          ach.description.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [allAchievements, unlockedAchievements, activeCategory, statusFilter, searchQuery]);

  const categories = [
    { id: 'all', label: 'All Categories', icon: Trophy },
    { id: 'speed', label: 'Speed', icon: Zap },
    { id: 'accuracy', label: 'Accuracy', icon: Target },
    { id: 'stamina', label: 'Endurance & Streaks', icon: Flame },
    { id: 'lessons', label: 'Academy', icon: BookOpen },
    { id: 'games', label: 'Arcade', icon: Gamepad2 },
  ];

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="amber" size="sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Trophy Room
          </Badge>
          <span className="text-xs font-mono text-[#989A92]">
            {unlockedCount} of {totalCount} Badges Unlocked
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4] flex items-center gap-3">
          <Trophy className="w-7 h-7 text-[#E6C76B]" />
          <span>Achievements &amp; Honors</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#989A92] mt-1 max-w-2xl">
          Track milestones on your journey to touch-typing mastery. Badges unlock automatically as you achieve target speeds, maintain practice streaks, and finish lessons.
        </p>
      </div>

      {/* Mastery Progress Card */}
      <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-mono text-[#989A92] uppercase font-semibold block">
              Overall Mastery Progress
            </span>
            <div className="text-2xl font-bold font-mono text-[#ECEBE4] mt-0.5">
              {progressPercent}% Complete
              <span className="text-sm text-[#989A92] font-normal ml-2">
                ({unlockedCount}/{totalCount} Badges)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={progressPercent >= 80 ? 'green' : progressPercent >= 40 ? 'amber' : 'gray'}
              size="md"
            >
              {progressPercent >= 80
                ? 'Master Typist'
                : progressPercent >= 50
                ? 'Advanced Practitioner'
                : progressPercent >= 20
                ? 'Rising Talent'
                : 'Apprentice'}
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-[#20211D] border border-[#353630] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-[#E6C76B] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status filter tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#272824] border border-[#353630] text-xs font-mono">
            {(['all', 'unlocked', 'locked'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  statusFilter === s
                    ? 'bg-[#20211D] text-[#E6C76B] font-bold border border-[#353630]'
                    : 'text-[#989A92] hover:text-[#ECEBE4]'
                }`}
              >
                {s} {s === 'unlocked' && `(${unlockedCount})`} {s === 'locked' && `(${totalCount - unlockedCount})`}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7E8079]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search achievements..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#272824] border border-[#353630] text-xs font-mono text-[#ECEBE4] focus:outline-none focus:border-[#E6C76B]"
            />
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-150 ${
                  isActive
                    ? 'bg-[#E6C76B] text-[#20211D] font-bold'
                    : 'bg-[#20211D] text-[#989A92] hover:text-[#ECEBE4] border border-[#353630]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievement Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#272824] border border-[#353630] text-xs font-mono text-[#989A92]">
          <Award className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#ECEBE4]" />
          <p>No achievements match your active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((ach) => {
            const isUnlocked = unlockedAchievements.includes(ach.id);
            const progress = getProgressInfo(ach);

            return (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-[#272824] border-[#E6C76B]/40 shadow-sm'
                    : 'bg-[#20211D]/80 border-[#353630] opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isUnlocked
                            ? 'bg-[#E6C76B]/20 text-[#E6C76B]'
                            : 'bg-[#272824] text-[#7E8079]'
                        }`}
                      >
                        {isUnlocked ? (
                          <Award className="w-5 h-5" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#ECEBE4]">{ach.title}</h3>
                        <span className="text-[10px] font-mono uppercase text-[#7E8079]">
                          {ach.category}
                        </span>
                      </div>
                    </div>

                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-[#5DBE76] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-[#7E8079]">Locked</span>
                    )}
                  </div>

                  <p className="text-xs text-[#989A92] leading-relaxed mb-4">
                    {ach.description}
                  </p>
                </div>

                {/* Progress bar for locked achievements */}
                {!isUnlocked && progress && (
                  <div className="mt-2 pt-3 border-t border-[#353630]/60 text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px] text-[#989A92] mb-1">
                      <span>Progress</span>
                      <span className="text-[#ECEBE4]">{progress.label}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#1A1B16] overflow-hidden">
                      <div
                        className="h-full bg-[#E6C76B] rounded-full"
                        style={{
                          width: `${Math.min(100, (progress.current / progress.max) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
