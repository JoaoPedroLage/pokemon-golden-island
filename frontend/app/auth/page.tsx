'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from '../components/Login';
import Register from '../components/Register';
import { authAPI } from '../services/api';
import { GameProvider, useGameContext } from '../context/GameContext';

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { loadPlayer } = useGameContext();

  useEffect(() => {
    // If already authenticated, redirect to game
    if (authAPI.isAuthenticated()) {
      router.push('/game');
    }
  }, [router]);

  const handleAuthSuccess = async (
    token: string,
    user: { id: number; email: string; name: string },
    player: { 
      id: number; 
      name: string; 
      pokeballs?: number; 
      berries?: number; 
      pokedex?: {
        id: number;
        totalPokemons: number;
        totalCaptured: number;
        capturedPokemons: Array<{
          id: number;
          name: string;
          sprite: string;
          type: string;
          quantity: number;
        }>;
      } | null;
    } | null
  ) => {
    // Save playerId to localStorage immediately so GameContext can load it
    if (player) {
      localStorage.setItem('playerId', player.id.toString());
      
      // Load player data from backend to ensure we have the latest data
      // This will be called before redirect, ensuring data is loaded
      try {
        await loadPlayer(player.id);
      } catch (error) {
        console.error('Error loading player:', error);
        // Continue with redirect even if load fails
      }
    }
    
    // Redirect to game after data is loaded
    router.push('/game');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      {isLogin ? (
        <Login
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <Register
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <GameProvider>
      <AuthContent />
    </GameProvider>
  );
}


