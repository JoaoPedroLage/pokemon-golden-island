import { Module } from '@nestjs/common';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { PrismaService } from '../prisma/prisma.service'; // Certifique-se de importar o PrismaService

@Module({
  controllers: [PokemonController],
  providers: [PokemonService, PrismaService], // Adiciona o PrismaService
})
export class PokemonModule {}
