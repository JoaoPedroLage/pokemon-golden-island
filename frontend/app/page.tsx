'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from './components/Login';
import Register from './components/Register';
import { authAPI } from './services/api';
import { GameProvider, useGameContext } from './context/GameContext';

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { loadPlayer } = useGameContext();

  useEffect(() => {
    // Check authentication asynchronously
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      
      // Small delay to avoid immediate redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (authAPI.isAuthenticated()) {
        // Check if token is valid by making a request
        const token = authAPI.getToken();
        if (token) {
          try {
            // Try to validate token by making a simple request
            // If it fails, clears localStorage and stays on login screen
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/players`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (response.ok) {
              // Valid token, redirect
              router.push('/game');
            } else {
              // Invalid token, clear and stay on login screen
              authAPI.logout();
            }
          } catch {
            // Validation error, clear and stay on login screen
            authAPI.logout();
          }
        }
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

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

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div
          className="text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          <div className="text-lg">Verifying authentication...</div>
        </div>
      </div>
    );
  }

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

export default function Home() {
  return (
    <GameProvider>
      <AuthContent />
    </GameProvider>
  );
}
