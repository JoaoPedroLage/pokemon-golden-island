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
    // Only check if user is already authenticated with a valid token
    // Don't validate token here - let the user login manually
    // If they have a token, they can try to access /game which will validate it
    // Clear any invalid tokens on login page
    if (authAPI.isAuthenticated()) {
      // User has a token, but we won't validate it here
      // They can try to access /game which will validate and redirect if invalid
      // For now, just show the login form - they can login again if needed
      authAPI.logout();
    }
  }, []);

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

export default function LoginPage() {
  return (
    <GameProvider>
      <AuthContent />
    </GameProvider>
  );
}

