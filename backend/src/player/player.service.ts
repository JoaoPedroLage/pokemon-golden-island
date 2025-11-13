import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  // Helper function to normalize Pokemon type (array to string)
  private normalizePokemonType(type: string | string[]): string {
    if (Array.isArray(type)) {
      return type.join(', ');
    }
    return type;
  }

  // Create a new player with an empty pokedex
  async createPlayer(name: string) {
    return this.prisma.player.create({
      data: {
        name,
        pokedex: {
          create: {
        // Creates an empty pokedex automatically when creating a player
        totalPokemons: 151,
        totalCaptured: 0,
      },
    },
  },
  include: { pokedex: true },
});
}

// Get all players with their pokedex
async findAllPlayers() {
  return this.prisma.player.findMany({
    include: { 
      pokedex: { 
        include: { capturedPokemons: true } 
      } 
    },
  });
}

// Get a player by ID with their pokedex
  async findPlayerById(playerId: number) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { 
        pokedex: { 
          include: { capturedPokemons: true } 
        } 
      },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    return player;
  }

  // Update a player's Pokedex (add or remove Pokemon)
  async updatePlayerPokedex(
    playerId: number,
    pokemon: Prisma.PokemonCreateInput,
    action: 'add' | 'remove' | 'set', // New parameter indicating the action
  ) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { pokedex: { include: { capturedPokemons: true } } }, // Includes Pokedex and Pokemon
    });

    if (!player) throw new Error('Player not found');

    const { pokedex } = player;

    // Check if Pokemon is already captured in Pokedex
    const existingPokemon = await this.prisma.pokemon.findFirst({
      where: {
        name: pokemon.name,
        pokedexId: pokedex.id,
      },
    });

    if (action === 'add') {
      if (existingPokemon) {
        // If Pokemon is already captured, just increment quantity
        await this.prisma.pokemon.update({
          where: { id: existingPokemon.id },
          data: { quantity: existingPokemon.quantity + 1 },
        });
      } else {
        // If it doesn't exist, add a new Pokemon to Pokedex
        await this.prisma.pokemon.create({
          data: {
            name: pokemon.name,
            sprite: pokemon.sprite,
            type: this.normalizePokemonType(pokemon.type),
            quantity: pokemon.quantity || 1, // Sets a default quantity if not provided
            pokedexId: pokedex.id,
          },
        });
      }

      // Fetch updated pokemons to calculate correctly
      const updatedPokemons = await this.prisma.pokemon.findMany({
        where: { pokedexId: pokedex.id },
      });

      // Update total captured Pokemon and total Pokemon in Pokedex
      await this.prisma.pokedex.update({
        where: { id: pokedex.id },
        data: {
          totalCaptured: existingPokemon
            ? pokedex.totalCaptured
            : pokedex.totalCaptured + 1,
          totalPokemons: updatedPokemons.length,
        },
      });
    } else if (action === 'remove') {
      if (existingPokemon) {
        if (existingPokemon.quantity > 1) {
          // If there's more than one Pokemon, just decrement quantity
          await this.prisma.pokemon.update({
            where: { id: existingPokemon.id },
            data: { quantity: existingPokemon.quantity - 1 },
          });
        } else {
          // If there's only one, remove Pokemon completely
          await this.prisma.pokemon.delete({
            where: { id: existingPokemon.id },
          });
        }

        // Fetch updated pokemons to calculate correctly
        const updatedPokemons = await this.prisma.pokemon.findMany({
          where: { pokedexId: pokedex.id },
        });

        // Update total captured Pokemon and total Pokemon in Pokedex
        await this.prisma.pokedex.update({
          where: { id: pokedex.id },
          data: {
            totalCaptured: existingPokemon.quantity === 1
              ? pokedex.totalCaptured - 1
              : pokedex.totalCaptured,
            totalPokemons: updatedPokemons.length,
          },
        });
      } else {
        throw new Error('Pokemon not found in Pokedex');
      }
    } else if (action === 'set') {
      // Set exact Pokemon quantity
      if (existingPokemon) {
        // If Pokemon already exists, update quantity
        await this.prisma.pokemon.update({
          where: { id: existingPokemon.id },
          data: { 
            quantity: pokemon.quantity || 1,
            sprite: pokemon.sprite,
            type: this.normalizePokemonType(pokemon.type),
          },
        });
      } else {
        // If it doesn't exist, add a new Pokemon to Pokedex
        await this.prisma.pokemon.create({
          data: {
            name: pokemon.name,
            sprite: pokemon.sprite,
            type: this.normalizePokemonType(pokemon.type),
            quantity: pokemon.quantity || 1,
            pokedexId: pokedex.id,
          },
        });
      }

      // Fetch updated pokemons to calculate correctly
      const updatedPokemons = await this.prisma.pokemon.findMany({
        where: { pokedexId: pokedex.id },
      });

      // Update total captured Pokemon and total Pokemon in Pokedex
      await this.prisma.pokedex.update({
        where: { id: pokedex.id },
        data: {
          totalCaptured: existingPokemon
            ? pokedex.totalCaptured
            : pokedex.totalCaptured + 1,
          totalPokemons: updatedPokemons.length,
        },
      });
    }

    // Return updated player with latest data
    return this.prisma.player.findUnique({
      where: { id: playerId },
      include: { 
        pokedex: { 
          include: { capturedPokemons: true } 
        } 
      },
    });
  }

  // Atualizar pokeballs e berries de um player
  async updatePlayerResources(
    playerId: number,
    pokeballs?: number,
    berries?: number,
  ) {
    const updateData: { pokeballs?: number; berries?: number } = {};
    
    if (pokeballs !== undefined) {
      updateData.pokeballs = pokeballs;
    }
    
    if (berries !== undefined) {
      updateData.berries = berries;
    }

    return this.prisma.player.update({
      where: { id: playerId },
      data: updateData,
      include: {
        pokedex: {
          include: { capturedPokemons: true },
        },
      },
    });
  }

  // Delete a player and their associated Pokedex
  async deletePlayer(playerId: number) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { pokedex: true },
    });

    if (!player) throw new Error('Player not found');

    // Delete captured Pokemon in Pokedex
    await this.prisma.pokemon.deleteMany({
      where: { pokedexId: player.pokedex?.id },
    });

    // Delete player's Pokedex
    await this.prisma.pokedex.delete({
      where: { id: player.pokedex?.id },
    });

    // Delete the player
    await this.prisma.player.delete({
      where: { id: playerId },
    });

    return { message: 'Player and Pokedex deleted successfully' };
  }
}
