import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Keyboard,
  BookOpen,
  Target,
  Gamepad2,
  BarChart3,
  Settings,
  Menu,
  X,
  Flame,
  BrainCircuit,
  Terminal,
  Trophy,
  FileText,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Logo } from './Logo';
import { ThemeSelector } from './ThemeSelector';
import { InstallButton } from './InstallButton';
import { useProgress } from '../../context/ProgressContext';

export const Header: React.FC = () => {
  const { streak } = useProgress();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close 'More' dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const primaryNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Typing Test', path: '/test', icon: Keyboard },
    { name: 'Practice', path: '/practice', icon: Target },
    { name: 'Learn', path: '/learn', icon: BookOpen },
    { name: 'Games', path: '/games', icon: Gamepad2 },
    { name: 'Progress', path: '/statistics', icon: BarChart3 },
  ];

  const secondaryNavItems = [
    { name: 'Smart Trainer', path: '/smart-trainer', icon: BrainCircuit },
    { name: 'Developer Lab', path: '/developer-lab', icon: Terminal },
    { name: 'Custom Text', path: '/custom-text', icon: FileText },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <header className="w-full border-b border-[#2C2D27] bg-[#20211D]/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Logo size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-[var(--accent-color)] bg-[#272824] shadow-xs'
                        : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#272824]/60'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* Desktop 'More' Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-150 ${
                  moreMenuOpen
                    ? 'text-[var(--accent-color)] bg-[#272824]'
                    : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#272824]/60'
                }`}
                aria-expanded={moreMenuOpen}
                aria-label="More navigation options"
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#272824] border border-[#353630] py-1.5 shadow-xl animate-scaleIn z-50">
                  {secondaryNavItems.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setMoreMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 text-xs font-mono transition-colors ${
                            isActive
                              ? 'text-[var(--accent-color)] bg-[#20211D] font-bold'
                              : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#20211D]/60'
                          }`
                        }
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        <span>{sub.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Medium Screens (Tablets / Laptops) condensed nav */}
          <nav className="hidden md:flex xl:hidden items-center space-x-1">
            {primaryNavItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-[var(--accent-color)] bg-[#272824] shadow-xs'
                        : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#272824]/60'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* Medium screen overflow dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  moreMenuOpen ? 'text-[var(--accent-color)] bg-[#272824]' : 'text-[#989A92] hover:text-[#ECEBE4]'
                }`}
                aria-label="More navigation links"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#272824] border border-[#353630] py-1.5 shadow-xl animate-scaleIn z-50">
                  {[...primaryNavItems.slice(4), ...secondaryNavItems].map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setMoreMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 text-xs font-mono transition-colors ${
                            isActive
                              ? 'text-[var(--accent-color)] bg-[#20211D] font-bold'
                              : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#20211D]/60'
                          }`
                        }
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        <span>{sub.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Controls: Streak & Theme Selector */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {streak.currentStreak > 0 && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#272824] border border-[#353630] text-xs font-mono font-medium text-[var(--accent-color)]"
              title={`${streak.currentStreak} day typing streak! Best: ${streak.longestStreak} days`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span>{streak.currentStreak}d</span>
            </div>
          )}

          {/* Quick Install App Button */}
          <InstallButton variant="header" />

          {/* Quick Settings Link */}
          <NavLink
            to="/settings"
            aria-label="Settings"
            className={({ isActive }) =>
              `hidden sm:flex p-2 rounded-lg text-xs font-mono transition-colors ${
                isActive
                  ? 'text-[var(--accent-color)] bg-[#272824]'
                  : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#272824]'
              }`
            }
          >
            <Settings className="w-4 h-4" />
          </NavLink>

          {/* Theme & Accent Selector Popover */}
          <ThemeSelector />

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#272824]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#2C2D27] bg-[#20211D] px-4 pt-2 pb-6 space-y-1 animate-fadeIn max-h-[80vh] overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono text-[#7E8079] uppercase font-semibold">
            Primary Navigation
          </div>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-mono font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--accent-color)] bg-[#272824]'
                      : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#272824]/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="px-3 pt-3 pb-1.5 text-[10px] font-mono text-[#7E8079] uppercase font-semibold border-t border-[#2C2D27]/80 mt-2">
            Tools &amp; Personalization
          </div>
          {/* Mobile Install App Option */}
          <div className="px-1 py-1">
            <InstallButton
              variant="mobile-menu"
              onAction={() => setMobileMenuOpen(false)}
            />
          </div>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-mono font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--accent-color)] bg-[#272824]'
                      : 'text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#272824]/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};
