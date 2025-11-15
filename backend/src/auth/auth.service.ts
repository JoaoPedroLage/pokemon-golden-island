import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { PlayerService } from '../player/player.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private playerService: PlayerService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Create player associated with user
    const player = await this.playerService.createPlayer(name);
    
    // Associate player with user
    const updatedPlayer = await this.prisma.player.update({
      where: { id: player.id },
      data: { userId: user.id },
      include: {
        pokedex: {
          include: {
            capturedPokemons: true,
          },
        },
      },
    });

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      player: {
        id: updatedPlayer.id,
        name: updatedPlayer.name,
        pokeballs: updatedPlayer.pokeballs,
        berries: updatedPlayer.berries,
        pokedex: updatedPlayer.pokedex
          ? {
              id: updatedPlayer.pokedex.id,
              totalPokemons: updatedPlayer.pokedex.totalPokemons,
              totalCaptured: updatedPlayer.pokedex.totalCaptured,
              capturedPokemons: updatedPlayer.pokedex.capturedPokemons.map((p) => ({
                id: p.id,
                name: p.name,
                sprite: p.sprite,
                type: p.type,
                quantity: p.quantity,
              })),
            }
          : null,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with player and pokedex data
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { 
        player: {
          include: {
            pokedex: {
              include: {
                capturedPokemons: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      player: user.player
        ? {
            id: user.player.id,
            name: user.player.name,
            pokeballs: user.player.pokeballs,
            berries: user.player.berries,
            pokedex: user.player.pokedex
              ? {
                  id: user.player.pokedex.id,
                  totalPokemons: user.player.pokedex.totalPokemons,
                  totalCaptured: user.player.pokedex.totalCaptured,
                  capturedPokemons: user.player.pokedex.capturedPokemons.map((p) => ({
                    id: p.id,
                    name: p.name,
                    sprite: p.sprite,
                    type: p.type,
                    quantity: p.quantity,
                  })),
                }
              : null,
          }
        : null,
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { player: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}


