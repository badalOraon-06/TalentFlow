import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  autoClose?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

// Toast context types
interface ToastState {
  toasts: Toast[];
}

type ToastAction = 
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'CLEAR_ALL' };

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  // Convenience methods
  success: (title: string, message?: string, options?: Partial<Toast>) => string;
  error: (title: string, message?: string, options?: Partial<Toast>) => string;
  warning: (title: string, message?: string, options?: Partial<Toast>) => string;
  info: (title: string, message?: string, options?: Partial<Toast>) => string;
}

// Toast reducer
const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload]
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        toasts: []
      };
    default:
      return state;
  }
};

// Toast context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const addToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: Toast = {
      id,
      duration: 5000,
      autoClose: true,
      ...toastData
    };

    dispatch({ type: 'ADD_TOAST', payload: toast });

    // Auto-remove toast after duration
    if (toast.autoClose && toast.duration) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
      }, toast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, type: 'error', title, message, autoClose: false });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, type: 'info', title, message });
  }, [addToast]);

  const contextValue: ToastContextType = {
    toasts: state.toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use toast context
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Individual toast component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const getToastStyles = (type: ToastType) => {
    const styles = {
      success: {
        bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
        border: 'border-emerald-200',
        icon: CheckCircle,
        iconColor: 'text-white'
      },
      error: {
        bg: 'bg-gradient-to-r from-red-500 to-rose-600',
        border: 'border-red-200',
        icon: AlertCircle,
        iconColor: 'text-white'
      },
      warning: {
        bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
        border: 'border-amber-200',
        icon: AlertTriangle,
        iconColor: 'text-white'
      },
      info: {
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        border: 'border-blue-200',
        icon: Info,
        iconColor: 'text-white'
      }
    };
    return styles[type];
  };

  const styles = getToastStyles(toast.type);
  const Icon = styles.icon;

  useEffect(() => {
    if (toast.autoClose && toast.duration) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.autoClose, toast.duration, toast.id, onRemove]);

  return (
    <div className={`${styles.bg} rounded-xl shadow-lg border ${styles.border} p-4 min-w-80 max-w-md transform transition-all duration-300 hover:scale-105`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Icon className={`h-5 w-5 ${styles.iconColor}`} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm mb-1">
            {toast.title}
          </div>
          {toast.message && (
            <div className="text-white/90 text-sm leading-relaxed">
              {toast.message}
            </div>
          )}
          
          {toast.actions && toast.actions.length > 0 && (
            <div className="flex items-center space-x-2 mt-3">
              {toast.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    action.variant === 'primary'
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>
      
      {/* Progress bar for auto-closing toasts */}
      {toast.autoClose && toast.duration && (
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white/60 rounded-full animate-toast-progress"
            style={{
              animationDuration: `${toast.duration}ms`
            }}
          />
        </div>
      )}
    </div>
  );
}

// Toast container component
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div className="flex flex-col space-y-2 pointer-events-auto">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="animate-toast-slide-in"
          >
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ToastProvider;