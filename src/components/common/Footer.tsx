import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Watermark } from './Watermark';
import { SocialLinks } from './SocialLinks';

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
    <footer className="w-full border-t border-[#2C2D27] bg-[#20211D] py-6 px-4 sm:px-6 mt-auto text-xs text-[#7E8079] transition-colors duration-200 select-none">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">
        {/* Top Tier: Watermark, Social Links & Shortcuts */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-[#2C2D27]/80">
          {/* Professional RizKey Watermark */}
          <div className="flex items-center text-center sm:text-left">
            <Watermark size="sm" showTagline={true} />
          </div>

          {/* Social Links: Follow my journey */}
          <div className="flex items-center">
            <SocialLinks size="sm" showHeading={true} />
          </div>

          {/* Keyboard shortcuts quick triggers */}
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
            <button
              onClick={() => setShortcutsModalOpen(true)}
              className="flex items-center gap-1.5 font-mono text-[#989A92] hover:text-[#ECEBE4] transition-colors group cursor-pointer"
              title="View keyboard shortcut cheat sheet"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-[#272824] border border-[#353630] text-[var(--accent-color,#E6C76B)] text-[11px] group-hover:border-[var(--accent-color,#E6C76B)]">
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
        </div>

        {/* Bottom Tier: Quick Navigation & Privacy */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          {/* Quick Links */}
          <nav className="flex items-center gap-4 sm:gap-5 flex-wrap justify-center text-[#989A92]" aria-label="Footer navigation">
            <Link to="/learn" className="hover:text-[#ECEBE4] transition-colors">Academy</Link>
            <Link to="/trainer" className="hover:text-[#ECEBE4] transition-colors">Smart Trainer</Link>
            <Link to="/developer" className="hover:text-[#ECEBE4] transition-colors">Dev Lab</Link>
            <Link to="/custom" className="hover:text-[#ECEBE4] transition-colors">Custom Text</Link>
            <Link to="/achievements" className="hover:text-[#ECEBE4] transition-colors">Achievements</Link>
            <Link
              to="/privacy"
              className="hover:text-[#ECEBE4] transition-colors flex items-center gap-1 text-[11px]"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy</span>
            </Link>
          </nav>

          {/* Tagline */}
          <div className="flex items-center gap-1.5 text-[#989A92] font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-color,#E6C76B)]" />
            <span>Find your rhythm. Master your keys.</span>
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
                <kbd className="px-2 py-1 rounded bg-[#20211D] border border-[#353630] text-[var(--accent-color,#E6C76B)] text-xs font-bold">
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
