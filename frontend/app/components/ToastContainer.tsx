'use client';

import React, { useContext } from 'react';
import Toast from './Toast';
import { GameContext } from '../context/GameContext';

const ToastContainer: React.FC = () => {
  const context = useContext(GameContext);
  
  // Check if context is available (if inside a GameProvider)
  if (!context || !context.toasts) {
    return null;
  }
  
  const { toasts, removeToast } = context;
  
  const handleClose = (id: string) => {
    // Remove toast using context function
    removeToast(id);
  };

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={handleClose} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

