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

  // Atualizar a Pokédex de um jogador (adicionar ou remover Pokémon)
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
    body: { pokemon: Prisma.PokemonCreateInput; action: 'add' | 'remove' },
  ) {
    return this.playerService.updatePlayerPokedex(
      Number(playerId),
      body.pokemon,
      body.action,
    );
  }

  // Deletar um player
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a player' }) // Descrição do endpoint
  @ApiParam({ name: 'id', required: true, description: 'ID of the player' }) // Parâmetro de rota
  async deletePlayer(@Param('id') playerId: string) {
    return this.playerService.deletePlayer(Number(playerId));
  }
}
