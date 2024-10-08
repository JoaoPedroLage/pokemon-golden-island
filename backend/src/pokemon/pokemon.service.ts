import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class PokemonService {
  constructor(private prisma: PrismaService) {}

  // Buscar todos os Pokémonsasync
  async getAll() {
    const response = await axios.get('https://pokeapi.co/api/v2/generation/1');
    const pokemons = response.data.pokemon_species;

    const formattedPokemons = await Promise.all(
      pokemons.map(async (pokemon: any) => {
        const pokemonDetails = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`,
        );
        return {
          name: pokemon.name,
          sprite: pokemonDetails.data.sprites.front_default, // URL do sprite
          type: pokemonDetails.data.types.map((type: any) => type.type.name), // Array de tipos
        };
      }),
    );

    return formattedPokemons;
  }

  // Buscar um Pokémon aleatório
  async getRandom() {
    const pokemons = await this.getAll();
    const randomIndex = Math.floor(Math.random() * pokemons.length);
    return pokemons[randomIndex];
  }
}
