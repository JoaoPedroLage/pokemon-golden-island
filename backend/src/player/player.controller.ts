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

@ApiTags('players') // Groups endpoints under the "players" tag
@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  // Create a new player
  @Post()
  @ApiOperation({ summary: 'Create a new player' }) // Endpoint description
  @ApiBody({ type: CreatePlayerDto }) // Request body with type
  async createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playerService.createPlayer(createPlayerDto.name);
  }

  // Get all players
  @Get()
  @ApiOperation({ summary: 'Get all players' }) // Endpoint description
  async findAllPlayers() {
    return this.playerService.findAllPlayers();
  }

  // Update player Pokedex (add or remove Pokemon)
  // IMPORTANT: More specific routes must come BEFORE generic routes
  @Put(':id/pokedex')
  @ApiOperation({ summary: 'Update player Pokedex' }) // Endpoint description
  @ApiParam({ name: 'id', required: true, description: 'ID of the player' }) // Route parameter
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
