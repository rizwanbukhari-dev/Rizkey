import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Keyboard, Command, HelpCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const Footer: React.FC = () => {
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in an input or textarea, don't hijack '?'
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setShortcutsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const shortcuts = [
    { key: 'Tab', desc: 'Instant test restart / reload new words' },
    { key: 'Esc', desc: 'Pause or resume typing test' },
    { key: 'Space', desc: 'Complete word & advance to next word' },
    { key: 'Ctrl + Backspace', desc: 'Delete entire previous word' },
    { key: 'Shift + Key', desc: 'Type capital letter or upper symbol' },
    { key: '?', desc: 'Open this keyboard shortcuts reference' },
  ];

  return (
    <footer className="w-full border-t border-[#2C2D27] bg-[#20211D] py-6 px-4 sm:px-6 mt-auto text-xs text-[#7E8079] transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Keyboard shortcuts hint */}
        <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
          <button
            onClick={() => setShortcutsModalOpen(true)}
            className="flex items-center gap-1.5 font-mono text-[#989A92] hover:text-[#ECEBE4] transition-colors group"
            title="View keyboard shortcut cheat sheet"
          >
            <kbd className="px-1.5 py-0.5 rounded bg-[#272824] border border-[#353630] text-[#E6C76B] text-[11px] group-hover:border-[#E6C76B]">
              ?
            </kbd>
            <span>shortcuts</span>
          </button>
          <span className="text-[#353630]">&bull;</span>
          <div className="flex items-center gap-1.5 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-[#272824] border border-[#353630] text-[#989A92] text-[11px]">tab</kbd>
            <span>restart</span>
          </div>
          <span className="text-[#353630]">&bull;</span>
          <div className="flex items-center gap-1.5 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-[#272824] border border-[#353630] text-[#989A92] text-[11px]">esc</kbd>
            <span>pause</span>
          </div>
        </div>

        {/* Center: Quick Links */}
        <div className="flex items-center gap-4 flex-wrap justify-center text-xs font-mono">
          <Link to="/learn" className="hover:text-[#ECEBE4] transition-colors">Academy</Link>
          <Link to="/trainer" className="hover:text-[#ECEBE4] transition-colors">Smart Trainer</Link>
          <Link to="/developer" className="hover:text-[#ECEBE4] transition-colors">Dev Lab</Link>
          <Link to="/custom" className="hover:text-[#ECEBE4] transition-colors">Custom Text</Link>
          <Link to="/achievements" className="hover:text-[#ECEBE4] transition-colors">Achievements</Link>
        </div>

        {/* Right: Tagline, privacy link */}
        <div className="flex items-center gap-4 flex-wrap justify-center md:justify-end">
          <Link
            to="/privacy"
            className="hover:text-[#ECEBE4] transition-colors flex items-center gap-1 font-mono text-[11px]"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[#989A92] font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#E6C76B]" />
            <span>RizKey &bull; Master your keys</span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Modal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
        title="Keyboard Shortcuts Cheat Sheet"
      >
        <div className="space-y-3 font-mono text-xs">
          <div className="divide-y divide-[#353630]">
            {shortcuts.map((s) => (
              <div key={s.key} className="py-2.5 flex items-center justify-between gap-4">
                <kbd className="px-2 py-1 rounded bg-[#20211D] border border-[#353630] text-[#E6C76B] text-xs font-bold">
                  {s.key}
                </kbd>
                <span className="text-[#989A92] text-right">{s.desc}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#353630] flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShortcutsModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </footer>
  );
};
