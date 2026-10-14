import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { ProgressProvider } from './context/ProgressContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { TestPage } from './pages/TestPage';
import { LearnPage } from './pages/LearnPage';
import { PracticePage } from './pages/PracticePage';
import { SmartTrainerPage } from './pages/SmartTrainerPage';
import { DeveloperLabPage } from './pages/DeveloperLabPage';
import { GamesPage } from './pages/GamesPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { CustomTextPage } from './pages/CustomTextPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <ToastProvider>
        <ProgressProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-200">
              <Header />
              <main className="flex-1 flex flex-col">
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
