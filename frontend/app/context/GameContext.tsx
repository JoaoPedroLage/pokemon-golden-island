import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Pokemon } from '../interfaces/mainInterface';
import { playerAPI, pokemonAPI } from '../services/api';
import { PokemonData } from '../shared/types';
import { ToastMessage } from '../components/Toast';
import ToastContainer from '../components/ToastContainer';

// Interface for data that will be shared in the context
interface GameContextProps {
  pokeballs: number;
  berries: number;
  capturedPokemons: Pokemon[]; // Changed to an array of Pokemon objects
  totalCaptured: number;
  totalPokemons: number;
  showPokedex: boolean;
  playerId: number | null;
  isLoading: boolean;
  isSaving: boolean;
  setShowPokedex: (show: boolean) => void;
  setTotalPokemons: (total: number) => void;
  releasePokemon: (name: string) => void;
  usePokeball: () => void;
  useBerry: () => void;
  addCapturedPokemon: (pokemon: Pokemon) => void; // Changed to receive a Pokemon object
  resetGame: () => void;
  addPokeballs: (amount: number) => void; // Function to add Pokeballs
  addBerry: () => void; // Function to add a Berry
  initializePlayer: (name: string) => Promise<void>;
  loadPlayer: (id: number) => Promise<void>;
  saveToBackend: () => Promise<void>; // Function to save to backend
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

// Initial context values
const initialGameState: GameContextProps = {
  pokeballs: 30,
  berries: 5,
  capturedPokemons: [],
  totalCaptured: 0,
  totalPokemons: 0,
  showPokedex: false,
  playerId: null,
  isLoading: false,
  isSaving: false,
  setShowPokedex: () => { },
  setTotalPokemons: () => { },
  usePokeball: () => { },
  useBerry: () => { },
  addCapturedPokemon: async () => { },
  resetGame: () => { },
  addPokeballs: () => { },
  addBerry: () => { },
  releasePokemon: async () => { },
  initializePlayer: async () => { },
  loadPlayer: async () => { },
  saveToBackend: async () => { },
  showToast: () => { },
  toasts: [],
  removeToast: () => { },
};

// Creating the context
export const GameContext = createContext<GameContextProps>(initialGameState);

// Constants for sessionStorage
const SESSION_STORAGE_KEY = 'pokemon_golden_island_session';

// Helper function to get the sessionStorage key based on playerId
const getSessionStorageKey = (playerId: number | null): string => {
  if (playerId) {
    return `${SESSION_STORAGE_KEY}_${playerId}`;
  }
  return SESSION_STORAGE_KEY;
};

// Helper function to save to sessionStorage
const saveToSessionStorage = (pokemons: Pokemon[], playerId: number | null = null) => {
  try {
    const key = getSessionStorageKey(playerId);
    sessionStorage.setItem(key, JSON.stringify(pokemons));
  } catch (error) {
    console.error('Error saving to sessionStorage:', error);
  }
};

// Helper function to load from sessionStorage
const loadFromSessionStorage = (playerId: number | null = null): Pokemon[] => {
  try {
    const key = getSessionStorageKey(playerId);
    const stored = sessionStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading from sessionStorage:', error);
  }
  return [];
};

// Helper function to clear sessionStorage for a specific player
const clearSessionStorage = (playerId: number | null = null) => {
  try {
    const key = getSessionStorageKey(playerId);
    sessionStorage.removeItem(key);
    // Also clears the old key (without playerId) for compatibility
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
};

// Context provider to be used in the app
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with default values - will be overwritten by loadPlayer if account has saved data
  const [pokeballs, setPokeballs] = useState<number>(30);
  const [berries, setBerries] = useState<number>(5);
  const [capturedPokemons, setCapturedPokemons] = useState<Pokemon[]>([]);
  const [totalPokemons, setTotalPokemons] = useState(0);
  const [showPokedex, setShowPokedex] = React.useState(false);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load data from sessionStorage on startup
  useEffect(() => {
    const savedPokemons = loadFromSessionStorage();
    if (savedPokemons.length > 0) {
      setCapturedPokemons(savedPokemons);
    }
  }, []);

  // Load total Pokemon from API on startup
  useEffect(() => {
    const fetchTotalPokemons = async () => {
      try {
        const allPokemons = await pokemonAPI.getAll();
        setTotalPokemons(allPokemons.length);
      } catch (error) {
        console.error('Error fetching total Pokemon:', error);
        // Fallback to 151 (total from 1st generation)
        setTotalPokemons(151);
      }
    };
    fetchTotalPokemons();
  }, []);

  // Load player from localStorage on startup (only if not already loading from login)
  useEffect(() => {
    // Small delay to ensure login process completes first
    const timer = setTimeout(() => {
      const savedPlayerId = localStorage.getItem('playerId');
      if (savedPlayerId && !playerId && !isLoading) {
        console.log('Loading player from localStorage on startup:', savedPlayerId);
        loadPlayer(Number(savedPlayerId)).catch((error) => {
          console.error('Error loading player:', error);
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to initialize a new player
  const initializePlayer = async (name: string) => {
    setIsLoading(true);
    try {
      const player = await playerAPI.create(name, 30, 5);
      setPlayerId(player.id);
      setPokeballs(player.pokeballs);
      setBerries(player.berries);
      setTotalPokemons(player.pokedex?.totalPokemons || 151);

      // ALWAYS load from backend first to ensure updated data
      const backendPokemons = player.pokedex?.capturedPokemons.map((p: PokemonData) => ({
        name: p.name,
        sprite: p.sprite,
        type: Array.isArray(p.type) ? p.type.join(', ') : p.type,
        quantity: p.quantity || 1,
      })) || [];

      // Set backend Pokemon in state
      setCapturedPokemons(backendPokemons);

      // Update sessionStorage with backend data
      saveToSessionStorage(backendPokemons, player.id);
      localStorage.setItem('playerId', player.id.toString());
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load an existing player
  const loadPlayer = async (id: number) => {
    setIsLoading(true);
    try {
      console.log(`Loading player data for ID: ${id}`);
      // ALWAYS load from backend first to ensure updated data
      const player = await playerAPI.getById(id);
      
      const pokemonCount = player.pokedex?.capturedPokemons?.length || 0;
      const hasSavedPokemons = pokemonCount > 0;
      
      console.log('Player data loaded from backend:', {
        id: player.id,
        pokeballs: player.pokeballs,
        berries: player.berries,
        pokemonCount: pokemonCount,
        hasSavedPokemons: hasSavedPokemons,
      });
      
      setPlayerId(player.id);
      
      // If player has saved pokemons, use data from backend
      // Otherwise, use default values (30 pokeballs, 5 berries) for new accounts
      if (hasSavedPokemons) {
        // Account with saved data - load from backend
        console.log('Account has saved pokemons - loading data from backend');
        setPokeballs(player.pokeballs);
        setBerries(player.berries);
      } else {
        // New account - use default values
        console.log('New account detected - using default values (30 pokeballs, 5 berries)');
        setPokeballs(30);
        setBerries(5);
      }
      
      setTotalPokemons(player.pokedex?.totalPokemons || 151);

      // Load Pokemon from backend
      const backendPokemons = player.pokedex?.capturedPokemons.map((p: PokemonData) => ({
        name: p.name,
        sprite: p.sprite,
        type: Array.isArray(p.type) ? p.type.join(', ') : p.type,
        quantity: p.quantity || 1,
      })) || [];

      console.log(`Loaded ${backendPokemons.length} Pokemon from backend`);

      // Set backend Pokemon in state
      setCapturedPokemons(backendPokemons);

      // Update sessionStorage with backend data
      saveToSessionStorage(backendPokemons, player.id);

      localStorage.setItem('playerId', player.id.toString());
      console.log('Player data loaded successfully');
    } catch (error) {
      console.error('Error loading player:', error);
      // If player doesn't exist, clear localStorage
      localStorage.removeItem('playerId');
      setPlayerId(null);
    } finally {
      setIsLoading(false);
    }
  };


  // Function to use a Pokeball
  const usePokeball = () => {
    setPokeballs((prev) => {
      const newValue = prev > 0 ? prev - 1 : 0;
      // TODO: Update in backend when there's an endpoint to update pokeballs
      return newValue;
    });
  };

  // Function to use a Berry
  const useBerry = () => {
    setBerries((prev) => {
      const newValue = prev > 0 ? prev - 1 : 0;
      // TODO: Update in backend when there's an endpoint to update berries
      return newValue;
    });
  };

  // Function to add a captured Pokemon (always saves to sessionStorage)
  const addCapturedPokemon = (pokemon: Pokemon) => {
    setCapturedPokemons((prev) => {
      // Check if the Pokemon already exists
      const existingIndex = prev.findIndex((p) => p.name === pokemon.name);
      let newPokemons: Pokemon[];

      if (existingIndex >= 0) {
        // If it exists, increment the quantity
        newPokemons = prev.map((p, index) =>
          index === existingIndex
            ? { ...p, quantity: (p.quantity || 1) + 1 }
            : p
        );
      } else {
        // If it doesn't exist, add new
        newPokemons = [...prev, { ...pokemon, quantity: 1 }];
      }

      // Save to sessionStorage immediately
      saveToSessionStorage(newPokemons, playerId);
      return newPokemons;
    });
  };

  // Function to save all captured Pokemon to backend
  const saveToBackend = async () => {
    if (!playerId) {
      console.error('Player not initialized');
      throw new Error('Player not initialized');
    }

    setIsSaving(true);
    try {
      // ALWAYS save pokeballs and berries first, regardless of Pokemon count
      try {
        await playerAPI.updateResources(playerId, pokeballs, berries);
        console.log(`Saved resources: ${pokeballs} pokeballs, ${berries} berries`);
      } catch (error) {
        console.error('Error saving pokeballs and berries:', error);
        throw error; // Throw error if resources fail to save
      }

      // Only sync Pokemon if there are any
      if (capturedPokemons.length > 0) {
        // Fetch current Pokemon from backend to compare
        const currentPlayer = await playerAPI.getById(playerId);
        const backendPokemons = currentPlayer.pokedex?.capturedPokemons || [];

        // For each local Pokemon, synchronize with backend using 'set' to define exact quantity
        for (const pokemon of capturedPokemons) {
          // Convert type to string if it's an array
          const pokemonType = Array.isArray(pokemon.type)
            ? pokemon.type.join(', ')
            : pokemon.type;

          const pokemonData: PokemonData = {
            name: pokemon.name,
            sprite: pokemon.sprite,
            type: pokemonType,
            quantity: pokemon.quantity || 1,
          };

          try {
            // Use 'set' to define exact quantity instead of incrementing
            await playerAPI.updatePokedex(
              playerId,
              pokemonData,
              'set'
            );
          } catch (error) {
            console.error(`Error saving ${pokemon.name} to backend:`, error);
            // Continue trying to save other Pokemon
          }
        }

        // Remove Pokemon that are in backend but no longer in local list
        for (const backendPokemon of backendPokemons) {
          const existsLocally = capturedPokemons.some(
            (p) => p.name === backendPokemon.name
          );

          if (!existsLocally) {
            try {
              // Remove the Pokemon that is no longer in local list
              await playerAPI.updatePokedex(
                playerId,
                backendPokemon,
                'remove'
              );
            } catch (error) {
              console.error(`Error removing ${backendPokemon.name} from backend:`, error);
            }
          }
        }
      }

      // Keep local data after saving (don't reload from backend)
      // This preserves local changes that were made (e.g., releasing Pokemon)
      // Data has already been saved to the backend, so we maintain the current local state
      // sessionStorage is already updated by the functions that modify Pokemon

      // Show success toast
      const pokemonCount = capturedPokemons.length;
      const message = pokemonCount > 0
        ? `Data saved successfully! ${pokemonCount} ${pokemonCount === 1 ? 'Pokemon was' : 'Pokemon were'} synchronized, and resources updated on the server.`
        : `Resources saved successfully! ${pokeballs} pokeballs and ${berries} berries updated on the server.`;
      
      showToast(
        message,
        'success',
        5000
      );
    } catch (error) {
      console.error('Error saving to backend:', error);
      // Show error toast
      showToast(
        'Error saving data. Please try again.',
        'error',
        5000
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Function to reset the game
  const resetGame = () => {
    setPokeballs(10);
    setBerries(5);
    setCapturedPokemons([]);
    // Clear the current player's sessionStorage
    clearSessionStorage(playerId);
    setPlayerId(null);
  };

  // Function to add Pokeballs
  const addPokeballs = (amount: number) => {
    setPokeballs((prev) => prev + amount);
  };

  // Function to add a Berry
  const addBerry = () => {
    setBerries((prev) => prev + 1);
  };

  const totalCaptured = capturedPokemons.length; // Total captured Pokemon

  // Function to show toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', duration = 5000) => {
    if (!message) return; // Don't show empty toast

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type, duration };

    setToasts((prev: ToastMessage[]) => [...prev, newToast]);
  };

  // Function to remove toast
  const removeToast = (id: string) => {
    setToasts((prev: ToastMessage[]) => prev.filter((toast: ToastMessage) => toast.id !== id));
  };

  // Function to release a Pokemon (updates sessionStorage immediately and gives rewards)
  const releasePokemon = (name: string) => {
    setCapturedPokemons((prev) => {
      const pokemonIndex = prev.findIndex((p) => p.name === name);

      if (pokemonIndex === -1) return prev; // Pokemon not found

      const pokemon = prev[pokemonIndex];
      let newPokemons: Pokemon[];

      // Calculate rewards (always give rewards when releasing a Pokemon)
      const pokeballReward = Math.floor(Math.random() * 9) + 2; // 2 to 10 pokeballs
      const berryReward = Math.floor(Math.random() * 4) + 2; // 2 to 5 berries

      // Add rewards
      addPokeballs(pokeballReward);
      for (let i = 0; i < berryReward; i++) {
        addBerry();
      }

      // If quantity is greater than 1, just decrement
      if (pokemon.quantity > 1) {
        newPokemons = prev.map((p, index) =>
          index === pokemonIndex
            ? { ...p, quantity: p.quantity - 1 }
            : p
        );
        // Show toast informing that it was released and rewards received
        const pokemonName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        showToast(
          `${pokemonName} released! You received ${pokeballReward} pokeballs and ${berryReward} berries. Remaining quantity: ${pokemon.quantity - 1}`,
          'success',
          6000
        );
      } else {
        // If quantity is 1, remove completely
        newPokemons = prev.filter((p) => p.name !== name);

        // Show toast with complete information
        const pokemonName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        showToast(
          `${pokemonName} was successfully released! You received ${pokeballReward} pokeballs and ${berryReward} berries.`,
          'success',
          6000
        );
      }

      // Save to sessionStorage immediately
      saveToSessionStorage(newPokemons, playerId);

      return newPokemons;
    });
  };

  return (
    <GameContext.Provider
      value={{
        pokeballs,
        berries,
        capturedPokemons,
        totalCaptured,
        totalPokemons,
        showPokedex,
        playerId,
        isLoading,
        isSaving,
        setShowPokedex,
        setTotalPokemons,
        usePokeball,
        useBerry,
        addCapturedPokemon,
        resetGame,
        addPokeballs,
        addBerry,
        releasePokemon,
        initializePlayer,
        loadPlayer,
        saveToBackend,
        showToast,
        toasts,
        removeToast,
      }}
    >
      {children}
      {/* ToastContainer renderizado dentro do GameProvider para garantir acesso ao contexto */}
      {typeof window !== 'undefined' && (
        <ToastContainer />
      )}
    </GameContext.Provider>
  );
};

// Hook para acessar o contexto de forma mais simples
export const useGameContext = () => {
  return useContext(GameContext);
};
