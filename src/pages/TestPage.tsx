import React, { useState, useEffect, useCallback } from 'react';
import {
  TestMode,
  TimeLimit,
  WordLimit,
  Difficulty,
  TestResult,
} from '../types/typing';
import { useSettings } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { ModeSelector } from '../components/typing/ModeSelector';
import { TypingEngine } from '../components/typing/TypingEngine';
import { ResultsView } from '../components/typing/ResultsView';
import {
  generateWords,
  getRandomQuote,
  getRandomSentence,
  getRandomParagraph,
} from '../data/wordLists';

export const TestPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { addTestResult } = useProgress();

  const [mode, setMode] = useState<TestMode>(settings.defaultMode);
  const [timeLimit, setTimeLimit] = useState<TimeLimit>(settings.defaultTimeLimit);
  const [wordLimit, setWordLimit] = useState<WordLimit>(settings.defaultWordLimit);
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.difficulty);
  const [includePunctuation, setIncludePunctuation] = useState<boolean>(settings.includePunctuation);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(settings.includeNumbers);

  const [testText, setTestText] = useState<string>('');
  const [activeResult, setActiveResult] = useState<TestResult | null>(null);
  const [keyCounter, setKeyCounter] = useState(0);

  // Generate appropriate test text based on current options
  const generateNewText = useCallback(() => {
    let text = '';
    if (mode === 'time') {
      // Generate plenty of words so user never runs out during the timer
      const count = Math.max(100, timeLimit * 4);
      text = generateWords({
        count,
        punctuation: includePunctuation,
        numbers: includeNumbers,
        difficulty,
      });
    } else if (mode === 'words') {
      text = generateWords({
        count: wordLimit,
        punctuation: includePunctuation,
        numbers: includeNumbers,
        difficulty,
      });
    } else if (mode === 'quote') {
      const q = getRandomQuote();
      text = q.text;
    } else if (mode === 'sentences') {
      text = getRandomSentence();
    } else if (mode === 'paragraphs') {
      text = getRandomParagraph();
    } else {
      text = generateWords({ count: 25, difficulty });
    }

    setTestText(text);
    setActiveResult(null);
    setKeyCounter((prev) => prev + 1);
  }, [mode, timeLimit, wordLimit, difficulty, includePunctuation, includeNumbers]);

  // Initial load
  useEffect(() => {
    generateNewText();
  }, [generateNewText]);

  // Handle completion
  const handleTestComplete = (rawResult: Omit<TestResult, 'isPersonalBest'>) => {
    const { result } = addTestResult(rawResult);
    setActiveResult(result);
  };

  const handleRestart = () => {
    generateNewText();
  };

  const handleRetry = () => {
    setActiveResult(null);
    setKeyCounter((prev) => prev + 1);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-5xl mx-auto">
      {/* Test Controls Bar */}
      {!activeResult && (
        <div className="mb-8 w-full flex justify-center">
          <ModeSelector
            mode={mode}
            timeLimit={timeLimit}
            wordLimit={wordLimit}
            difficulty={difficulty}
            includePunctuation={includePunctuation}
            includeNumbers={includeNumbers}
            onModeChange={(m) => {
              setMode(m);
              updateSettings({ defaultMode: m });
            }}
            onTimeLimitChange={(t) => {
              setTimeLimit(t);
              updateSettings({ defaultTimeLimit: t });
            }}
            onWordLimitChange={(w) => {
              setWordLimit(w);
              updateSettings({ defaultWordLimit: w });
            }}
            onDifficultyChange={(d) => {
              setDifficulty(d);
              updateSettings({ difficulty: d });
            }}
            onTogglePunctuation={() => {
              const val = !includePunctuation;
              setIncludePunctuation(val);
              updateSettings({ includePunctuation: val });
            }}
            onToggleNumbers={() => {
              const val = !includeNumbers;
              setIncludeNumbers(val);
              updateSettings({ includeNumbers: val });
            }}
          />
        </div>
      )}

      {/* Main Interactive Screen: Engine or Results */}
      {activeResult ? (
        <ResultsView
          result={activeResult}
          onRetry={handleRetry}
          onNextTest={handleRestart}
        />
      ) : (
        <TypingEngine
          key={keyCounter}
          initialText={testText}
          mode={mode}
          timeLimit={timeLimit}
          wordLimit={wordLimit}
          onComplete={handleTestComplete}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};
