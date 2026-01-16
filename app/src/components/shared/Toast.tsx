import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/helpers';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const toastIcons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-green-50',
    icon: 'text-green-500',
    border: 'border-green-200',
  },
  error: {
    bg: 'bg-red-50',
    icon: 'text-red-500',
    border: 'border-red-200',
  },
  warning: {
    bg: 'bg-amber-50',
    icon: 'text-amber-500',
    border: 'border-amber-200',
  },
  info: {
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    border: 'border-blue-200',
  },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const { id, type, title, message, duration = 5000, action } = toast;
  const Icon = toastIcons[type];
  const styles = toastStyles[type];

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'relative flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg',
        'min-w-[300px] max-w-[400px]',
        styles.bg,
        styles.border
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30"
          initial={{ width: '100%' }}
          animate={{ width: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          style={{ color: styles.icon.replace('text-', '') }}
        />
      )}

      <div className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {message && (
          <p className="mt-1 text-sm text-gray-600">{message}</p>
        )}
        {action && (
          <motion.button
            onClick={action.onClick}
            className={cn(
              'mt-2 text-sm font-medium',
              styles.icon,
              'hover:underline focus:outline-none focus:underline'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {action.label}
          </motion.button>
        )}
      </div>

      <motion.button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 p-1 rounded hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </motion.button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

const positionStyles: Record<string, string> = {
  'top-right': 'top-4 right-4 items-end',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'top-left': 'top-4 left-4 items-start',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-left': 'bottom-4 left-4 items-start',
};

export function ToastContainer({
  toasts,
  onDismiss,
  position = 'top-right',
}: ToastContainerProps) {
  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 pointer-events-none',
        positionStyles[position]
      )}
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = React.useCallback(
    (title: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'success', title, ...options }),
    [addToast]
  );

  const error = React.useCallback(
    (title: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'error', title, ...options }),
    [addToast]
  );

  const warning = React.useCallback(
    (title: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'warning', title, ...options }),
    [addToast]
  );

  const info = React.useCallback(
    (title: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'info', title, ...options }),
    [addToast]
  );

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  };
}
