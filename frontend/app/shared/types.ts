// Enum compartilhado para tipos de Pokemon
export enum PokemonType {
  NORMAL = 'normal',
  FIRE = 'fire',
  WATER = 'water',
  ELECTRIC = 'electric',
  GRASS = 'grass',
  ICE = 'ice',
  FIGHTING = 'fighting',
  POISON = 'poison',
  GROUND = 'ground',
  FLYING = 'flying',
  PSYCHIC = 'psychic',
  BUG = 'bug',
  ROCK = 'rock',
  GHOST = 'ghost',
  DRAGON = 'dragon',
  DARK = 'dark',
  STEEL = 'steel',
  FAIRY = 'fairy',
}

// Interface compartilhada para Pokemon
export interface PokemonData {
  name: string;
  sprite: string;
  type: string | string[]; // Pode ser string ou array de strings
  quantity?: number;
}

// Interface compartilhada para Player
export interface PlayerData {
  id: number;
  name: string;
  pokeballs: number;
  berries: number;
  pokedex?: PokedexData;
}

// Interface compartilhada para Pokedex
export interface PokedexData {
  id: number;
  totalPokemons: number;
  totalCaptured: number;
  capturedPokemons: PokemonData[];
}

