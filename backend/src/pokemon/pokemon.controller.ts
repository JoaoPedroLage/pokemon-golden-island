import { Controller, Get } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('pokemons') // Adds tag for Swagger
@Controller('pokemons')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  // Route to get all Pokemon
  @Get()
  async getAll() {
    return this.pokemonService.getAll();
  }

  // Route to get a random Pokemon
  @Get('random')
  async getRandom() {
    return this.pokemonService.getRandom();
  }
}
