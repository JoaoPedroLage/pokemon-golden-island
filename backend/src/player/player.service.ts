import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  // Criar um novo player com uma pokedex vazia
  async createPlayer(name: string) {
    return this.prisma.player.create({
      data: {
        name,
        pokedex: {
          create: {
            // Cria uma pokedex vazia automaticamente ao criar um jogador
            totalPokemons: 151,
            totalCaptured: 0,
          },
        },
      },
      include: { pokedex: true },
    });
  }

  // Buscar todos os jogadores com suas pokedex
  async findAllPlayers() {
    return this.prisma.player.findMany({
      include: { pokedex: true },
    });
  }

  // Atualizar a Pokédex de um jogador (adicionar ou remover Pokémon)
  async updatePlayerPokedex(
    playerId: number,
    pokemon: Prisma.PokemonCreateInput,
    action: 'add' | 'remove', // Novo parâmetro indicando a ação
  ) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { pokedex: { include: { capturedPokemons: true } } }, // Inclui Pokédex e Pokémons
    });

    if (!player) throw new Error('Player not found');

    const { pokedex } = player;

    // Verifica se o Pokémon já está capturado na Pokédex
    const existingPokemon = await this.prisma.pokemon.findFirst({
      where: {
        name: pokemon.name,
        pokedexId: pokedex.id,
      },
    });

    if (action === 'add') {
      if (existingPokemon) {
        // Se o Pokémon já estiver capturado, apenas incrementa a quantidade
        await this.prisma.pokemon.update({
          where: { id: existingPokemon.id },
          data: { quantity: existingPokemon.quantity + 1 },
        });
      } else {
        // Se não existir, adiciona um novo Pokémon à Pokédex
        await this.prisma.pokemon.create({
          data: {
            name: pokemon.name,
            sprite: pokemon.sprite,
            type: pokemon.type,
            quantity: pokemon.quantity || 1, // Define uma quantidade padrão se não fornecido
            pokedexId: pokedex.id,
          },
        });
      }

      // Atualiza o total de Pokémon capturados e o total de Pokémon na Pokédex
      await this.prisma.pokedex.update({
        where: { id: pokedex.id },
        data: {
          totalCaptured: existingPokemon
            ? pokedex.totalCaptured
            : pokedex.totalCaptured + 1,
          totalPokemons:
            pokedex.capturedPokemons.length + (existingPokemon ? 0 : 1),
        },
      });
    } else if (action === 'remove') {
      if (existingPokemon) {
        if (existingPokemon.quantity > 1) {
          // Se houver mais de um Pokémon, apenas decrementa a quantidade
          await this.prisma.pokemon.update({
            where: { id: existingPokemon.id },
            data: { quantity: existingPokemon.quantity - 1 },
          });
        } else {
          // Se houver apenas um, remove o Pokémon completamente
          await this.prisma.pokemon.delete({
            where: { id: existingPokemon.id },
          });
        }

        // Atualiza o total de Pokémon capturados e o total de Pokémon na Pokédex
        await this.prisma.pokedex.update({
          where: { id: pokedex.id },
          data: {
            totalCaptured: pokedex.totalCaptured - 1,
            totalPokemons:
              pokedex.capturedPokemons.length -
              (existingPokemon.quantity === 1 ? 1 : 0),
          },
        });
      } else {
        throw new Error('Pokemon not found in Pokedex');
      }
    }

    return player;
  }

  // Deletar um player e sua Pokédex associada
  async deletePlayer(playerId: number) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { pokedex: true },
    });

    if (!player) throw new Error('Player not found');

    // Deleta os Pokémons capturados na Pokédex
    await this.prisma.pokemon.deleteMany({
      where: { pokedexId: player.pokedex?.id },
    });

    // Deleta a Pokédex do jogador
    await this.prisma.pokedex.delete({
      where: { id: player.pokedex?.id },
    });

    // Deleta o jogador
    await this.prisma.player.delete({
      where: { id: playerId },
    });

    return { message: 'Player and Pokedex deleted successfully' };
  }
}
