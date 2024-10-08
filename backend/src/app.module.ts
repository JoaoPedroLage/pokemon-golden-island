import { Module } from '@nestjs/common';
import { PlayerController } from './player/player.controller';
import { PlayerModule } from './player/player.module';
import { PlayerService } from './player/player.service';
import { PrismaService } from './prisma/prisma.service';
import { PokemonService } from './pokemon/pokemon.service';
import { PokemonController } from './pokemon/pokemon.controller';
import { PokemonModule } from './pokemon/pokemon.module';
@Module({
  imports: [PlayerModule, PokemonModule],
  controllers: [PlayerController, PokemonController],
  providers: [PlayerService, PrismaService, PokemonService],
})
export class AppModule {}
