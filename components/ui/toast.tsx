'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (options: { title: string; description?: string; type?: ToastType }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, type = 'info' }: { title: string; description?: string; type?: ToastType }) => {
      const id = 'toast-' + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev.slice(-3), { id, title, description, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((title: string, description?: string) => toast({ title, description, type: 'success' }), [toast]);
  const error = useCallback((title: string, description?: string) => toast({ title, description, type: 'error' }), [toast]);
  const info = useCallback((title: string, description?: string) => toast({ title, description, type: 'info' }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-200 bg-white text-slate-900',
              t.type === 'success' && 'border-emerald-200/80 shadow-emerald-500/5',
              t.type === 'error' && 'border-rose-200/80 shadow-rose-500/5',
              t.type === 'info' && 'border-indigo-200/80 shadow-indigo-500/5'
            )}
          >
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              <p className="font-semibold text-slate-900">{t.title}</p>
              {t.description && <p className="text-slate-500 mt-0.5">{t.description}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0 p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      toast: console.log,
      success: console.log,
      error: console.error,
      info: console.info,
    };
  }
  return context;
}
