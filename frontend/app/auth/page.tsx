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
      router.push('/');
    }
  }, [router]);

  const handleAuthSuccess = async (
    token: string,
    user: { id: number; email: string; name: string },
    player: { id: number; name: string } | null
  ) => {
    // Se o player foi criado, inicializa no contexto
    if (player) {
      try {
        await loadPlayer(player.id);
      } catch (error) {
        console.error('Erro ao carregar player:', error);
      }
    }
    
    // Redireciona para o jogo
    router.push('/');
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


