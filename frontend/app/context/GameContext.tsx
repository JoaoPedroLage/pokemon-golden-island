import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Pokemon } from '../interfaces/mainInterface';

// Interface para os dados que serão compartilhados no contexto
interface GameContextProps {
  pokeballs: number;
  berries: number;
  capturedPokemons: Pokemon[]; // Mudado para um array de objetos Pokemon
  totalCaptured: number;
  totalPokemons: number;
  setTotalPokemons: (total: number) => void;
  releasePokemon: (name: string) => void;
  usePokeball: () => void;
  useBerry: () => void;
  addCapturedPokemon: (pokemon: Pokemon) => void; // Mudado para receber um objeto Pokemon
  resetGame: () => void;
  addPokeballs: (amount: number) => void; // Função para adicionar Pokébolas
  addBerry: () => void; // Função para adicionar uma Berry
}

// Valores iniciais do contexto
const initialGameState: GameContextProps = {
  pokeballs: 30,
  berries: 5,
  capturedPokemons: [],
  totalCaptured: 0,
  totalPokemons: 0,
  setTotalPokemons: () => {},
  usePokeball: () => {},
  useBerry: () => {},
  addCapturedPokemon: () => {},
  resetGame: () => {},
  addPokeballs: () => {},
  addBerry: () => {},
  releasePokemon: () => {},
};

// Criando o contexto
const GameContext = createContext<GameContextProps>(initialGameState);

// Provider do contexto para ser usado no app
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pokeballs, setPokeballs] = useState<number>(30);
  const [berries, setBerries] = useState<number>(5);
  const [capturedPokemons, setCapturedPokemons] = useState<Pokemon[]>([]);
  const [totalPokemons, setTotalPokemons] = useState(0);

  // Função para usar uma Pokébola
  const usePokeball = () => {
    setPokeballs((prev) => (prev > 0 ? prev - 1 : 0));
  };

  // Função para usar uma Berry
  const useBerry = () => {
    setBerries((prev) => (prev > 0 ? prev - 1 : 0));
  };

  // Função para adicionar um Pokémon capturado
  const addCapturedPokemon = (pokemon: Pokemon) => {
    setCapturedPokemons((prev) => {
      const existingPokemon = prev.find(p => p.name === pokemon.name);
      if (existingPokemon) {
        // Se o Pokémon já estiver capturado, apenas incremente a quantidade
        return prev.map(p => 
          p.name === pokemon.name 
          ? { ...p, quantity: p.quantity + 1 } 
          : p
        );
      }
      // Se não existir, adicione-o à lista
      return [...prev, { ...pokemon, quantity: 1 }];
    });
  };

  // Função para reiniciar o jogo
  const resetGame = () => {
    setPokeballs(10);
    setBerries(5);
    setCapturedPokemons([]);
  };

  // Função para adicionar Pokébolas
  const addPokeballs = (amount: number) => {
    setPokeballs((prev) => prev + amount);
  };

  // Função para adicionar uma Berry
  const addBerry = () => {
    setBerries((prev) => prev + 1);
  };

  const totalCaptured = capturedPokemons.length; // Total de Pokémon capturados

  // Função para liberar um Pokémon
  const releasePokemon = (name: string) => {
    setCapturedPokemons((prev) =>
      prev.reduce((newPokemons, pokemon) => {
        if (pokemon.name === name) {
          if (pokemon.quantity > 1) {
            newPokemons.push({ ...pokemon, quantity: pokemon.quantity - 1 });
          }
        } else {
          newPokemons.push(pokemon);
        }
        return newPokemons;
      }, [] as Pokemon[])
    );
  };

  return (
    <GameContext.Provider
      value={{
        pokeballs,
        berries,
        capturedPokemons,
        totalCaptured,
        totalPokemons, 
        setTotalPokemons,
        usePokeball,
        useBerry,
        addCapturedPokemon,
        resetGame,
        addPokeballs,
        addBerry,
        releasePokemon
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Hook para acessar o contexto de forma mais simples
export const useGameContext = () => {
  return useContext(GameContext);
};
