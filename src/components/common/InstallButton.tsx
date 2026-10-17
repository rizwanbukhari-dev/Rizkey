import React from 'react';
import { usePWAInstall } from '../../context/PWAInstallContext';
import { Download, CheckCircle, Smartphone, Laptop } from 'lucide-react';
import { Button } from '../ui/Button';

interface InstallButtonProps {
  variant?: 'header' | 'mobile-menu' | 'card' | 'button';
  onAction?: () => void;
  className?: string;
}

export const InstallButton: React.FC<InstallButtonProps> = ({
  variant = 'header',
  onAction,
  className = '',
}) => {
  const { isInstalled, promptInstall, isStandalone } = usePWAInstall();

  const handleClick = async () => {
    onAction?.();
    await promptInstall();
  };

  // 1. Header Variant: Sleek pill button in top navigation
  if (variant === 'header') {
    // If already installed in standalone mode, cleanly hide from header to save space
    if (isInstalled || isStandalone) {
      return null;
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        className={`hidden sm:flex group items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-xs font-medium transition-all duration-150 border bg-[#272824] hover:bg-[#32332B] border-[#353630] hover:border-[var(--accent-color)] text-[#ECEBE4] hover:text-[var(--accent-color)] shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] cursor-pointer select-none ${className}`}
        aria-label="Install RizKey App"
        title="Install RizKey on your device for distraction-free offline typing"
      >
        <Download className="w-3.5 h-3.5 text-[var(--accent-color,#E6C76B)] transition-transform duration-150 group-hover:-translate-y-0.5" />
        <span className="hidden md:inline">Install App</span>
      </button>
    );
  }

  // 2. Mobile Drawer Menu Variant
  if (variant === 'mobile-menu') {
    if (isInstalled || isStandalone) {
      return (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#272824]/40 border border-[#353630]/60 text-xs font-mono text-[#989A92]">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-[#5DBE76]" />
            <span className="text-[#ECEBE4] font-medium">RizKey is Installed</span>
          </div>
          <span className="text-[10px] text-[#5DBE76] font-bold">READY</span>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        className={`w-full flex items-center justify-between p-3 rounded-xl bg-[#272824] border border-[#353630] hover:border-[var(--accent-color)] transition-all text-left group cursor-pointer ${className}`}
        aria-label="Install RizKey Application"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#20211D] border border-[#353630] flex items-center justify-center text-[var(--accent-color,#E6C76B)] group-hover:scale-105 transition-transform">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono font-bold text-xs text-[#ECEBE4] group-hover:text-[var(--accent-color)] transition-colors">
              Install RizKey App
            </div>
            <div className="text-[11px] text-[#989A92]">
              Offline practice &amp; distraction-free mode
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#20211D] border border-[#353630] text-[var(--accent-color,#E6C76B)] font-bold">
          PWA
        </span>
      </button>
    );
  }

  // 3. Card Variant: For Settings Page or Home Page
  if (variant === 'card') {
    return (
      <div className={`p-4 sm:p-5 rounded-2xl bg-[#272824] border border-[#353630] space-y-4 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#20211D] border border-[#3A3B34] flex items-center justify-center font-mono font-bold text-[var(--accent-color,#E6C76B)] text-sm shrink-0">
              R_
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-[#ECEBE4] flex flex-wrap items-center gap-2">
                <span>RizKey Desktop &amp; Mobile App</span>
                {(isInstalled || isStandalone) && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#5DBE76] font-normal bg-[#5DBE76]/10 px-2 py-0.5 rounded-full border border-[#5DBE76]/30">
                    <CheckCircle className="w-3 h-3" /> Installed
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#989A92] mt-0.5 leading-relaxed">
                Install RizKey as a standalone Progressive Web App (PWA) with full offline support.
              </p>
            </div>
          </div>

          {!isInstalled && !isStandalone && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleClick}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="self-start sm:self-auto shrink-0"
            >
              Install App
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs font-mono text-[#989A92]">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#20211D] border border-[#353630]/60">
            <Laptop className="w-4 h-4 text-[var(--accent-color,#E6C76B)] shrink-0" />
            <span className="break-words">Desktop: Windows, macOS, ChromeOS, Linux</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#20211D] border border-[#353630]/60">
            <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="break-words">Mobile: Android, iPhone &amp; iPad</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Generic standalone button variant
  return (
    <Button
      variant="primary"
      size="md"
      onClick={handleClick}
      leftIcon={<Download className="w-4 h-4" />}
      className={className}
      disabled={isInstalled || isStandalone}
    >
      {isInstalled || isStandalone ? 'App Installed' : 'Install RizKey App'}
    </Button>
  );
};
