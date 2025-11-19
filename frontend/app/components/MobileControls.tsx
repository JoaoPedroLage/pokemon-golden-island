'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import pokedexImage from '../images/pokedex-icon.jpg';

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
}) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs for all directional buttons
  const upButtonRef = useRef<HTMLButtonElement>(null);
  const downButtonRef = useRef<HTMLButtonElement>(null);
  const leftButtonRef = useRef<HTMLButtonElement>(null);
  const rightButtonRef = useRef<HTMLButtonElement>(null);

  // Refs to track timers for delayed stop
  const stopTimersRef = useRef<{ [key: string]: NodeJS.Timeout | null }>({
    up: null,
    down: null,
    left: null,
    right: null,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Setup native touch event listeners with { passive: false }
  useEffect(() => {
    if (!isMobile) return;

    const setupButton = (
      buttonRef: React.RefObject<HTMLButtonElement>,
      direction: 'up' | 'down' | 'left' | 'right'
    ) => {
      const button = buttonRef.current;
      if (!button) return;

      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Clear any existing timer for this direction
        if (stopTimersRef.current[direction]) {
          clearTimeout(stopTimersRef.current[direction]!);
          stopTimersRef.current[direction] = null;
        }
        
        onMove(direction);
      };

      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Instead of stopping immediately, delay the stop by 100ms
        // This gives enough time for battle detection to happen (like holding keyboard key)
        stopTimersRef.current[direction] = setTimeout(() => {
          onStop(direction);
          stopTimersRef.current[direction] = null;
        }, 100); // 100ms delay = approximately 6 frames at 60fps
      };

      // Add listeners with { passive: false } to allow preventDefault
      button.addEventListener('touchstart', handleTouchStart, { passive: false });
      button.addEventListener('touchend', handleTouchEnd, { passive: false });
      button.addEventListener('touchcancel', handleTouchEnd, { passive: false });

      // Return cleanup function
      return () => {
        // Clear any pending timers
        if (stopTimersRef.current[direction]) {
          clearTimeout(stopTimersRef.current[direction]!);
          stopTimersRef.current[direction] = null;
        }
        
        button.removeEventListener('touchstart', handleTouchStart);
        button.removeEventListener('touchend', handleTouchEnd);
        button.removeEventListener('touchcancel', handleTouchEnd);
      };
    };

    // Setup all buttons
    const cleanupUp = setupButton(upButtonRef, 'up');
    const cleanupDown = setupButton(downButtonRef, 'down');
    const cleanupLeft = setupButton(leftButtonRef, 'left');
    const cleanupRight = setupButton(rightButtonRef, 'right');

    // Cleanup all listeners
    return () => {
      cleanupUp?.();
      cleanupDown?.();
      cleanupLeft?.();
      cleanupRight?.();
    };
  }, [isMobile, onMove, onStop]);

  if (!isMobile) return null;

  return (
    <>
      {/* Movement Controls - Top Left (rotated 90deg clockwise) */}
      <div 
        className="fixed z-50 md:hidden touch-none"
        style={{
          top: '1rem',
          left: '1rem',
          width: 'auto',
          height: 'auto',
          transform: 'rotate(90deg)',
          transformOrigin: 'center center',
        }}
      >
        <div 
          className="relative"
          style={{
            width: '9rem',
            height: '9rem',
          }}
        >
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
            ref={upButtonRef}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 rounded-lg flex items-center justify-center transition-all active:scale-90 select-none"
            style={{
              width: '3rem',
              height: '3rem',
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
            ref={downButtonRef}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded-lg flex items-center justify-center transition-all active:scale-90 select-none"
            style={{
              width: '3rem',
              height: '3rem',
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
            ref={leftButtonRef}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 rounded-lg flex items-center justify-center transition-all active:scale-90 select-none"
            style={{
              width: '3rem',
              height: '3rem',
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
            ref={rightButtonRef}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 rounded-lg flex items-center justify-center transition-all active:scale-90 select-none"
            style={{
              width: '3rem',
              height: '3rem',
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

      {/* Pokedex Button - Bottom Left (rotated 90deg clockwise) */}
      <button
        onClick={onOpenPokedex}
        className="fixed md:hidden rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg select-none overflow-hidden"
        style={{
          width: '3rem',
          height: '3rem',
          bottom: '1rem',
          left: '1rem',
          transform: 'rotate(90deg)',
          transformOrigin: 'center center',
          backgroundColor: 'rgba(59, 130, 246, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          color: 'var(--text-inverse)',
          zIndex: isPokedexOpen ? 10 : 50,
        }}
        aria-label={isPokedexOpen ? 'Close Pokedex' : 'Open Pokedex'}
      >
        <Image 
          src={pokedexImage}
          alt="Pokedex" 
          width={48}
          height={48}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </button>

      {/* Tooltip Button - Bottom Right (rotated 90deg clockwise) */}
      <button
        onClick={onToggleTooltip}
        className="fixed z-50 md:hidden rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg select-none"
        style={{
          width: '3rem',
          height: '3rem',
          bottom: '1rem',
          right: '1rem',
          transform: 'rotate(90deg)',
          transformOrigin: 'center center',
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          color: 'var(--text-inverse)',
        }}
        aria-label="Game Information"
      >
        <span className="text-xl sm:text-2xl">ℹ️</span>
      </button>
    </>
  );
};

export default MobileControls;


