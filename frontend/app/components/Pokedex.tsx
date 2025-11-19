import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGameContext } from '../context/GameContext';
import { Pokemon } from '../interfaces/mainInterface';
import { authAPI } from '../services/api';
import pokeballImage from '../images/pokeball.png';

const Pokedex: React.FC = () => {
  const router = useRouter();
  const {
    totalPokemons,
    capturedPokemons,
    totalCaptured,
    releasePokemon,
    saveToBackend,
    isSaving,
    playerId,
    resetGame,
    pokeballs,
    berries
  } = useGameContext(); // Acessando o contexto
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSave = async () => {
    if (!playerId) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    try {
      await saveToBackend();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleLogout = () => {
    // Clear game data
    resetGame();
    // Logout
    authAPI.logout();
    // Redirect to login page
    router.push('/login');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ 
        backgroundColor: 'var(--bg-overlay)',
        touchAction: 'none', // Prevent background scrolling
      }}
    >
      <div
        className="rounded-lg shadow-2xl flex flex-col overflow-hidden"
        style={{
          // Mobile: rotate and center, Desktop: just center
          transform: isMobile ? 'translate(-50%, -50%) rotate(90deg)' : 'translate(-50%, -50%)',
          transformOrigin: 'center center',
          position: 'fixed',
          top: '50%',
          left: '50%',
          right: 'auto',
          // On mobile with 90deg rotation: width becomes height, height becomes width
          // Use vh for width and vw for height when rotated
          width: isMobile ? '90vh' : '80vw',
          maxWidth: isMobile ? '90vh' : '80vw',
          height: isMobile ? '90vw' : '85vh',
          maxHeight: isMobile ? '90vw' : 'calc(100vh - 4rem)',
          backgroundColor: 'var(--bg-primary)',
          border: '2px solid var(--border-medium)',
          overflow: 'hidden',
          boxSizing: 'border-box',
          touchAction: 'none', // Prevent dragging the modal itself
        }}
      >
        {/* Fixed Header */}
        <div
          className="flex items-center justify-between border-b-2"
          style={{
            padding: isMobile ? '0.75rem' : '1.5rem',
            borderColor: 'var(--border-medium)',
            backgroundColor: 'var(--bg-secondary)',
            flexShrink: 0,
          }}
        >

          {/* Left Side - Pokedex and Total */}
          <div className="flex items-center gap-3 md:gap-6">
            <div className="text-right">
              <h2
                className="text-xl md:text-3xl font-bold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                Pokedex
              </h2>
              <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
                Total Pokemon: <span className="font-semibold" style={{ color: 'var(--primary)' }}>{totalPokemons}</span>
              </p>
            </div>
          </div>

          {/* Right Side - Pokeballs and Berries */}
          <div className="flex items-center gap-2 md:gap-6">
            <div className="flex items-center gap-1 md:gap-2">
              <div
                className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-inverse)'
                }}
              >
                <Image src={pokeballImage} alt="Pokeball" width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Pokeballs</p>
                <p className="text-sm md:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {pokeballs}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div
                className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-sm md:text-base"
                style={{
                  backgroundColor: 'var(--success)',
                  color: 'var(--text-inverse)'
                }}
              >
                🍓
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Berries</p>
                <p className="text-sm md:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {berries}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{
            padding: isMobile ? '0.75rem' : '1.5rem',
            overflowX: 'hidden',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            boxSizing: 'border-box',
            touchAction: 'pan-y', // Allow vertical scrolling
            overscrollBehavior: 'contain', // Prevent scroll chaining
            // Add momentum scrolling for better mobile experience
            scrollBehavior: 'smooth',
            // Ensure the content is scrollable by setting a minimum height
            minHeight: 0,
          }}
          // Prevent parent from capturing touch events
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {capturedPokemons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div
                className="mb-3 md:mb-4"
                style={{ 
                  opacity: 0.3,
                  fontSize: isMobile ? '3rem' : '4rem'
                }}
              >
                📦
              </div>
              <p
                className="font-semibold mb-2 text-center"
                style={{ 
                  color: 'var(--text-primary)',
                  fontSize: isMobile ? '1rem' : '1.25rem'
                }}
              >
                No Pokemon captured yet
              </p>
              <p
                className="text-center"
                style={{ 
                  color: 'var(--text-tertiary)',
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                Catch Pokemon to see them here!
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3 md:mb-4">
                <p
                  className="font-semibold"
                  style={{ 
                    color: 'var(--text-secondary)',
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  Total Caught: <span style={{ color: 'var(--primary)' }}>{totalCaptured}</span>
                </p>
              </div>

              {/* List of captured Pokemon */}
              <div 
                className="grid md:gap-4"
                style={{
                  gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: isMobile ? '0.5rem' : '1rem',
                }}
              >
                {capturedPokemons.map((pokemon: Pokemon) => (
                  <div
                    key={pokemon.name}
                    className="pokedex-item rounded-lg shadow-md flex flex-col items-center transition-transform hover:scale-105"
                    style={{
                      padding: isMobile ? '0.5rem' : '1rem',
                      minHeight: isMobile ? '160px' : '220px', // Increased from 120px to 160px for mobile
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div className="relative w-full flex justify-center" style={{ marginBottom: isMobile ? '0.5rem' : '0.75rem' }}>
                      <Image
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        width={isMobile ? 70 : 120} // Increased from 60 to 70 for mobile
                        height={isMobile ? 70 : 120}
                        className="object-contain"
                        style={{
                          maxWidth: isMobile ? '70px' : '120px',
                          maxHeight: isMobile ? '70px' : '120px',
                        }}
                      />
                      {pokemon.quantity > 1 && (
                        <div
                          className="absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center font-bold"
                          style={{
                            width: isMobile ? '1.25rem' : '1.75rem', // Increased from 1rem to 1.25rem for mobile
                            height: isMobile ? '1.25rem' : '1.75rem',
                            fontSize: isMobile ? '0.625rem' : '0.875rem', // Increased from 0.5rem
                            backgroundColor: 'var(--primary)',
                            color: 'var(--text-inverse)'
                          }}
                        >
                          {pokemon.quantity}
                        </div>
                      )}
                    </div>

                    <h3
                      className="font-semibold text-center capitalize"
                      style={{ 
                        color: 'var(--text-primary)',
                        fontSize: isMobile ? '0.75rem' : '1.125rem', // Increased from 0.65rem to 0.75rem for mobile
                        lineHeight: isMobile ? '1.2' : '1.5',
                        marginBottom: isMobile ? '0.25rem' : '0.5rem'
                      }}
                    >
                      {pokemon.name}
                    </h3>

                    <p
                      className="text-center rounded"
                      style={{
                        fontSize: isMobile ? '0.625rem' : '0.875rem', // Increased from 0.5rem to 0.625rem for mobile
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-primary)',
                        lineHeight: isMobile ? '1.2' : '1.5',
                        padding: isMobile ? '0.25rem 0.5rem' : '0.25rem 0.5rem',
                        marginBottom: isMobile ? '0.5rem' : '0.75rem'
                      }}
                    >
                      {pokemon.type}
                    </p>

                    <button
                      className="mt-auto rounded font-medium transition-all hover:opacity-90 w-full"
                      style={{
                        padding: isMobile ? '0.375rem 0.5rem' : '0.5rem 1rem', // Increased from 0.25rem to 0.375rem for mobile
                        fontSize: isMobile ? '0.625rem' : '1rem', // Increased from 0.5rem to 0.625rem for mobile
                        backgroundColor: 'var(--danger)',
                        color: 'var(--text-inverse)',
                        border: '1px solid var(--border-medium)'
                      }}
                      onClick={() => releasePokemon(pokemon.name)}
                    >
                      Free
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Fixed Footer */}
        <div
          className="flex items-center justify-between border-t-2"
          style={{
            padding: isMobile ? '0.75rem' : '1.5rem',
            borderColor: 'var(--border-medium)',
            backgroundColor: 'var(--bg-secondary)',
            flexShrink: 0,
          }}
        >
          <div
            className="text-lg hidden md:block"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Press <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Enter</span> or <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>ESC</span> to exit
          </div>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => {
              // Closes the Pokedex - parent component controls this via setShowPokedex
              // Since we don't have direct access, we'll use a custom event
              window.dispatchEvent(new CustomEvent('closePokedex'));
            }}
            className="md:hidden px-3 py-1.5 rounded-lg transition-all hover:opacity-90 font-medium text-sm"
            style={{
              backgroundColor: 'var(--gray-500)',
              color: 'var(--text-inverse)',
              border: '2px solid var(--border-medium)',
            }}
          >
            Close
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !playerId}
              className="px-3 py-1.5 md:px-6 md:py-2 rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base"
              style={{
                backgroundColor: isSaving
                  ? 'var(--gray-400)'
                  : saveStatus === 'success'
                    ? 'var(--success)'
                    : saveStatus === 'error'
                      ? 'var(--danger)'
                      : 'var(--primary)',
                color: 'var(--text-inverse)',
                border: '2px solid',
                borderColor: 'var(--border-medium)',
              }}
            >
              {isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save'}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 md:px-6 md:py-2 rounded-lg transition-all hover:opacity-90 font-medium text-sm md:text-base"
              style={{
                backgroundColor: 'var(--danger)',
                color: 'var(--text-inverse)',
                border: '2px solid',
                borderColor: 'var(--border-medium)',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pokedex;
