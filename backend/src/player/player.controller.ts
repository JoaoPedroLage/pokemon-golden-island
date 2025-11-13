import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Put,
} from '@nestjs/common';
import { PlayerService } from './player.service';
import { Prisma } from '@prisma/client';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreatePlayerDto } from '../dto/create-player.dto';

@ApiTags('players') // Agrupa os endpoints sob a tag "players"
@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  // Criar um novo player
  @Post()
  @ApiOperation({ summary: 'Create a new player' }) // Descrição do endpoint
  @ApiBody({ type: CreatePlayerDto }) // Corpo da requisição com tipo
  async createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playerService.createPlayer(createPlayerDto.name);
  }

  // Buscar todos os players
  @Get()
  @ApiOperation({ summary: 'Get all players' }) // Descrição do endpoint
  async findAllPlayers() {
    return this.playerService.findAllPlayers();
  }

  // Atualizar a Pokédex de um jogador (adicionar ou remover Pokemon)
  // IMPORTANTE: Rotas mais específicas devem vir ANTES de rotas genéricas
  @Put(':id/pokedex')
  @ApiOperation({ summary: 'Update player Pokedex' }) // Descrição do endpoint
  @ApiParam({ name: 'id', required: true, description: 'ID of the player' }) // Parâmetro de rota
  @ApiBody({
    description: 'Pokemon data and action (add or remove)',
    examples: {
      example1: {
        summary: 'Add Pokemon',
        value: {
          pokemon: { name: 'Pikachu', type: 'Electric', sprite: 'sprite_url' },
          action: 'add',
        },
      },
      example2: {
        summary: 'Remove Pokemon',
        value: {
          pokemon: { name: 'Pikachu', type: 'Electric', sprite: 'sprite_url' },
          action: 'remove',
        },
      },
    },
  })
  async updatePlayerPokedex(
    @Param('id') playerId: string,
    @Body()
    body: { pokemon: Prisma.PokemonCreateInput; action: 'add' | 'remove' | 'set' },
  ) {
    return this.playerService.updatePlayerPokedex(
      Number(playerId),
      body.pokemon,
      body.action,
    );
  }

  // Update player pokeballs and berries
  // IMPORTANT: More specific routes must come BEFORE generic routes
  @Put(':id/resources')
  @ApiOperation({ summary: 'Update player resources (pokeballs and berries)' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the player' })
  @ApiBody({
    description: 'Player resources data',
    examples: {
      example1: {
        summary: 'Update resources',
        value: {
          pokeballs: 30,
          berries: 5,
        },
      },
    },
  })
  async updatePlayerResources(
    @Param('id') playerId: string,
    @Body() body: { pokeballs?: number; berries?: number },
  ) {
    return this.playerService.updatePlayerResources(
      Number(playerId),
      body.pokeballs,
      body.berries,
    );
  }

  // Get a player by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a player by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the player' })
  async findPlayerById(@Param('id') playerId: string) {
    return this.playerService.findPlayerById(Number(playerId));
  }

  // Delete a player
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a player' }) // Endpoint description
  @ApiParam({ name: 'id', required: true, description: 'ID of the player' }) // Route parameter
  async deletePlayer(@Param('id') playerId: string) {
    return this.playerService.deletePlayer(Number(playerId));
  }
}
