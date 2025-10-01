import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useSimpleNotificationStore } from '../store/simpleNotificationStore';

// Simple toast types
export type SimpleToastType = 'success' | 'error';

export interface SimpleToast {
  id: string;
  type: SimpleToastType;
  message: string;
}

interface ToastContextType {
  toasts: SimpleToast[];
  showToast: (message: string, type?: SimpleToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function SimpleToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<SimpleToast[]>([]);
  const { addNotification } = useSimpleNotificationStore();

  const showToast = useCallback((message: string, type: SimpleToastType = 'success') => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Also add to notifications for persistence
    addNotification(message);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, [addNotification]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: SimpleToast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: SimpleToast; onRemove: (id: string) => void }) {
  const isSuccess = toast.type === 'success';
  
  return (
    <div
      className={`
        p-4 max-w-sm w-full rounded-lg shadow-lg border transform transition-all duration-300 ease-out
        ${isSuccess 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
        }
        animate-slide-in
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isSuccess ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        
        <button
          onClick={() => onRemove(toast.id)}
          className="text-current opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function useSimpleToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useSimpleToast must be used within a SimpleToastProvider');
  }
  return context;
}