import React, { useState, useCallback } from 'react';
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

function createTestText(
  mode: TestMode,
  timeLimit: TimeLimit,
  wordLimit: WordLimit,
  difficulty: Difficulty,
  includePunctuation: boolean,
  includeNumbers: boolean
): string {
  if (mode === 'time') {
    const count = Math.max(100, timeLimit * 4);
    return generateWords({
      count,
      punctuation: includePunctuation,
      numbers: includeNumbers,
      difficulty,
    });
  } else if (mode === 'words') {
    return generateWords({
      count: wordLimit,
      punctuation: includePunctuation,
      numbers: includeNumbers,
      difficulty,
    });
  } else if (mode === 'quote') {
    return getRandomQuote().text;
  } else if (mode === 'sentences') {
    return getRandomSentence();
  } else if (mode === 'paragraphs') {
    return getRandomParagraph();
  }
  return generateWords({ count: 25, difficulty });
}

export const TestPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { addTestResult } = useProgress();

  const [mode, setMode] = useState<TestMode>(settings.defaultMode);
  const [timeLimit, setTimeLimit] = useState<TimeLimit>(settings.defaultTimeLimit);
  const [wordLimit, setWordLimit] = useState<WordLimit>(settings.defaultWordLimit);
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.difficulty);
  const [includePunctuation, setIncludePunctuation] = useState<boolean>(settings.includePunctuation);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(settings.includeNumbers);

  const [testText, setTestText] = useState<string>(() =>
    createTestText(
      settings.defaultMode,
      settings.defaultTimeLimit,
      settings.defaultWordLimit,
      settings.difficulty,
      settings.includePunctuation,
      settings.includeNumbers
    )
  );
  const [activeResult, setActiveResult] = useState<TestResult | null>(null);
  const [keyCounter, setKeyCounter] = useState(0);

  // Generate appropriate test text based on current or new options
  const generateNewText = useCallback(
    (
      newMode = mode,
      newTime = timeLimit,
      newWord = wordLimit,
      newDiff = difficulty,
      newPunc = includePunctuation,
      newNum = includeNumbers
    ) => {
      const text = createTestText(newMode, newTime, newWord, newDiff, newPunc, newNum);
      setTestText(text);
      setActiveResult(null);
      setKeyCounter((prev) => prev + 1);
    },
    [mode, timeLimit, wordLimit, difficulty, includePunctuation, includeNumbers]
  );

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
              generateNewText(m, timeLimit, wordLimit, difficulty, includePunctuation, includeNumbers);
            }}
            onTimeLimitChange={(t) => {
              setTimeLimit(t);
              updateSettings({ defaultTimeLimit: t });
              generateNewText(mode, t, wordLimit, difficulty, includePunctuation, includeNumbers);
            }}
            onWordLimitChange={(w) => {
              setWordLimit(w);
              updateSettings({ defaultWordLimit: w });
              generateNewText(mode, timeLimit, w, difficulty, includePunctuation, includeNumbers);
            }}
            onDifficultyChange={(d) => {
              setDifficulty(d);
              updateSettings({ difficulty: d });
              generateNewText(mode, timeLimit, wordLimit, d, includePunctuation, includeNumbers);
            }}
            onTogglePunctuation={() => {
              const val = !includePunctuation;
              setIncludePunctuation(val);
              updateSettings({ includePunctuation: val });
              generateNewText(mode, timeLimit, wordLimit, difficulty, val, includeNumbers);
            }}
            onToggleNumbers={() => {
              const val = !includeNumbers;
              setIncludeNumbers(val);
              updateSettings({ includeNumbers: val });
              generateNewText(mode, timeLimit, wordLimit, difficulty, includePunctuation, val);
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
