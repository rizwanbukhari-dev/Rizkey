import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { usePWAInstall } from '../../context/PWAInstallContext';
import {
  Share,
  PlusSquare,
  Zap,
  WifiOff,
  Maximize2,
  HelpCircle,
  DownloadCloud,
} from 'lucide-react';

export const InstallModal: React.FC = () => {
  const { isModalOpen, closeInstallModal, isIOS, isInstalled } = usePWAInstall();

  if (!isModalOpen) return null;

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeInstallModal}
      title={isInstalled ? 'RizKey is Installed' : 'Install RizKey App'}
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-xs sm:text-sm">
        {/* App Banner Card */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#20211D] border border-[#353630]">
          <div className="w-11 h-11 rounded-xl bg-[#272824] border border-[#3A3B34] flex items-center justify-center font-mono font-bold text-[var(--accent-color,#E6C76B)] text-base shrink-0 shadow-xs">
            R_
          </div>
          <div>
            <h4 className="font-bold text-[#ECEBE4] text-sm font-mono">RizKey PWA</h4>
            <p className="text-xs text-[#989A92] leading-tight mt-0.5">
              Full touch-typing engine, offline lessons, and distraction-free workspace.
            </p>
          </div>
        </div>

        {/* Platform-Specific Step-by-Step Instructions */}
        {isIOS ? (
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase font-semibold text-[var(--accent-color,#E6C76B)] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How to Install on iPhone &amp; iPad (Safari)</span>
            </div>

            <ol className="space-y-2.5 font-mono text-xs text-[#ECEBE4]">
              <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#20211D] border border-[#353630]/70">
                <span className="w-5 h-5 rounded-full bg-[#272824] border border-[#353630] text-[var(--accent-color,#E6C76B)] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div className="space-y-0.5">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span>Tap the Safari</span>
                    <strong className="text-[var(--accent-color,#E6C76B)] inline-flex items-center gap-1">
                      Share <Share className="w-3.5 h-3.5 inline" />
                    </strong>
                    <span>button</span>
                  </span>
                  <p className="text-[#989A92] text-[11px]">
                    Located at the bottom of the screen on iPhone, or top toolbar on iPad.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#20211D] border border-[#353630]/70">
                <span className="w-5 h-5 rounded-full bg-[#272824] border border-[#353630] text-[var(--accent-color,#E6C76B)] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div className="space-y-0.5">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span>Scroll down and tap</span>
                    <strong className="text-[var(--accent-color,#E6C76B)] inline-flex items-center gap-1">
                      Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline" />
                    </strong>
                  </span>
                  <p className="text-[#989A92] text-[11px]">
                    This adds the RizKey icon with native launch configuration.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#20211D] border border-[#353630]/70">
                <span className="w-5 h-5 rounded-full bg-[#272824] border border-[#353630] text-[var(--accent-color,#E6C76B)] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div className="space-y-0.5">
                  <span className="font-semibold">Tap &ldquo;Add&rdquo; in the top-right corner</span>
                  <p className="text-[#989A92] text-[11px]">
                    RizKey will be installed on your home screen with full offline capability.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase font-semibold text-[var(--accent-color,#E6C76B)] flex items-center gap-1.5">
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>How to Install on Desktop &amp; Android</span>
            </div>

            <ol className="space-y-2.5 font-mono text-xs text-[#ECEBE4]">
              <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#20211D] border border-[#353630]/70">
                <span className="w-5 h-5 rounded-full bg-[#272824] border border-[#353630] text-[var(--accent-color,#E6C76B)] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <span className="font-semibold">Check your browser&apos;s address bar</span>
                  <p className="text-[#989A92] text-[11px] mt-0.5">
                    In Chrome, Edge, or Brave, click the <strong>Install</strong> or <strong>App available</strong> icon on the right side of the URL bar.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#20211D] border border-[#353630]/70">
                <span className="w-5 h-5 rounded-full bg-[#272824] border border-[#353630] text-[var(--accent-color,#E6C76B)] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <span className="font-semibold">Or use the browser menu</span>
                  <p className="text-[#989A92] text-[11px] mt-0.5">
                    Click the three dots (<strong className="text-[#ECEBE4]">&vellip;</strong>) in the top-right corner &rarr; select <strong>&ldquo;Save and share&rdquo;</strong> &rarr; <strong>&ldquo;Install RizKey&rdquo;</strong>.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#353630] text-center font-mono text-[11px]">
          <div className="p-2 rounded-lg bg-[#20211D] border border-[#353630]">
            <Zap className="w-3.5 h-3.5 text-[var(--accent-color,#E6C76B)] mx-auto mb-1" />
            <span className="text-[#ECEBE4] block font-semibold">Instant Launch</span>
            <span className="text-[#7E8079] text-[10px]">Zero lag</span>
          </div>

          <div className="p-2 rounded-lg bg-[#20211D] border border-[#353630]">
            <WifiOff className="w-3.5 h-3.5 text-[#5DBE76] mx-auto mb-1" />
            <span className="text-[#ECEBE4] block font-semibold">Offline Ready</span>
            <span className="text-[#7E8079] text-[10px]">Practice anywhere</span>
          </div>

          <div className="p-2 rounded-lg bg-[#20211D] border border-[#353630]">
            <Maximize2 className="w-3.5 h-3.5 text-sky-400 mx-auto mb-1" />
            <span className="text-[#ECEBE4] block font-semibold">Clean Window</span>
            <span className="text-[#7E8079] text-[10px]">No tab clutter</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-[#353630] flex items-center justify-end">
          <Button variant="secondary" size="sm" onClick={closeInstallModal}>
            Got It
          </Button>
        </div>
      </div>
    </Modal>
  );
};
