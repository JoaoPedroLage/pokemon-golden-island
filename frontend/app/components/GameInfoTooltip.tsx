'use client';

import React, { useState } from 'react';

interface GameInfoTooltipProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const GameInfoTooltip: React.FC<GameInfoTooltipProps> = ({ isOpen: externalIsOpen, onClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'pt'>('en');
  
  // Function to toggle tooltip state (always uses internal state for button)
  const toggleTooltip = () => {
    setInternalIsOpen(!internalIsOpen);
  };
  
  // If state is externally controlled, show when external OR internal is open
  // Otherwise, use only internal state
  const displayIsOpen = externalIsOpen !== undefined 
    ? (externalIsOpen || internalIsOpen) 
    : internalIsOpen;

  const content = {
    en: {
      title: 'Game Information',
      navigation: {
        title: 'Navigation',
        content: 'Use WASD keys or Arrow keys to move around the map.'
      },
      resources: {
        title: 'Resources',
        content: 'You start with 30 Pokeballs and 5 Berries.'
      },
      catching: {
        title: 'Catching Pokemon',
        content: 'When you catch a Pokemon, you may receive random rewards: 2-10 Pokeballs and 2-5 Berries.'
      },
      releasing: {
        title: 'Releasing Pokemon',
        content: 'When you release a Pokemon, you are guaranteed to receive rewards: 2-10 Pokeballs and 2-5 Berries.'
      }
    },
    pt: {
      title: 'Informações do Jogo',
      navigation: {
        title: 'Navegação',
        content: 'Use as teclas WASD ou as setas do teclado para se mover pelo mapa.'
      },
      resources: {
        title: 'Recursos',
        content: 'Você começa com 30 Pokebolas e 5 Berries.'
      },
      catching: {
        title: 'Capturando Pokemon',
        content: 'Ao capturar um Pokemon, você pode receber recompensas aleatórias: 2-10 Pokebolas e 2-5 Berries.'
      },
      releasing: {
        title: 'Libertando Pokemon',
        content: 'Ao libertar um Pokemon, você tem garantia de receber recompensas: 2-10 Pokebolas e 2-5 Berries.'
      }
    }
  };

  const currentContent = content[language];

  return (
    <div className="absolute top-4 right-4 z-50">
      {/* Info Button - apenas desktop */}
      <button
        onClick={toggleTooltip}
        className="hidden md:flex w-12 h-12 rounded-full items-center justify-center text-2xl font-bold transition-all hover:scale-110 shadow-lg"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--text-inverse)',
          border: '2px solid var(--border-medium)'
        }}
        aria-label="Game Information"
      >
        ℹ️
      </button>

      {/* Tooltip Content */}
      {displayIsOpen && (
        <div
          className="fixed md:absolute top-16 right-4 md:right-0 w-[calc(100vw-2rem)] md:w-80 max-w-[90vw] rounded-lg shadow-2xl p-4 md:p-6 overflow-y-auto max-h-[70vh] md:max-h-[80vh]"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '2px solid var(--border-medium)',
            color: 'var(--text-primary)',
            zIndex: 60
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {currentContent.title}
            </h3>
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
                className="px-2 py-1 rounded text-xs font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)'
                }}
              >
                {language === 'en' ? 'PT' : 'EN'}
              </button>
              {/* Close Button */}
              <button
                onClick={() => {
                  if (onClose) {
                    onClose();
                  } else {
                    setInternalIsOpen(false);
                  }
                  setInternalIsOpen(false); // Ensures internal state is also reset
                }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--danger)',
                  color: 'var(--text-inverse)'
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-4">
            {/* Navigation */}
            <div>
              <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--primary)' }}>
                {currentContent.navigation.title}
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {currentContent.navigation.content}
              </p>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--primary)' }}>
                {currentContent.resources.title}
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {currentContent.resources.content}
              </p>
            </div>

            {/* Catching */}
            <div>
              <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--primary)' }}>
                {currentContent.catching.title}
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {currentContent.catching.content}
              </p>
            </div>

            {/* Releasing */}
            <div>
              <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--primary)' }}>
                {currentContent.releasing.title}
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {currentContent.releasing.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInfoTooltip;

