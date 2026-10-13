import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, HardDrive, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 animate-fadeIn pb-12">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#989A92] hover:text-[#ECEBE4] mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Typing Test</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4] flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-[#E6C76B]" />
          <span>Privacy & Local Storage</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#989A92] mt-1">
          How RizKey handles your typing data and browser storage with zero accounts required.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-[#989A92] font-sans leading-relaxed">
        {/* Offline First & Local Storage */}
        <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630]">
          <h2 className="text-base font-bold text-[#ECEBE4] flex items-center gap-2 mb-3">
            <HardDrive className="w-5 h-5 text-[#E6C76B]" />
            <span>1. Local-First Architecture</span>
          </h2>
          <p className="mb-3">
            RizKey operates entirely in your browser. All test speeds, accuracy records, academy lesson achievements, daily streak counters, and preferences are stored directly on your machine via standard Web Storage (<code className="text-[#ECEBE4] font-mono">localStorage</code>).
          </p>
          <p>
            We do not track, log, or record the keystrokes you type for profiling or behavioral advertising. You can use the entire platform completely anonymously as a guest without ever providing an email or creating an account.
          </p>
        </div>

        {/* Keystroke Privacy */}
        <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630]">
          <h2 className="text-base font-bold text-[#ECEBE4] flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-[#5DBE76]" />
            <span>2. Zero Keystroke Telemetry</span>
          </h2>
          <p className="mb-3">
            Your keystrokes are processed locally in memory by the typing engine to compute WPM, accuracy, and error character frequencies. They are never sent over the network to external servers. Custom text you paste into the Practice Center stays inside your browser session and is never uploaded.
          </p>
        </div>

        {/* No Accounts Required */}
        <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630]">
          <h2 className="text-base font-bold text-[#ECEBE4] flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-sky-400" />
            <span>3. No Accounts, Passwords, or Registration</span>
          </h2>
          <p className="mb-3">
            RizKey requires no accounts, no usernames, no passwords, and no email addresses. You can immediately access every lesson, practice mode, developer lab, game, and analytics view without ever creating an account or logging in.
          </p>
          <p>
            Your practice data remains safely stored in your browser's private storage, completely immune to remote data leaks or credential breaches.
          </p>
        </div>

        {/* Data Ownership & Export */}
        <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630]">
          <h2 className="text-base font-bold text-[#ECEBE4] mb-3">
            4. Full Data Ownership, Export & Erasure
          </h2>
          <p className="mb-3">
            You maintain 100% ownership of your typing data. At any time via the <Link to="/settings" className="text-[#E6C76B] underline">Settings</Link> page, you can:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#ECEBE4] mb-3">
            <li>Download a complete JSON export of all your stats, streaks, and lessons.</li>
            <li>Import an existing backup to restore data onto a new device.</li>
            <li>Completely erase all locally stored data with one click.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
