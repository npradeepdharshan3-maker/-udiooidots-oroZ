import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-neutral-900/95',
    error: 'border-rose-500/30 bg-neutral-900/95',
    info: 'border-sky-500/30 bg-neutral-900/95',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md text-sm text-neutral-100 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${borders[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1">
        <p className="font-medium text-xs text-neutral-100">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-neutral-400 mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-neutral-500 hover:text-neutral-300 transition-colors p-0.5"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
