import React, { useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useToast } from '../context/ToastContext';
import { TypingEngine } from '../components/typing/TypingEngine';
import { ResultsView } from '../components/typing/ResultsView';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TestResult } from '../types/typing';
import {
  Code2,
  Terminal,
  Database,
  Brackets,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Cpu,
} from 'lucide-react';

type DevLanguage = 'typescript' | 'python' | 'jsx' | 'sql' | 'rust' | 'bash' | 'symbols';

interface CodeSnippet {
  id: string;
  language: DevLanguage;
  title: string;
  code: string;
}

const SNIPPETS: Record<DevLanguage, CodeSnippet[]> = {
  typescript: [
    {
      id: 'ts-1',
      language: 'typescript',
      title: 'Async Data Fetcher',
      code: 'const fetchData = async <T>(url: string): Promise<T> => { const res = await fetch(url); if (!res.ok) throw new Error(res.statusText); return res.json(); };',
    },
    {
      id: 'ts-2',
      language: 'typescript',
      title: 'React Custom Hook',
      code: 'export const useDebounce = <T>(val: T, delay = 300): T => { const [debounced, setDebounced] = useState(val); useEffect(() => { const timer = setTimeout(() => setDebounced(val), delay); return () => clearTimeout(timer); }, [val, delay]); return debounced; };',
    },
    {
      id: 'ts-3',
      language: 'typescript',
      title: 'Array Pipeline Transform',
      code: 'const activeUsers = users.filter((u) => u.isActive && u.age >= 18).map((u) => ({ id: u.id, email: u.email.toLowerCase() })).sort((a, b) => a.id - b.id);',
    },
  ],
  python: [
    {
      id: 'py-1',
      language: 'python',
      title: 'List Comprehension & Filter',
      code: 'def get_prime_squares(numbers: list[int]) -> list[int]: return [n ** 2 for n in numbers if n > 1 and all(n % i != 0 for i in range(2, int(n ** 0.5) + 1))]',
    },
    {
      id: 'py-2',
      language: 'python',
      title: 'Context Manager File Reader',
      code: 'with open("config.json", mode="r", encoding="utf-8") as f: payload = json.loads(f.read()) if payload.get("debug"): print("Debug mode is enabled")',
    },
    {
      id: 'py-3',
      language: 'python',
      title: 'Dataclass Model Definition',
      code: '@dataclass(frozen=True)\nclass UserModel:\n    user_id: str\n    email: str\n    created_at: float = field(default_factory=time.time)',
    },
  ],
  jsx: [
    {
      id: 'jsx-1',
      language: 'jsx',
      title: 'Interactive Modal Dialog',
      code: '<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm Action"> <p className="text-sm text-gray-400">Are you sure?</p> <Button onClick={handleConfirm}>Proceed</Button> </Modal>',
    },
    {
      id: 'jsx-2',
      language: 'jsx',
      title: 'Mapped Navigation List',
      code: '<nav className="flex items-center gap-2"> {navLinks.map((link) => ( <NavLink key={link.href} to={link.href} className={({ isActive }) => isActive ? "text-amber-400" : "text-gray-400"}> {link.label} </NavLink> ))} </nav>',
    },
  ],
  sql: [
    {
      id: 'sql-1',
      language: 'sql',
      title: 'Aggregated Monthly Metrics',
      code: 'SELECT user_id, COUNT(*) AS total_tests, ROUND(AVG(wpm), 2) AS avg_speed FROM typing_results WHERE created_at >= NOW() - INTERVAL \'30 days\' GROUP BY user_id HAVING COUNT(*) >= 5 ORDER BY avg_speed DESC LIMIT 20;',
    },
    {
      id: 'sql-2',
      language: 'sql',
      title: 'Left Join with Fallback Coalesce',
      code: 'SELECT u.id, u.email, COALESCE(s.best_wpm, 0) AS best_score FROM users u LEFT JOIN user_stats s ON u.id = s.user_id WHERE u.is_verified = true ORDER BY best_score DESC;',
    },
  ],
  rust: [
    {
      id: 'rs-1',
      language: 'rust',
      title: 'Pattern Matching & Result',
      code: 'fn parse_integer(input: &str) -> Result<i64, ParseIntError> { match input.trim().parse::<i64>() { Ok(val) if val > 0 => Ok(val), Ok(_) => Err(ParseIntError::InvalidRange), Err(err) => Err(err), } }',
    },
    {
      id: 'rs-2',
      language: 'rust',
      title: 'Struct with Generic Trait',
      code: 'pub struct Cache<K, V> where K: Eq + Hash, V: Clone { store: HashMap<K, V>, max_capacity: usize, } impl<K, V> Cache<K, V> where K: Eq + Hash, V: Clone { pub fn new(cap: usize) -> Self { Self { store: HashMap::new(), max_capacity: cap } } }',
    },
  ],
  bash: [
    {
      id: 'sh-1',
      language: 'bash',
      title: 'Docker Build & Healthcheck',
      code: 'docker build -t rizkey-app:latest . && docker run -d -p 3000:3000 --restart=always --name=rizkey rizkey-app:latest && curl -f http://localhost:3000/api/health || exit 1',
    },
    {
      id: 'sh-2',
      language: 'bash',
      title: 'Find and Replace in Workspace',
      code: 'find src/ -type f -name "*.ts" -exec sed -i "s/oldVariable/newVariable/g" {} + && git status --short',
    },
  ],
  symbols: [
    {
      id: 'sym-1',
      language: 'symbols',
      title: 'Brackets & Operators Gauntlet',
      code: '{{ [ (x + 1) * 2 ] }} => { foo: [a, b], bar: (x === y ? true : false) }; if (a && b || !c) { fn(); }',
    },
    {
      id: 'sym-2',
      language: 'symbols',
      title: 'Regular Expression & Delimiters',
      code: 'const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/; test(regex.test("user@host.io"));',
    },
  ],
};

export const DeveloperLabPage: React.FC = () => {
  const { addTestResult } = useProgress();
  const { toast } = useToast();

  const [language, setLanguage] = useState<DevLanguage>('typescript');
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [activeResult, setActiveResult] = useState<TestResult | null>(null);
  const [engineKey, setEngineKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentPool = SNIPPETS[language] || SNIPPETS.typescript;
  const currentSnippet = currentPool[snippetIndex % currentPool.length];

  useEffect(() => {
    if (currentSnippet) {
      setCurrentText(currentSnippet.code);
      setActiveResult(null);
      setEngineKey((k) => k + 1);
    }
  }, [language, snippetIndex]);

  const handleNextSnippet = () => {
    setSnippetIndex((i) => (i + 1) % currentPool.length);
  };

  const handleCopyCode = async () => {
    if (!currentText) return;
    try {
      await navigator.clipboard.writeText(currentText);
      setCopied(true);
      toast.success('Snippet copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleTestComplete = (rawResult: Omit<TestResult, 'isPersonalBest'>) => {
    const { result, isPersonalBest } = addTestResult(rawResult);
    setActiveResult(result);
    if (isPersonalBest) {
      toast.success('New Personal Best speed recorded in Developer Lab!');
    } else {
      toast.info('Developer syntax challenge completed!');
    }
  };

  const languages: { id: DevLanguage; label: string; icon: any }[] = [
    { id: 'typescript', label: 'TypeScript', icon: Code2 },
    { id: 'python', label: 'Python', icon: Terminal },
    { id: 'jsx', label: 'React JSX', icon: Code2 },
    { id: 'sql', label: 'SQL', icon: Database },
    { id: 'rust', label: 'Rust', icon: Cpu },
    { id: 'bash', label: 'Shell / Bash', icon: Terminal },
    { id: 'symbols', label: 'Brackets & RegEx', icon: Brackets },
  ];

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="amber" size="sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Code Typing Gym
          </Badge>
          <span className="text-xs font-mono text-[#989A92]">
            Syntax, Operators &amp; Bracket Muscle Memory
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4] flex items-center gap-3">
          <Terminal className="w-7 h-7 text-[#E6C76B]" />
          <span>Developer Lab</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#989A92] mt-1 max-w-2xl">
          Real programmers spend significant time reaching for curly braces, semicolons, arrows, and camelCase. Train on genuine, idiomatic code snippets across modern programming languages.
        </p>
      </div>

      {/* Language Selector Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {languages.map((l) => {
          const Icon = l.icon;
          const isActive = language === l.id;
          return (
            <button
              key={l.id}
              onClick={() => {
                setLanguage(l.id);
                setSnippetIndex(0);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-150 ${
                isActive
                  ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                  : 'bg-[#272824] text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#2E2F2A] border border-[#353630]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{l.label}</span>
            </button>
          );
        })}
      </div>

      {/* Snippet Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#272824] border border-[#353630] mb-6 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#989A92]">Snippet:</span>
          <span className="text-[#ECEBE4] font-bold">{currentSnippet.title}</span>
          <span className="text-[#7E8079]">
            ({(snippetIndex % currentPool.length) + 1} of {currentPool.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#20211D] transition-colors"
            title="Copy snippet code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#5DBE76]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleNextSnippet}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Next Snippet
          </Button>
        </div>
      </div>

      {/* Interactive Typing Engine / Results */}
      {currentText && (
        <div className="bg-[#272824]/60 border border-[#353630] rounded-2xl p-6 sm:p-8">
          {activeResult ? (
            <ResultsView
              result={activeResult}
              onRetry={() => {
                setActiveResult(null);
                setEngineKey((k) => k + 1);
              }}
              onNextTest={handleNextSnippet}
            />
          ) : (
            <TypingEngine
              key={engineKey}
              initialText={currentText}
              mode="custom"
              onComplete={handleTestComplete}
              onRestart={() => {
                setActiveResult(null);
                setEngineKey((k) => k + 1);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
