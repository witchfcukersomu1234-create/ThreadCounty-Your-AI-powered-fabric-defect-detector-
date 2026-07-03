import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 min-w-[280px] max-w-sm
              ${toast.type === 'success' ? 'bg-emerald-900/80 border-emerald-500/40 text-emerald-100' : ''}
              ${toast.type === 'error' ? 'bg-red-900/80 border-red-500/40 text-red-100' : ''}
              ${toast.type === 'info' ? 'bg-primary/20 border-primary/40 text-on-surface' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle size={20} className="text-emerald-400 mt-0.5 shrink-0" />}
            {toast.type === 'error' && <XCircle size={20} className="text-red-400 mt-0.5 shrink-0" />}
            {toast.type === 'info' && <AlertCircle size={20} className="text-primary mt-0.5 shrink-0" />}
            <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity shrink-0">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
