/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef } from 'react';
import { Sprite } from './interfaces';

const Home: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<Sprite | null>(null);
  const movables = useRef<any[]>([]); // Os itens móveis serão atualizados com sprites e outros elementos.
  const animationIdRef = useRef<number | null>(null); // Armazena o ID da animação
  const imageRef = useRef<HTMLImageElement | null>(null); // Ref para a imagem de fundo

  const keysRef = useRef({
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
    ArrowUp: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowDown: { pressed: false },
    ArrowRight: { pressed: false },
  });

  // Função para iniciar a animação
  const startAnimation = (c: CanvasRenderingContext2D) => {
    const animate = () => {
      if (!imageRef.current) return; // Verifica se a imagem está carregada

      c.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

      const image = imageRef.current; // Acessa a imagem aqui

      const imageAspectRatio = image.width / image.height;
      const canvasAspectRatio = canvasRef.current!.width / canvasRef.current!.height;

      let renderWidth, renderHeight;

      if (imageAspectRatio > canvasAspectRatio) {
        renderWidth = canvasRef.current!.width;
        renderHeight = canvasRef.current!.width / imageAspectRatio;
      } else {
        renderHeight = canvasRef.current!.height;
        renderWidth = canvasRef.current!.height * imageAspectRatio;
      }

      const offsetX = (canvasRef.current!.width - renderWidth) / 2;
      const offsetY = (canvasRef.current!.height - renderHeight) / 2;

      c.drawImage(image, offsetX, offsetY, renderWidth, renderHeight);

      // Desenhar o jogador
      playerRef.current?.draw(c);
      // Atualizar e desenhar o jogador
      playerRef.current?.update(c, keysRef.current);

      // Continuar a animação se alguma tecla estiver pressionada
      if (Object.values(keysRef.current).some(key => key.pressed)) {
        animationIdRef.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationIdRef.current!);
        animationIdRef.current = null; // Limpar o ID da animação
      }
    };

    animate(); // Iniciar animação
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const c = canvas.getContext('2d');
    if (!c) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const image = new Image();
      image.src = '/images/pokemonTilesetMap.png';
      imageRef.current = image; // Armazena a imagem na ref

      // Carregamento das imagens do jogador
      const playerDownImage = new Image();
      playerDownImage.src = '/images/playerDown.png';

      const playerUpImage = new Image();
      playerUpImage.src = '/images/playerUp.png';

      const playerLeftImage = new Image();
      playerLeftImage.src = '/images/playerLeft.png';

      const playerRightImage = new Image();
      playerRightImage.src = '/images/playerRight.png';

      const imagesLoaded = Promise.all([
        new Promise((resolve) => { image.onload = resolve; }),
        new Promise((resolve) => { playerDownImage.onload = resolve; }),
        new Promise((resolve) => { playerUpImage.onload = resolve; }),
        new Promise((resolve) => { playerLeftImage.onload = resolve; }),
        new Promise((resolve) => { playerRightImage.onload = resolve; }),
      ]);

      imagesLoaded.then(() => {
        // Criação do jogador
        const playerSize = Math.min(canvas.width, canvas.height) / 10; // Ajuste o divisor para mudar o tamanho do jogador
        const player = new Sprite({
          position: {
            x: canvas.width / 2 - playerSize / 2, // Centralizar
            y: canvas.height / 2 - playerSize / 2, // Centralizar
          },
          image: playerDownImage, // Começa com a imagem para baixo
          frames: { max: 2 },
          sprites: {
            up: playerUpImage,
            left: playerLeftImage,
            right: playerRightImage,
            down: playerDownImage,
          },
          size: playerSize // Passa o tamanho do jogador
        });
        playerRef.current = player;

        const background = {
          position: {
            x: 0,
            y: 0,
          },
          image,
        };

        movables.current = [background];

        // Iniciar a animação após carregar as imagens
        startAnimation(c);
      });
    };

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    const handleKeyUp = (e: KeyboardEvent) => {
      type Key = 'w' | 'a' | 's' | 'd' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';
    
      if (keysRef.current[e.key as Key]) {
        e.preventDefault();
        // Salvar a posição do jogador quando a tecla for liberada
        keysRef.current[e.key as Key] = { pressed: false };
    
        // Garantir que o frame do player volte ao frame estático (0)
        if (playerRef.current) {
          playerRef.current.frameCurrent = 0; // Retorna o frame para 0
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      type Key = 'w' | 'a' | 's' | 'd' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

      if (keysRef.current[e.key as Key]) {
        e.preventDefault();
        keysRef.current[e.key as Key] = { pressed: true };

        // Iniciar a animação se não estiver já em execução
        if (!animationIdRef.current) {
          startAnimation(c); // Iniciar a animação com a imagem correta
        }
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', resizeCanvas);

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden', // Impede o scroll
        backgroundColor: '#333', // Cor de fundo fora do canvas
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '80%',
          height: '80%',
        }}
      />
    </div>
  );
};

export default Home;
