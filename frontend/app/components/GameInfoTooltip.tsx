'use client';

import React, { useState, useEffect } from 'react';

interface GameInfoTooltipProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const GameInfoTooltip: React.FC<GameInfoTooltipProps> = ({ isOpen: externalIsOpen, onClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'pt'>('en');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
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
      mapView: {
        title: 'Map View',
        content: 'Toggle between full map view and fog of war view using the map button. In fog of war mode, only explored areas are visible, creating an authentic Pokémon-style experience.'
      },
      resources: {
        title: 'Resources',
        content: 'You start with 30 Pokeballs and 5 Berries.'
      },
      berries: {
        title: 'How Berries Work',
        content: 'Berries increase your catch chance by 5-15% per berry, up to a maximum bonus of 50%. Each berry adds to your bonus cumulatively. Save your berries for rare Pokémon!'
      },
      difficulty: {
        title: 'Catch Difficulty',
        content: 'Common Pokémon: 30% base catch rate. Rare types (Dragon, Ghost, Psychic): 15% base catch rate. Mythical: 10% base catch rate. Legendary: 5% base catch rate. Use berries wisely on harder catches!'
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
      mapView: {
        title: 'Visualização do Mapa',
        content: 'Alterne entre visualização completa do mapa e visão com neblina usando o botão do mapa. No modo neblina, apenas áreas exploradas são visíveis, criando uma experiência autêntica estilo Pokémon.'
      },
      resources: {
        title: 'Recursos',
        content: 'Você começa com 30 Pokebolas e 5 Berries.'
      },
      berries: {
        title: 'Como as Berries Funcionam',
        content: 'Berries aumentam sua chance de captura em 5-15% por berry, até um bônus máximo de 50%. Cada berry adiciona ao seu bônus cumulativamente. Guarde suas berries para Pokémon raros!'
      },
      difficulty: {
        title: 'Dificuldade de Captura',
        content: 'Pokémon comuns: 30% de taxa base de captura. Tipos raros (Dragão, Fantasma, Psíquico): 15% de taxa base. Míticos: 10% de taxa base. Lendários: 5% de taxa base. Use berries sabiamente nas capturas mais difíceis!'
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
      {/* Info Button - desktop only */}
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
          className="fixed md:absolute top-16 right-4 md:right-0 rounded-lg shadow-2xl"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '2px solid var(--border-medium)',
            color: 'var(--text-primary)',
            zIndex: 60,
            transform: isMobile ? 'translate(-50%, -50%) rotate(90deg)' : 'none',
            transformOrigin: isMobile ? 'center center' : 'top right',
            top: isMobile ? '50%' : undefined,
            left: isMobile ? '50%' : undefined,
            right: isMobile ? 'auto' : undefined,
            boxSizing: 'border-box',
            // On mobile with 90deg rotation: width becomes height, height becomes width
            // iPhone SE: 375x667 (portrait) or 667x375 (landscape)
            // After rotation: width (80vh) becomes height, height (80vw) becomes width
            // Using 80% to ensure it fits with border and padding
            width: isMobile ? '80vh' : '20rem',
            maxWidth: isMobile ? '80vh' : '20rem',
            height: isMobile ? '80vw' : 'auto',
            maxHeight: isMobile ? '80vw' : '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            padding: 0,
            margin: 0,
            contain: 'layout style size', // CSS containment to prevent overflow
          }}
        >
          {/* Scrollable Content Wrapper */}
          <div
            style={{
              overflowY: 'auto',
              overflowX: 'hidden',
              flex: 1,
              minHeight: 0,
              WebkitOverflowScrolling: 'touch',
              padding: isMobile ? '0.75rem' : '1.5rem',
              boxSizing: 'border-box',
              width: '100%',
              height: '100%',
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

            {/* Map View */}
            <div>
              <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--primary)' }}>
                {currentContent.mapView.title}
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {currentContent.mapView.content}
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

            {/* Berries */}
            <div>
              <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--primary)' }}>
                {currentContent.berries.title}
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {currentContent.berries.content}
              </p>
            </div>

            {/* Difficulty */}
            <div>
              <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--primary)' }}>
                {currentContent.difficulty.title}
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {currentContent.difficulty.content}
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
        </div>
      )}
    </div>
  );
};

export default GameInfoTooltip;

