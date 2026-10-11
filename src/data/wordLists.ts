import { Difficulty } from '../types/typing';

export const COMMON_WORDS_200 = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'great', 'between', 'need', 'large', 'under', 'might', 'still', 'must', 'down', 'line',
  'right', 'place', 'water', 'thing', 'help', 'off', 'world', 'both', 'life', 'always',
  'those', 'both', 'find', 'here', 'thing', 'give', 'many', 'well', 'very', 'hand',
  'high', 'keep', 'keep', 'put', 'end', 'does', 'another', 'while', 'last', 'might',
  'light', 'head', 'turn', 'real', 'mean', 'leave', 'set', 'next', 'sound', 'below',
  'saw', 'something', 'thought', 'both', 'few', 'those', 'always', 'show', 'large', 'often',
  'together', 'ask', 'house', 'world', 'school', 'important', 'until', 'form', 'food', 'keep',
  'children', 'feet', 'land', 'side', 'without', 'boy', 'once', 'animal', 'life', 'enough',
  'took', 'four', 'head', 'above', 'kind', 'began', 'almost', 'live', 'page', 'got',
  'earth', 'need', 'far', 'hand', 'high', 'year', 'mother', 'light', 'country', 'father'
];

export const EXTENDED_WORDS = [
  'system', 'program', 'computer', 'keyboard', 'screen', 'software', 'typing', 'rhythm',
  'velocity', 'accuracy', 'fingers', 'muscle', 'memory', 'practice', 'mastery', 'focus',
  'clarity', 'effort', 'steady', 'balance', 'flow', 'momentum', 'progress', 'reflex',
  'station', 'journey', 'horizon', 'pattern', 'algorithm', 'function', 'syntax', 'terminal',
  'network', 'interface', 'element', 'dynamic', 'digital', 'signal', 'energy', 'vibrant',
  'silent', 'motion', 'tactile', 'frequency', 'harmony', 'precision', 'cadence', 'tempo',
  'concept', 'creative', 'discover', 'explore', 'measure', 'quantum', 'science', 'wisdom',
  'knowledge', 'inspire', 'builder', 'design', 'future', 'modern', 'elegant', 'swift',
  'agile', 'nimble', 'stamina', 'champion', 'patience', 'habit', 'routine', 'pursuit'
];

export const DIFFICULT_WORDS = [
  'bureaucracy', 'conscientious', 'phenomenon', 'acquiesce', 'sovereignty', 'pronunciation',
  'rhythm', 'subtle', 'synchronous', 'asynchronous', 'hierarchical', 'juxtaposition',
  'kaleidoscope', 'paraphernalia', 'quintessential', 'reconnaissance', 'susceptible',
  'unprecedented', 'vicissitude', 'whimsical', 'anachronistic', 'cacophony', 'deleterious',
  'ephemeral', 'fastidious', 'grandiloquent', 'idiosyncrasy', 'lugubrious', 'mellifluous',
  'nefarious', 'obfuscate', 'perspicacious', 'quixotic', 'recalcitrant', 'serendipity'
];

export const COMMONLY_MISSPELLED_WORDS = [
  'definitely', 'separate', 'necessary', 'accommodate', 'embarrass', 'occurrence',
  'privilege', 'receive', 'until', 'calendar', 'weird', 'foreign', 'guarantee',
  'maintenance', 'noticeable', 'questionnaire', 'rhythm', 'liaison', 'consensus',
  'exaggerate', 'harass', 'independent', 'millennium', 'perseverance', 'supersede',
  'threshold', 'twelfth', 'vacuum', 'withhold', 'hygiene', 'discipline', 'fascinate'
];

export interface QuoteItem {
  text: string;
  author: string;
}

export const QUOTES: QuoteItem[] = [
  { text: "Find your rhythm. Master your keys. Speed is the natural byproduct of effortless accuracy.", author: "RizKey Philosophy" },
  { text: "Simplicity is prerequisite for reliability. The best keystroke is the one made with certainty.", author: "Edsger W. Dijkstra" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { text: "Flow is being completely involved in an activity for its own sake. The ego falls away. Time flies.", author: "Mihaly Csikszentmihalyi" },
  { text: "Touch typing is not merely pressing keys; it is translating the cadence of thought directly onto the screen.", author: "Keyboard Artisan" },
  { text: "Slow is smooth, smooth is fast. Master precision first, and velocity will follow effortlessly.", author: "Traditional Proverb" },
  { text: "Do not fear mistakes. You will know failure. Continue to reach out.", author: "Benjamin Franklin" },
  { text: "The secret to getting ahead is getting started. Keep your fingers resting on the home row.", author: "Mark Twain" },
  { text: "Focus is a muscle that strengthens with every quiet, deliberate key you strike.", author: "Anonymous" },
  { text: "Clean code and clean typing share the same virtue: economy of motion and quiet confidence.", author: "Software Craftsman" }
];

export const SENTENCES = [
  "The quick brown fox jumps effortlessly over the lazy sleeping dog.",
  "Consistent daily practice trains finger reflexes better than sporadic marathon sessions.",
  "Keep your wrists elevated gently above the desk to prevent fatigue and strain.",
  "True typing mastery means your fingers strike keys without conscious deliberation.",
  "When typing rhythm feels smooth, accuracy climbs and mistakes naturally diminish.",
  "A quiet keyboard session can be one of the most meditative practices of the day.",
  "Focus on the current word while allowing your peripheral vision to preview the next.",
  "Precision always precedes speed; rush nothing and let your fingers find their cadence.",
  "The home row is your anchor point; return to F and J after every stretch."
];

export const PARAGRAPHS = [
  "Touch typing is a foundation for modern cognitive expression. When fingers move without needing visual confirmation, the friction between your mind and the digital canvas dissolves entirely. Your posture aligns, your hands dance across rows, and words appear as fast as your thoughts form.",
  "Rhythm is the secret metric of world-class typists. Rather than burst in uneven spurts and stumble on difficult trigraphs, great typists maintain a steady, metronomic cadence. This consistency preserves stamina across long coding sessions, essays, and typing challenges.",
  "The home row keys form the cornerstone of ergonomic keyboard usage. Placing your index fingers on the subtle bumps of the F and J keys gives your muscle memory an absolute geographic reference. From there, each key is only a precise, minimal reach away."
];

export interface WordGeneratorOptions {
  count?: number;
  punctuation?: boolean;
  numbers?: boolean;
  difficulty?: Difficulty;
}

/**
 * Generates randomized word sequence based on difficulty, punctuation, and number settings
 */
export function generateWords(options: WordGeneratorOptions = {}): string {
  const count = options.count || 25;
  const difficulty = options.difficulty || 'normal';
  const includePunctuation = options.punctuation || false;
  const includeNumbers = options.numbers || false;

  let pool: string[] = COMMON_WORDS_200;
  if (difficulty === 'normal') {
    pool = [...COMMON_WORDS_200, ...EXTENDED_WORDS];
  } else if (difficulty === 'advanced') {
    pool = [...EXTENDED_WORDS, ...DIFFICULT_WORDS, ...COMMONLY_MISSPELLED_WORDS];
  }

  const punctuationMarks = ['.', ',', ';', '!', '?', '-', '"'];
  const words: string[] = [];

  for (let i = 0; i < count; i++) {
    // Occasionally inject a number if requested
    if (includeNumbers && Math.random() < 0.15) {
      const num = Math.floor(Math.random() * 900) + 10;
      words.push(num.toString());
      continue;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    let word = pool[randomIndex];

    if (includePunctuation) {
      // Capitalize first word or sentence start
      if (i === 0 || words[i - 1]?.endsWith('.')) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      // Add trailing punctuation occasionally
      if (Math.random() < 0.25 && i < count - 1) {
        const mark = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
        word += mark;
      }
    }

    words.push(word);
  }

  // Ensure last word ends cleanly if punctuation enabled
  if (includePunctuation && !words[words.length - 1].endsWith('.')) {
    words[words.length - 1] += '.';
  }

  return words.join(' ');
}

export function getRandomQuote(): QuoteItem {
  const idx = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[idx];
}

export function getRandomSentence(): string {
  const idx = Math.floor(Math.random() * SENTENCES.length);
  return SENTENCES[idx];
}

export function getRandomParagraph(): string {
  const idx = Math.floor(Math.random() * PARAGRAPHS.length);
  return PARAGRAPHS[idx];
}

/**
 * Generates targeted practice words containing user's weakest keys
 */
export function generateWeakKeyWords(weakKeys: string[], count = 25): string {
  if (!weakKeys || weakKeys.length === 0) {
    return generateWords({ count });
  }

  const targetChars = new Set(weakKeys.map(k => k.toLowerCase()));
  const allPool = [...COMMON_WORDS_200, ...EXTENDED_WORDS, ...DIFFICULT_WORDS];

  // Filter words that contain at least one of the weak keys
  const matchingWords = allPool.filter(w => {
    for (const char of w) {
      if (targetChars.has(char)) return true;
    }
    return false;
  });

  const selectedPool = matchingWords.length >= 10 ? matchingWords : allPool;
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * selectedPool.length);
    words.push(selectedPool[idx]);
  }

  return words.join(' ');
}
