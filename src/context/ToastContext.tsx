import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (msg: string, duration?: number) => void;
    error: (msg: string, duration?: number) => void;
    info: (msg: string, duration?: number) => void;
    warning: (msg: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3200) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (msg: string, dur?: number) => showToast(msg, 'success', dur),
    error: (msg: string, dur?: number) => showToast(msg, 'error', dur),
    info: (msg: string, dur?: number) => showToast(msg, 'info', dur),
    warning: (msg: string, dur?: number) => showToast(msg, 'warning', dur),
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#5DBE76] shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-[#E55858] shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  };

  const borders = {
    success: 'border-[#5DBE76]/40 bg-[#272824]',
    error: 'border-[#E55858]/40 bg-[#272824]',
    warning: 'border-amber-400/40 bg-[#272824]',
    info: 'border-sky-400/40 bg-[#272824]',
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toast }}>
      {children}
      {/* Toast container overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md animate-slideInRight ${borders[t.type]}`}
          >
            <div className="flex items-center gap-2.5">
              {icons[t.type]}
              <span className="text-xs font-mono text-[#ECEBE4] font-medium leading-relaxed">
                {t.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#989A92] hover:text-[#ECEBE4] p-1 rounded-md transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
