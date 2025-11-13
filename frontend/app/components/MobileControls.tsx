'use client';

import React, { useState, useEffect } from 'react';

interface MobileControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onStop: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onOpenPokedex: () => void;
  onToggleTooltip: () => void;
  isPokedexOpen: boolean;
  isLandscape?: boolean;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onStop,
  onOpenPokedex,
  onToggleTooltip,
  isPokedexOpen,
  isLandscape = false,
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

  const handleTouchEnd = (direction: 'up' | 'down' | 'left' | 'right') => {
    onStop(direction);
  };

  return (
    <>
      {/* Movement Controls - Bottom Left */}
      <div 
        className="fixed z-40 md:hidden touch-none"
        style={{
          bottom: isLandscape ? '50%' : '1rem',
          left: isLandscape ? '1rem' : '1rem',
          transform: isLandscape ? 'translateY(50%) rotate(-90deg)' : 'none',
          transformOrigin: isLandscape ? 'center center' : 'none',
        }}
      >
        <div className="relative w-36 h-36 sm:w-40 sm:h-40">
          {/* Center circle */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(1px)',
            }}
          />

          {/* Up Arrow */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTouchStart('up');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTouchEnd('up');
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTouchEnd('up');
            }}
            onMouseDown={() => handleTouchStart('up')}
            onMouseUp={() => handleTouchEnd('up')}
            onMouseLeave={() => handleTouchEnd('up')}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center transition-all active:scale-90 select-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(1px)',
              border: '2px solid rgba(255, 255, 255, 0.25)',
            }}
            aria-label="Move up"
          >
            <span className="text-xl sm:text-2xl" style={{ color: 'var(--text-primary)' }}>↑</span>
          </button>

          {/* Down Arrow */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTouchStart('down');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTouchEnd('down');
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTouchEnd('down');
            }}
            onMouseDown={() => handleTouchStart('down')}
            onMouseUp={() => handleTouchEnd('down')}
            onMouseLeave={() => handleTouchEnd('down')}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center transition-all active:scale-90 select-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(1px)',
              border: '2px solid rgba(255, 255, 255, 0.25)',
            }}
            aria-label="Move down"
          >
            <span className="text-xl sm:text-2xl" style={{ color: 'var(--text-primary)' }}>↓</span>
          </button>

          {/* Left Arrow */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTouchStart('left');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTouchEnd('left');
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTouchEnd('left');
            }}
            onMouseDown={() => handleTouchStart('left')}
            onMouseUp={() => handleTouchEnd('left')}
            onMouseLeave={() => handleTouchEnd('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center transition-all active:scale-90 select-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(1px)',
              border: '2px solid rgba(255, 255, 255, 0.25)',
            }}
            aria-label="Move left"
          >
            <span className="text-xl sm:text-2xl" style={{ color: 'var(--text-primary)' }}>←</span>
          </button>

          {/* Right Arrow */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTouchStart('right');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTouchEnd('right');
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTouchEnd('right');
            }}
            onMouseDown={() => handleTouchStart('right')}
            onMouseUp={() => handleTouchEnd('right')}
            onMouseLeave={() => handleTouchEnd('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center transition-all active:scale-90 select-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(1px)',
              border: '2px solid rgba(255, 255, 255, 0.25)',
            }}
            aria-label="Move right"
          >
            <span className="text-xl sm:text-2xl" style={{ color: 'var(--text-primary)' }}>→</span>
          </button>
        </div>
      </div>

      {/* Action Buttons - Bottom Right */}
      <div 
        className="fixed z-40 md:hidden flex gap-3"
        style={{
          flexDirection: isLandscape ? 'row' : 'column',
          bottom: isLandscape ? '50%' : '1rem',
          right: isLandscape ? '1rem' : '1rem',
          transform: isLandscape ? 'translateY(50%) rotate(-90deg)' : 'none',
          transformOrigin: isLandscape ? 'center center' : 'none',
        }}
      >
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

