import { Controller, Get } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('pokemons') // Adiciona a tag para Swagger
@Controller('pokemons')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  // Rota para obter todos os Pokémons
  @Get()
  async getAll() {
    return this.pokemonService.getAll();
  }

  // Rota para obter um Pokémon aleatório
  @Get('random')
  async getRandom() {
    return this.pokemonService.getRandom();
  }
}
