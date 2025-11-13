import React, { useState } from 'react';
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
    router.push('/');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'var(--bg-overlay)' }}
    >
      <div
        className="rounded-lg shadow-2xl md:w-4/5 lg:w-3/4 w-[95vw] h-[85vh] flex flex-col overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '2px solid var(--border-medium)'
        }}
      >
        {/* Fixed Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b-2"
          style={{
            borderColor: 'var(--border-medium)',
            backgroundColor: 'var(--bg-secondary)'
          }}
        >

          {/* Left Side - Pokedex and Total */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <h2
                className="text-3xl font-bold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                Pokedex
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Total Pokemon: <span className="font-semibold" style={{ color: 'var(--primary)' }}>{totalPokemons}</span>
              </p>
            </div>
          </div>

          {/* Right Side - Pokeballs and Berries */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-inverse)'
                }}
              >
                <Image src={pokeballImage} alt="Pokeball" width={20} height={20} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Pokeballs</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {pokeballs}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: 'var(--success)',
                  color: 'var(--text-inverse)'
                }}
              >
                🍓
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Berries</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {berries}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {capturedPokemons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div
                className="text-6xl mb-4"
                style={{ opacity: 0.3 }}
              >
                📦
              </div>
              <p
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                No Pokemon captured yet
              </p>
              <p
                className="text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Catch Pokemon to see them here!
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Total Caught: <span style={{ color: 'var(--primary)' }}>{totalCaptured}</span>
                </p>
              </div>

              {/* List of captured Pokemon */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {capturedPokemons.map((pokemon: Pokemon) => (
                  <div
                    key={pokemon.name}
                    className="pokedex-item p-4 rounded-lg shadow-md flex flex-col items-center transition-transform hover:scale-105"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '2px solid var(--border-light)'
                    }}
                  >
                    <div className="relative w-full flex justify-center mb-3">
                      <Image
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        width={120}
                        height={120}
                        className="object-contain"
                      />
                      {pokemon.quantity > 1 && (
                        <div
                          className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            backgroundColor: 'var(--primary)',
                            color: 'var(--text-inverse)'
                          }}
                        >
                          {pokemon.quantity}
                        </div>
                      )}
                    </div>

                    <h3
                      className="text-lg font-semibold mb-2 text-center capitalize"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {pokemon.name}
                    </h3>

                    <p
                      className="text-sm text-center mb-3 px-2 py-1 rounded"
                      style={{
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-primary)'
                      }}
                    >
                      {pokemon.type}
                    </p>

                    <button
                      className="mt-auto px-4 py-2 rounded text-base font-medium transition-all hover:opacity-90 w-full"
                      style={{
                        backgroundColor: 'var(--danger)',
                        color: 'var(--text-inverse)',
                        border: '1px solid var(--border-medium)'
                      }}
                      onClick={() => releasePokemon(pokemon.name)}
                    >
                      Free Pokemon
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Fixed Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t-2"
          style={{
            borderColor: 'var(--border-medium)',
            backgroundColor: 'var(--bg-secondary)'
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
            className="md:hidden px-4 py-2 rounded-lg transition-all hover:opacity-90 font-medium"
            style={{
              backgroundColor: 'var(--gray-500)',
              color: 'var(--text-inverse)',
              border: '2px solid var(--border-medium)',
            }}
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !playerId || capturedPokemons.length === 0}
              className="px-6 py-2 rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
              className="px-6 py-2 rounded-lg transition-all hover:opacity-90 font-medium"
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
