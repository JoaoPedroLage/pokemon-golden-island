'use client';

import React, { useContext, useState, useEffect } from 'react';
import Toast from './Toast';
import { GameContext } from '../context/GameContext';

const ToastContainer: React.FC = () => {
  const context = useContext(GameContext);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
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
    <div 
      className="fixed z-50 flex flex-col gap-2 pointer-events-none"
      style={{
        top: isMobile ? '50%' : '1rem',
        left: isMobile ? '50%' : 'auto',
        right: isMobile ? 'auto' : '1rem',
        transform: isMobile ? 'translate(-50%, -50%) rotate(90deg)' : 'none',
        transformOrigin: isMobile ? 'center center' : 'initial',
        marginTop: isMobile ? '3rem' : '0',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={handleClose} isMobile={isMobile} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

