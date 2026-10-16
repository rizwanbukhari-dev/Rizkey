import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { ProgressProvider } from './context/ProgressContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { TestPage } from './pages/TestPage';

// Lazy-load secondary sections to minimize initial bundle size and startup memory
const LearnPage = lazy(() => import('./pages/LearnPage').then((m) => ({ default: m.LearnPage })));
const PracticePage = lazy(() => import('./pages/PracticePage').then((m) => ({ default: m.PracticePage })));
const SmartTrainerPage = lazy(() => import('./pages/SmartTrainerPage').then((m) => ({ default: m.SmartTrainerPage })));
const DeveloperLabPage = lazy(() => import('./pages/DeveloperLabPage').then((m) => ({ default: m.DeveloperLabPage })));
const GamesPage = lazy(() => import('./pages/GamesPage').then((m) => ({ default: m.GamesPage })));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage').then((m) => ({ default: m.StatisticsPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then((m) => ({ default: m.AchievementsPage })));
const CustomTextPage = lazy(() => import('./pages/CustomTextPage').then((m) => ({ default: m.CustomTextPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="flex-1 flex items-center justify-center p-12">
    <div className="flex items-center gap-2.5 text-xs font-mono text-[#989A92]">
      <div className="w-4 h-4 border-2 border-[var(--accent-color,#E6C76B)] border-t-transparent rounded-full animate-spin" />
      <span>Loading...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <ToastProvider>
        <ProgressProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-200">
              <Header />
              <main className="flex-1 flex flex-col">
                <Suspense fallback={<PageLoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/test" element={<TestPage />} />
                    <Route path="/learn" element={<LearnPage />} />
                    <Route path="/practice" element={<PracticePage />} />
                    <Route path="/games" element={<GamesPage />} />
                    <Route path="/developer-lab" element={<DeveloperLabPage />} />
                    <Route path="/developer" element={<DeveloperLabPage />} />
                    <Route path="/smart-trainer" element={<SmartTrainerPage />} />
                    <Route path="/trainer" element={<SmartTrainerPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/progress" element={<StatisticsPage />} />
                    <Route path="/achievements" element={<AchievementsPage />} />
                    <Route path="/custom-text" element={<CustomTextPage />} />
                    <Route path="/custom" element={<CustomTextPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </ProgressProvider>
      </ToastProvider>
    </SettingsProvider>
  );
};

export default App;
