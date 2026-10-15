import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration || 5000), [addToast]);
  const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => {
          const typeConfig = {
            success: {
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
              bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
              bar: 'bg-emerald-500'
            },
            error: {
              icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
              bg: 'bg-rose-50 border-rose-200 text-rose-900',
              bar: 'bg-rose-500'
            },
            warning: {
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
              bg: 'bg-amber-50 border-amber-200 text-amber-900',
              bar: 'bg-amber-500'
            },
            info: {
              icon: <Info className="w-5 h-5 text-teal-600 flex-shrink-0" />,
              bg: 'bg-teal-50 border-teal-200 text-teal-900',
              bar: 'bg-teal-500'
            }
          }[toast.type] || {
            icon: <Info className="w-5 h-5 text-teal-600 flex-shrink-0" />,
            bg: 'bg-teal-50 border-teal-200 text-teal-900',
            bar: 'bg-teal-500'
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg shadow-slate-200/50 ${typeConfig.bg} animate-fade-in transition-all`}
            >
              {typeConfig.icon}
              <div className="flex-1 text-sm font-medium leading-snug">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
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
