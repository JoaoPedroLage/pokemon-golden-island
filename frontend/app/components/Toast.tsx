import React, { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-remove after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(toast.id), 300); // Wait for exit animation
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const getToastStyles = () => {
    const baseStyles = {
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      border: '2px solid',
    };

    switch (toast.type) {
      case 'success':
        return {
          ...baseStyles,
          borderColor: 'var(--success)',
        };
      case 'error':
        return {
          ...baseStyles,
          borderColor: 'var(--danger)',
        };
      default:
        return {
          ...baseStyles,
          borderColor: 'var(--primary)',
        };
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
      style={getToastStyles()}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(toast.id), 300);
          }}
          className="text-lg font-bold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;


