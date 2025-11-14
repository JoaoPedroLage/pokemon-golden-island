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
    player: { id: number; name: string } | null
  ) => {
    // If player was created, initialize in context
    if (player) {
      try {
        await loadPlayer(player.id);
      } catch (error) {
        console.error('Error loading player:', error);
      }
    }

    // Redirect to game
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

