/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sprite, BattleZone, Boundary } from './utils/classes';
import { battleZonesData, collisions } from './data';
import BattleScene from './components/BattleScene';
import { Key } from './interfaces/mainInterface';
import { GameProvider } from './context/GameContext';
import Pokedex from './components/Pokedex';

const Home: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<Sprite | null>(null);
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

  const [inBattle, setInBattle] = useState(false); // Novo estado para controlar se estamos em batalha
  const [wasInBattle, setWasInBattle] = useState(false); // Novo estado para controlar se o jogador estava em batalha
  const [initialPlayerPosition, setInitialPlayerPosition] = useState<{ x: number; y: number } | null>(null); // Estado para salvar a posição inicial do jogador
  const [showPokedex, setShowPokedex] = React.useState(false); // Estado para controlar a exibição da Pokedex

  // Função para iniciar a animação
  const startAnimation = (c: CanvasRenderingContext2D) => {
    const boundaries: Boundary[] = [];
    const battleZones: BattleZone[] = [];
    const cols = 70; // Número de colunas do seu mapa
    const rows = 40; // Número de linhas do seu mapa

    // console.log(inBattle);

    if (!imageRef.current) return; // Verifica se a imagem está carregada

    c.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

    const image = imageRef.current;

    const imageAspectRatio = image.width / image.height;
    const canvasAspectRatio = canvasRef.current!.width / canvasRef.current!.height;

    let canvasWidth, canvasHeight;

    if (imageAspectRatio > canvasAspectRatio) {
      canvasWidth = canvasRef.current!.width;
      canvasHeight = canvasRef.current!.width / imageAspectRatio;
    } else {
      canvasHeight = canvasRef.current!.height;
      canvasWidth = canvasRef.current!.height * imageAspectRatio;
    }

    // Cálculo do offset
    const offsetX = (canvasRef.current!.width - canvasWidth) / 2;
    const offsetY = (canvasRef.current!.height - canvasHeight) / 2;

    // Calcule a largura e altura de cada célula
    const cellWidth = canvasWidth / cols;
    const cellHeight = canvasHeight / rows;

    // Criar zonas de batalha levando em consideração o offset
    battleZonesData.forEach((symbol: number, index: number) => {
      if (symbol === 1) {
        const j = index % cols;
        const i = Math.floor(index / cols);
        battleZones.push(
          new BattleZone({
            width: cellWidth,
            height: cellHeight,
            position: {
              x: j * cellWidth + offsetX, // Ajuste com o offset
              y: i * cellHeight + offsetY, // Ajuste com o offset
            },
          })
        );
      }
    });

    // Criar áreas de colisão levando em consideração o offset
    collisions.forEach((symbol: number, index: number) => {
      if (symbol === 1) {
        const j = index % cols;
        const i = Math.floor(index / cols);
        boundaries.push(
          new Boundary({
            width: cellWidth,
            height: cellHeight,
            position: {
              x: j * cellWidth + offsetX, // Ajuste com o offset
              y: i * cellHeight + offsetY, // Ajuste com o offset
            },
          })
        );
      }
    });

    const animate = () => {
      if (!imageRef.current) return;

      c.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

      const image = imageRef.current;

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

      // Desenha a imagem no centro do canvas
      c.drawImage(image, offsetX, offsetY, renderWidth, renderHeight);

      // // Desenhar as áreas de colisão
      // boundaries.forEach(boundary => {
      //   boundary.draw(c); // As boundaries são desenhadas nas posições ajustadas
      // });

      // // Desenhar as áreas de batalha
      // battleZones.forEach(battleZone => {
      //   battleZone.draw(c); // As battleZones são desenhadas nas posições ajustadas
      // });

      // Atualizar e desenhar o jogador
      playerRef.current?.update(c, keysRef.current, boundaries, battleZones);

      // Desenhar o jogador
      playerRef.current?.draw(c);

      // Continuar a animação
      if (Object.values(keysRef.current).some(key => key.pressed)) {
        animationIdRef.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationIdRef.current!);
        animationIdRef.current = null;
      }
    };

    animate(); // Iniciar animação
  };

  // Lógica de saída da batalha
  const endBattle = () => {
    setInBattle(false);

    setWasInBattle(true);

    Object.keys(keysRef.current).forEach((key) => {
      keysRef.current[key as Key] = { pressed: false };
    }); // Reseta todas as teclas
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const c = canvas.getContext('2d');
    if (!c) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      if (!imageRef.current) return; // Verifica se a imagem está carregada

      const image = imageRef.current;

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

      const playerNeWSize = Math.min(renderWidth, renderHeight) / 10; // Tamanho do jogador baseado na tela

      // Atualiza o tamanho e a posição do jogador
      if (playerRef.current) {
        playerRef.current.resize(playerNeWSize, canvas.width, canvas.height, wasInBattle, setWasInBattle); // Atualiza o tamanho do jogador
      }

      // Redesenha o canvas
      if (imageRef.current) {
        c.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
        startAnimation(c); // Reinicia a animação com as novas proporções
      }
    };

    // Função para carregar as imagens do jogador
    const playerImagesLoad = () => {
      const image = new Image();

      image.src = 'https://storage.cloud.google.com/pokemon-golden-island/pokemonTileSetMap.png';

      // Ouvindo o evento de carregamento da imagem antes de continuar
      image.onload = () => {
        imageRef.current = image; // Armazena a imagem na ref

        const playerDownImage = new Image();
        playerDownImage.src = 'https://storage.cloud.google.com/pokemon-golden-island/playerDown.png';

        const playerUpImage = new Image();
        playerUpImage.src = 'https://storage.cloud.google.com/pokemon-golden-island/playerUp.png';

        const playerLeftImage = new Image();
        playerLeftImage.src = 'https://storage.cloud.google.com/pokemon-golden-island/playerLeft.png';

        const playerRightImage = new Image();
        playerRightImage.src = 'https://storage.cloud.google.com/pokemon-golden-island/playerRight.png';

        // Espera todas as imagens carregarem
        Promise.all([
          new Promise((resolve) => { playerDownImage.onload = resolve; }),
          new Promise((resolve) => { playerUpImage.onload = resolve; }),
          new Promise((resolve) => { playerLeftImage.onload = resolve; }),
          new Promise((resolve) => { playerRightImage.onload = resolve; }),
        ]).then(() => {
          // Calcule o tamanho do jogador baseado nas dimensões atuais do canvas
          const playerSize = Math.min(canvas.width, canvas.height) / 10; // Tamanho do jogador baseado no canvas

          const playerPosition = wasInBattle && initialPlayerPosition
            ? initialPlayerPosition // Usa a posição inicial se o jogador estava em batalha
            : {
              x: (canvas.width - playerSize) / 2, // Centraliza o jogador na largura do canvas
              y: (canvas.height - playerSize) / 2, // Centraliza o jogador na altura do canvas
            };

          // Cria o jogador centralizado no canvas ou retorna à posição inicial
          const player = new Sprite({
            position: playerPosition, // Passa a posição calculada
            image: playerDownImage, // Começa com a imagem para baixo
            frames: { max: 2 },
            sprites: {
              up: playerUpImage,
              left: playerLeftImage,
              right: playerRightImage,
              down: playerDownImage,
            },
            size: playerSize, // Passa o tamanho do jogador
            inBattle: false,
          });

          playerRef.current = player; // Salva o jogador no ref para poder manipulá-lo mais tarde

          updateCanvasSize(); // Atualiza o tamanho do canvas e do jogador

          // Chama a função de animação para começar
          startAnimation(c);
        });
      };
    };

    playerImagesLoad(); // Carrega as imagens do jogador

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keysRef.current[e.key as Key]) {
        e.preventDefault();
        keysRef.current[e.key as Key] = { pressed: false };

        if (playerRef.current && !playerRef.current.inBattle) {
          playerRef.current.frameCurrent = 0; // Retorna o frame para 0
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (keysRef.current[e.key as Key]) {
        e.preventDefault();
        keysRef.current[e.key as Key] = { pressed: true };

        if (!animationIdRef.current) {
          startAnimation(c); // Iniciar a animação com a imagem correta
        }
        if (playerRef.current!.inBattle) {
          setInBattle(true);
        }
        if (playerRef.current!.inBattle) {
          // Se o jogador estiver em batalha, salve a posição inicial
          setInitialPlayerPosition({
            x: playerRef.current!.position.x,
            y: playerRef.current!.position.y,
          });
        }
      }
    };

    // Função para lidar com a pressão da tecla
    const handleKeyEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // event.preventDefault();
        setShowPokedex(false); // Muda o estado para exibir a Pokédex
      }
    };

    // Função para lidar com a pressão da tecla
    const handleKeyEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();

        setShowPokedex(!showPokedex); // Muda o estado para exibir a Pokédex
      }
    };

    // Adiciona o event listener para tecla esc
    window.addEventListener('keydown', handleKeyEscape);
    // Adiciona o event listener para tecla enter
    window.addEventListener('keypress', handleKeyEnter);
    // Adiciona o event listener para redimensionamento da janela
    window.addEventListener('resize', updateCanvasSize);
    // Adiciona os event listeners para tecla pressionada
    window.addEventListener('keyup', handleKeyUp);
    // Adiciona os event listeners para tecla solta
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyEscape);
      window.removeEventListener('keypress', handleKeyEnter);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateCanvasSize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [inBattle, initialPlayerPosition, showPokedex, wasInBattle]);

  return (
    <>
      <GameProvider>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
            backgroundColor: '#333', // Cor de fundo fora do canvas
          }}
        >

          {
            inBattle ? (
              // Renderiza a cena de batalha se o estado inBattle for verdadeiro
              <BattleScene endBattle={() => endBattle()} setShowPokedex={() => setShowPokedex(showPokedex)} />
            ) : (
              <>
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                  <div className="text-white">Loading...</div>
                </div>
                <canvas
                  ref={canvasRef}
                  style={{
                    width: '80%',
                    height: '80%',
                  }}
                  className="absolute w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
                />
              </>
            )}

          {/* Mensagem para pressionar Enter */}
          {!showPokedex && (
            <div
              className="absolute bottom-10 text-center w-full"
              style={{
                color: 'rgba(255, 255, 255, 0.5)', // Cor branca opaca
                fontSize: '1.25rem', // Tamanho do texto
              }}
            >
              Press <span className="font-bold">Enter</span> to open the Pokédex
            </div>
          )}

          {showPokedex && <Pokedex />}
        </div>
      </GameProvider>
    </>
  );
};

export default Home;
