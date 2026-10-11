# RizKey — Find your rhythm. Master your keys.

![RizKey Banner](https://raw.githubusercontent.com/rizkey/assets/main/banner.png)

> **RizKey** is a minimalist, distraction-free touch typing web application inspired by clean, keyboard-focused aesthetics. Designed for students, software engineers, and keyboard enthusiasts who want to develop instinctive ten-finger muscle memory, effortless cadence, and high-velocity typing.

---

## 🌟 Key Features

### 1. Distraction-Free Typing Test Engine
- **Multiple Test Modes**: Time (15s, 30s, 60s, 120s), Word Count (10, 25, 50, 100 words), Quotes, Sentences, and Paragraphs.
- **Accurate Real-Time Metrics**: Standard WPM (5 characters/word), Raw WPM, Accuracy percentage, character breakdown (correct, incorrect, extra).
- **First Keystroke Trigger**: Timers only begin on your first meaningful stroke—never on page load.
- **Visual Carets**: Customizable line, block, or underline carets with smooth animations.
- **Detailed Results & Charts**: Instant Recharts speed and consistency curves over time, personal-best badges, mistake breakdowns, and quick restart (`Tab` key).

### 2. Touch-Typing Learning Academy
- **15 Progressive Lessons**:
  1. *Introduction & Posture*: Ergonomics, elbow angles, and floating wrist positioning.
  2. *The Home-Row Keys*: A, S, D, F and J, K, L, Semicolon.
  3. *Correct Finger Placement*: Reaching G and H while maintaining home anchors.
  4. *Home-Row Word Mastery*: Forming real words and muscle memory.
  5. *Upper-Row Keys*: Q, W, E, R, T, Y, U, I, O, P reaches.
  6. *Lower-Row Keys*: Z, X, C, V, B, N, M, comma, and period curls.
  7. *Combining Rows*: Fluid vertical transitions across all three rows.
  8. *Common English Words*: Automating high-frequency English patterns.
  9. *Capital Letters & Shift*: Opposite-hand pinky Shift technique.
  10. *Punctuation Mastery*: Periods, commas, apostrophes, questions, and exclamation marks.
  11. *Numbers & Symbols*: Numeric row and shifted symbols (!@#$%).
  12. *Sentences & Paragraph Flow*: Sustained endurance and lookahead preview.
  13. *Accuracy Improvement*: Eliminating hesitation and backspacing habits.
  14. *Speed Development*: High-velocity metronomic rhythm.
  15. *Advanced Typing Assessment*: Final Academy graduation exam.
- **Progressive Unlocks & Star Ratings**: Earn 1 to 3 stars based on speed and accuracy.

### 3. Interactive Virtual QWERTY Keyboard
- **Visual Finger Guidance**: Color-coded finger zones across all 5 rows (Pinky, Ring, Middle, Index, Thumbs).
- **Tactile Home Markers**: Subtle raised dashes indicating F and J tactile nubs.
- **Shift Demonstration**: Automatically highlights opposite-hand Shift when uppercase or symbol characters are required.
- **Collapse & Toggle**: Hide the keyboard visualization whenever you want pure distraction-free focus.

### 4. Practice Center
- **10 Targeted Practice Modes**: Common Words, Difficult Words, Commonly Misspelled Words, Weak-Key Drills, Sentences, Paragraphs, Numbers, Punctuation, Capitalization, and Custom Text.
- **Dynamic Weak-Key Generator**: Analyzes your actual keystroke error log and generates custom drills targeting your most frequent mistypes.
- **Safe Custom Text Paster**: Paste custom text, articles, or code snippets with automatic sanitization.

### 5. Playable Typing Games
- **Word Sprint (500m Track)**: Propel your runner across a 500m track by typing words accurately. Build combo multipliers and survive with 3 lives.
- **Precision Shield (Accuracy Challenge)**: Start with 100% shield health. Every mistake inflicts -15 damage. Complete passages before your shield fails.
- **Time Frenzy (Survival Challenge)**: Start with 20 seconds. Every correctly completed word awards +2 bonus seconds. Survive as long as you can!
- **Local High Scores**: Track personal bests and unlock achievements.

### 6. In-Depth Statistics Dashboard
- **Performance KPIs**: Best WPM, Average WPM, Overall Accuracy, Total Tests, Active Practice Time, and Practice Streaks.
- **Time Filters**: Filter trends across 7 Days, 30 Days, or All Time.
- **Recharts Visualizations**: Speed Progression (Area Chart) and Accuracy Consistency (Line Chart).
- **Mistake Hotspots**: Overview of your most frequently missed keys with 1-click shortcut to targeted drills.
- **Comprehensive History Table**: Full log of recent sessions.

### 7. Settings & Customization
- **Theme Modes**: Dark Charcoal (`#20211D`) and Light Beige (`#F7F6F0`).
- **Typography**: Select between JetBrains Mono, Roboto Mono, Fira Code, Courier New, or Inter, with a live font-size slider (16px to 32px).
- **Tactile Audio Synthesizer**: Web Audio API synthesized switch sounds (Mechanical switch, Typewriter clack, Crisp click, Soft bubble, or Muted) with volume control.
- **Data Management**: Export all your scores, streaks, and lessons as a portable `.json` file, import existing backups, or reset data.

### 8. Privacy & Offline-First Guest Mode
- **Zero Keystroke Telemetry**: Keystrokes are evaluated purely in browser memory. No keystroke logging, no third-party tracking.
- **100% Functional Guest Mode**: Use all tests, lessons, games, and analytics without registering.
- **Optional Supabase Cloud Sync**: Optionally link an account to synchronize your progress across multiple devices.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/) + [Vitest](https://vitest.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visual Charts**: [Recharts](https://recharts.org/)
- **Sound**: Native Web Audio API (Zero external audio asset dependencies)
- **Cloud Database (Optional)**: [Supabase](https://supabase.com/)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/rizkey.git
cd rizkey
npm install
```

### 2. Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Running Automated Tests
Run unit tests for metrics calculations, lesson criteria, storage, and achievements:
```bash
npm run test
```

### 4. Production Build
Build optimized production bundles:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## ☁️ Optional Supabase Setup

Guest mode works out-of-the-box without Supabase. If you want cross-device cloud synchronization:

1. Create a project at [supabase.com](https://supabase.com/).
2. Navigate to the **SQL Editor** in your Supabase dashboard and run the script in `supabase/schema.sql`.
3. Create a `.env.local` file in your project root with your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
4. Restart your development server (`npm run dev`). Your app will automatically detect Supabase and enable cloud accounts and synchronization on `/account`.

---

## 🌐 Deploying to Vercel

RizKey includes a ready-to-use `vercel.json` file configuring SPA rewrites for client-side routing.

### Option A: Vercel CLI
```bash
npx vercel
```

### Option B: Vercel Dashboard (Git Integration)
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/), click **Add New Project** and import your repository.
3. Keep default settings:
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. (Optional) Add your Supabase environment variables under **Environment Variables**.
5. Click **Deploy**.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Tab` | Quick restart typing test / restart game |
| `Esc` | Blur input / focus command navigation |
| `Space` | Submit active word and advance |
| `Backspace` | Correct active word / jump to previous word if errors remain |

---

## 📄 License
MIT &bull; Crafted for typists who value rhythm and speed.
