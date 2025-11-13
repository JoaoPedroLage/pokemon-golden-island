'use client';

import React, { useState, useEffect } from 'react';

interface MobileControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onStop: () => void;
  onOpenPokedex: () => void;
  onToggleTooltip: () => void;
  isPokedexOpen: boolean;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onStop,
  onOpenPokedex,
  onToggleTooltip,
  isPokedexOpen,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Mostra controles mobile em telas menores que 768px (tablet e mobile)
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  const handleTouchStart = (direction: 'up' | 'down' | 'left' | 'right') => {
    onMove(direction);
  };

  const handleTouchEnd = () => {
    onStop();
  };

  return (
    <>
      {/* Movement Controls - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-40 md:hidden touch-none">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32">
          {/* Center circle */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
            }}
          />

          {/* Up Arrow */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('up');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onMouseDown={() => handleTouchStart('up')}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all active:scale-90 select-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
            }}
            aria-label="Move up"
          >
            <span className="text-xl sm:text-2xl" style={{ color: 'var(--text-primary)' }}>↑</span>
          </button>

          {/* Down Arrow */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('down');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onMouseDown={() => handleTouchStart('down')}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all active:scale-90 select-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
            }}
            aria-label="Move down"
          >
            <span className="text-xl sm:text-2xl" style={{ color: 'var(--text-primary)' }}>↓</span>
          </button>

          {/* Left Arrow */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('left');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onMouseDown={() => handleTouchStart('left')}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all active:scale-90 select-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
            }}
            aria-label="Move left"
          >
            <span className="text-xl sm:text-2xl" style={{ color: 'var(--text-primary)' }}>←</span>
          </button>

          {/* Right Arrow */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('right');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTouchEnd();
            }}
            onMouseDown={() => handleTouchStart('right')}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all active:scale-90 select-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
            }}
            aria-label="Move right"
          >
            <span className="text-xl sm:text-2xl" style={{ color: 'var(--text-primary)' }}>→</span>
          </button>
        </div>
      </div>

      {/* Action Buttons - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden flex flex-col gap-3">
        {/* Pokedex Button */}
        <button
          onClick={onOpenPokedex}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg select-none"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            color: 'var(--text-inverse)',
          }}
          aria-label={isPokedexOpen ? 'Close Pokedex' : 'Open Pokedex'}
        >
          <span className="text-xl sm:text-2xl">📖</span>
        </button>

        {/* Tooltip Button */}
        <button
          onClick={onToggleTooltip}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg select-none"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            color: 'var(--text-inverse)',
          }}
          aria-label="Game Information"
        >
          <span className="text-xl sm:text-2xl">ℹ️</span>
        </button>
      </div>
    </>
  );
};

export default MobileControls;

