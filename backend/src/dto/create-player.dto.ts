import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlayerDto {
  @ApiProperty({ description: 'The name of the player' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The number of Pokéballs', default: 30 })
  @IsInt()
  @IsOptional()
  pokeballs?: number = 30;

  @ApiProperty({ description: 'The number of berries', default: 5 })
  @IsInt()
  @IsOptional()
  berries?: number = 5;
}
