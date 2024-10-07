import React from 'react';
import Image from 'next/image';
import { useGameContext } from '../context/GameContext';
import { Pokemon } from '../interfaces/mainInterface';

const Pokedex: React.FC = () => {
  const { totalPokemons, capturedPokemons, totalCaptured, releasePokemon } = useGameContext(); // Acessando o contexto

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 md:w-1/2 lg:w-1/3 w-[80vw] h-[75vh] flex flex-col">
        {/* Cabeçalho e informações */}
        <div className="flex-grow overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Pokédex</h2>
          <p>Total Pokémons: {totalPokemons}</p>
          <p>Total Capturados: {totalCaptured}</p>

          {/* Lista de pokémons capturados */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            {capturedPokemons.map((pokemon: Pokemon) => (
              <div key={pokemon.name} className="pokedex-item bg-gray-100 p-4 rounded-lg shadow-md flex flex-col items-center">
                <p className="text-sm text-center font-semibold">Type:</p>
                <p className="text-sm text-center">{pokemon.type}</p>
                <Image
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  width={100}
                  height={100}
                />
                <h2 className="text-lg font-semibold">{pokemon.name}</h2>
                <p className="text-sm">Quantity: {pokemon.quantity}</p>
                <button
                  className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-700"
                  onClick={() => releasePokemon(pokemon.name)}
                >
                  Free Pokémon
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé fixo */}
        <div className="text-center text-sm text-gray-500 mt-6">
          Pressione <span className="font-bold">Enter</span> para sair
        </div>
      </div>
    </div>
  );
};

export default Pokedex;
