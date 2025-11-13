import { PokemonData, PlayerData } from '../shared/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Interfaces for authentication
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
  player: {
    id: number;
    name: string;
  } | null;
}

// Helper function to get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Helper function to make requests
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// API de Players
export const playerAPI = {
  // Criar um novo player
  create: async (name: string, pokeballs = 30, berries = 5): Promise<PlayerData> => {
    return fetchAPI<PlayerData>('/players', {
      method: 'POST',
      body: JSON.stringify({ name, pokeballs, berries }),
    });
  },

  // Get all players
  getAll: async (): Promise<PlayerData[]> => {
    return fetchAPI<PlayerData[]>('/players');
  },

  // Get a player by ID
  getById: async (id: number): Promise<PlayerData> => {
    return fetchAPI<PlayerData>(`/players/${id}`);
  },

  // Update a player's Pokedex (add, remove, or set Pokemon)
  updatePokedex: async (
    playerId: number,
    pokemon: PokemonData,
    action: 'add' | 'remove' | 'set'
  ): Promise<PlayerData> => {
    return fetchAPI<PlayerData>(`/players/${playerId}/pokedex`, {
      method: 'PUT',
      body: JSON.stringify({ pokemon, action }),
    });
  },

  // Update player resources (pokeballs and berries)
  updateResources: async (
    playerId: number,
    pokeballs?: number,
    berries?: number
  ): Promise<PlayerData> => {
    return fetchAPI<PlayerData>(`/players/${playerId}/resources`, {
      method: 'PUT',
      body: JSON.stringify({ pokeballs, berries }),
    });
  },

  // Delete a player
  delete: async (id: number): Promise<void> => {
    return fetchAPI<void>(`/players/${id}`, {
      method: 'DELETE',
    });
  },
};

// Pokemon API
export const pokemonAPI = {
  // Get all pokemons
  getAll: async (): Promise<PokemonData[]> => {
    return fetchAPI<PokemonData[]>('/pokemons');
  },

  // Get a random pokemon
  getRandom: async (): Promise<PokemonData> => {
    return fetchAPI<PokemonData>('/pokemons/random');
  },
};

// Authentication API
export const authAPI = {
  // Register new user
  register: async (registerDto: RegisterDto): Promise<AuthResponse> => {
    const response = await fetchAPI<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerDto),
    });
    
    // Salva o token no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      if (response.player) {
        localStorage.setItem('player', JSON.stringify(response.player));
      }
    }
    
    return response;
  },

  // Login
  login: async (loginDto: LoginDto): Promise<AuthResponse> => {
    const response = await fetchAPI<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginDto),
    });
    
    // Save token to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      if (response.player) {
        localStorage.setItem('player', JSON.stringify(response.player));
      }
    }
    
    return response;
  },

  // Logout
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('player');
    }
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token');
    }
    return false;
  },

  // Get token
  getToken: (): string | null => {
    return getToken();
  },
};

