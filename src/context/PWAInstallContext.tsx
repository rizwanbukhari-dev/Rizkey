import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { BeforeInstallPromptEvent, PWAContextValue, InstallationStatus } from '../types/pwa';
import { useToast } from './ToastContext';

const PWAContext = createContext<PWAContextValue | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent || '';
    return (
      /iPad|iPhone|iPod/.test(userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
    );
  });
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });
  const [installationStatus, setInstallationStatus] = useState<InstallationStatus>(() => {
    if (typeof window === 'undefined') return 'uninstalled';
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    return isStandaloneMode ? 'installed' : 'uninstalled';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Synchronize ref with state
  useEffect(() => {
    deferredPromptRef.current = deferredPrompt;
  }, [deferredPrompt]);

  // Event listeners on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Media query change listener for display mode
    const matchMediaDisplay = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      if (e.matches) {
        setIsInstalled(true);
        setInstallationStatus('installed');
        setIsInstallable(false);
      }
    };

    matchMediaDisplay.addEventListener('change', handleDisplayModeChange);

    // Capture standard PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      deferredPromptRef.current = promptEvent;
      setIsInstallable(true);
      setInstallationStatus('uninstalled');
    };

    // Capture appinstalled event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      deferredPromptRef.current = null;
      setIsInstallable(false);
      setIsInstalled(true);
      setInstallationStatus('installed');
      setIsModalOpen(false);
      toast.success('RizKey has been installed successfully! Launch it anytime from your home screen or apps.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register Service Worker safely
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast.info('New RizKey update available! Restart app to apply.');
                }
              });
            }
          });
        })
        .catch((err) => {
          // Keep logging minimal to avoid console noise
          console.debug('[PWA] Service worker registration note:', err);
        });
    }

    return () => {
      matchMediaDisplay.removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const openInstallModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeInstallModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const promptInstall = useCallback(async () => {
    // If the browser provides a native deferred prompt (Chrome, Edge, Android Chrome, Samsung Internet)
    const prompt = deferredPromptRef.current;
    if (prompt) {
      try {
        setInstallationStatus('installing');
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          deferredPromptRef.current = null;
          setIsInstallable(false);
          // Note: toast.success will also fire on 'appinstalled'
        } else {
          setInstallationStatus('uninstalled');
          toast.info('Installation cancelled. You can install anytime from the header.');
        }
      } catch (err) {
        console.error('[PWA] Installation prompt error:', err);
        setInstallationStatus('uninstalled');
        openInstallModal();
      }
    } else {
      // Browser does not support programmatic beforeinstallprompt (e.g. iOS Safari, Firefox, or already prompted)
      openInstallModal();
    }
  }, [openInstallModal, toast]);

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        installationStatus,
        isIOS,
        isStandalone,
        isModalOpen,
        openInstallModal,
        closeInstallModal,
        promptInstall,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWAInstall = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAInstall must be used within a PWAProvider');
  }
  return context;
};
