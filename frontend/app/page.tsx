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

      // Check if token exists
      if (!authAPI.isAuthenticated()) {
        // No token, show login screen
        setIsCheckingAuth(false);
        return;
      }

      // Check if token is valid by making a request
      const token = authAPI.getToken();
      if (!token) {
        // No token found, clear and show login screen
        authAPI.logout();
        setIsCheckingAuth(false);
        return;
      }

      try {
        // Try to validate token by making a request to a protected endpoint
        // Use a more specific endpoint that requires authentication
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/players`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Check if response is ok AND if it's not an error response
        if (response.ok) {
          // Try to parse the response to ensure it's valid JSON
          try {
            const data = await response.json();
            // If we get valid data (array or object), token is valid
            if (data && (Array.isArray(data) || typeof data === 'object')) {
              // Valid token, redirect to game
              router.push('/game');
              // Don't set isCheckingAuth to false here - let the redirect happen
              return;
            } else {
              // Invalid response format, treat as invalid token
              authAPI.logout();
              setIsCheckingAuth(false);
            }
          } catch {
            // Couldn't parse response, treat as invalid
            authAPI.logout();
            setIsCheckingAuth(false);
          }
        } else {
          // Invalid token (401, 403, etc.), clear and stay on login screen
          authAPI.logout();
          setIsCheckingAuth(false);
        }
      } catch (error) {
        // Network error or other error, clear and stay on login screen
        console.error('Error validating token:', error);
        authAPI.logout();
        setIsCheckingAuth(false);
      }
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
