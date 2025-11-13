/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sprite, BattleZone, Boundary } from '../utils/classes';
import { battleZonesData, collisions } from '../data';
import BattleScene from '../components/BattleScene';
import { Key } from '../interfaces/mainInterface';
import { GameProvider } from '../context/GameContext';
import Pokedex from '../components/Pokedex';
import GameInfoTooltip from '../components/GameInfoTooltip';
import MobileControls from '../components/MobileControls';
import { authAPI } from '../services/api';

const Game: React.FC = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<Sprite | null>(null);
  const animationIdRef = useRef<number | null>(null); // Stores the animation ID
  const imageRef = useRef<HTMLImageElement | null>(null); // Ref for the background image

  const keysRef = useRef({
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
    ArrowUp: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowDown: { pressed: false },
    ArrowRight: { pressed: false },
    lastPressed: null as Key | null, // Tracks the last pressed key
  });

  const [inBattle, setInBattle] = useState(false); // New state to control if we are in battle
  const [wasInBattle, setWasInBattle] = useState(false); // New state to control if the player was in battle
  const [initialPlayerPosition, setInitialPlayerPosition] = useState<{ x: number; y: number } | null>(null); // State to save the initial player position
  const [showPokedex, setShowPokedex] = React.useState(false); // State to control the Pokedex display
  const [showTooltip, setShowTooltip] = useState(false); // State to control the tooltip display
  const [mobileDirection, setMobileDirection] = useState<Key | null>(null); // Mobile movement direction

  // Check authentication on load
  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  // Function to start the animation
  const startAnimation = useCallback((c: CanvasRenderingContext2D) => {
    const boundaries: Boundary[] = [];
    const battleZones: BattleZone[] = [];
    const cols = 70; // Number of columns in your map
    const rows = 40; // Number of rows in your map

    if (!imageRef.current) return; // Check if the image is loaded

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

    // Calculate the offset
    const offsetX = (canvasRef.current!.width - canvasWidth) / 2;
    const offsetY = (canvasRef.current!.height - canvasHeight) / 2;

    // Calculate the width and height of each cell
    const cellWidth = canvasWidth / cols;
    const cellHeight = canvasHeight / rows;

    // Create battle zones taking the offset into account
    battleZonesData.forEach((symbol: number, index: number) => {
      if (symbol === 1) {
        const j = index % cols;
        const i = Math.floor(index / cols);
        battleZones.push(
          new BattleZone({
            width: cellWidth,
            height: cellHeight,
            position: {
              x: j * cellWidth + offsetX, // Adjust with the offset
              y: i * cellHeight + offsetY, // Adjust with the offset
            },
          })
        );
      }
    });

    // Create collision areas taking the offset into account
    collisions.forEach((symbol: number, index: number) => {
      if (symbol === 1) {
        const j = index % cols;
        const i = Math.floor(index / cols);
        boundaries.push(
          new Boundary({
            width: cellWidth,
            height: cellHeight,
            position: {
              x: j * cellWidth + offsetX, // Adjust with the offset
              y: i * cellHeight + offsetY, // Adjust with the offset
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

      // Draw the image in the center of the canvas
      c.drawImage(image, offsetX, offsetY, renderWidth, renderHeight);

      // // Draw collision areas
      // boundaries.forEach(boundary => {
      //   boundary.draw(c); // Boundaries are drawn at adjusted positions
      // });

      // // Draw battle areas
      // battleZones.forEach(battleZone => {
      //   battleZone.draw(c); // Battle zones are drawn at adjusted positions
      // });

      // Update keysRef with mobile movement if applicable
      let keysToUse = keysRef.current;
      if (mobileDirection) {
        // Create a copy of keys and simulate the mobile key pressed
        const mobileKeys = {
          w: { pressed: mobileDirection === 'w' || mobileDirection === 'ArrowUp' },
          a: { pressed: mobileDirection === 'a' || mobileDirection === 'ArrowLeft' },
          s: { pressed: mobileDirection === 's' || mobileDirection === 'ArrowDown' },
          d: { pressed: mobileDirection === 'd' || mobileDirection === 'ArrowRight' },
          ArrowUp: { pressed: mobileDirection === 'w' || mobileDirection === 'ArrowUp' },
          ArrowLeft: { pressed: mobileDirection === 'a' || mobileDirection === 'ArrowLeft' },
          ArrowDown: { pressed: mobileDirection === 's' || mobileDirection === 'ArrowDown' },
          ArrowRight: { pressed: mobileDirection === 'd' || mobileDirection === 'ArrowRight' },
          lastPressed: mobileDirection,
        };
        keysToUse = mobileKeys as any;
      }

      // Update and draw the player
      playerRef.current?.update(c, keysToUse, boundaries, battleZones);

      // Draw the player
      playerRef.current?.draw(c);

      // Continue the animation
      const hasKeyPressed = keysRef.current.w.pressed || keysRef.current.a.pressed || 
                           keysRef.current.s.pressed || keysRef.current.d.pressed ||
                           keysRef.current.ArrowUp.pressed || keysRef.current.ArrowDown.pressed ||
                           keysRef.current.ArrowLeft.pressed || keysRef.current.ArrowRight.pressed ||
                           mobileDirection !== null;
      if (hasKeyPressed) {
        animationIdRef.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationIdRef.current!);
        animationIdRef.current = null;
      }
    };

    animate(); // Start animation
  }, [mobileDirection]);

  // Battle exit logic
  const endBattle = () => {
    setInBattle(false);

    setWasInBattle(true);

    // Reset all keys
    keysRef.current.w.pressed = false;
    keysRef.current.a.pressed = false;
    keysRef.current.s.pressed = false;
    keysRef.current.d.pressed = false;
    keysRef.current.ArrowUp.pressed = false;
    keysRef.current.ArrowLeft.pressed = false;
    keysRef.current.ArrowDown.pressed = false;
    keysRef.current.ArrowRight.pressed = false;
    keysRef.current.lastPressed = null; // Reset the last pressed key
  };

  // Battle entry logic for child component
  const childPokedex = (open: boolean) => {
    if (open) {
      setShowPokedex(true);
    } else {
      setShowPokedex(false);
    }
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
          // Calculate the player size based on current canvas dimensions
          const playerSize = Math.min(canvas.width, canvas.height) / 10; // Player size based on canvas

          const playerPosition = wasInBattle && initialPlayerPosition
            ? initialPlayerPosition // Use the initial position if the player was in battle
            : {
              x: (canvas.width - playerSize) / 2, // Center the player on canvas width
              y: (canvas.height - playerSize) / 2, // Center the player on canvas height
            };

          // Create the player centered on canvas or return to initial position
          const player = new Sprite({
            position: playerPosition, // Pass the calculated position
            image: playerDownImage, // Start with the down image
            frames: { max: 2 },
            sprites: {
              up: playerUpImage,
              left: playerLeftImage,
              right: playerRightImage,
              down: playerDownImage,
            },
            size: playerSize, // Pass the player size
            inBattle: false,
          });

          playerRef.current = player; // Save the player in the ref to manipulate it later

          updateCanvasSize(); // Update the canvas and player size

          // Call the animation function to start
          startAnimation(c);
        });
      };
    };

    playerImagesLoad(); // Load player images

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key;
      // Check if the key exists in the keys object (excluding lastPressed)
      if (key !== 'lastPressed' && key in keysRef.current && keysRef.current[key as Key] && typeof keysRef.current[key as Key] === 'object' && 'pressed' in (keysRef.current[key as Key] as any)) {
        e.preventDefault();
        (keysRef.current[key as Key] as { pressed: boolean }).pressed = false;

        if (playerRef.current && !playerRef.current.inBattle) {
          playerRef.current.frameCurrent = 0; // Reset frame to 0
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      // Check if the key exists in the keys object (excluding lastPressed)
      if (key !== 'lastPressed' && key in keysRef.current && keysRef.current[key as Key] && typeof keysRef.current[key as Key] === 'object' && 'pressed' in (keysRef.current[key as Key] as any)) {
        e.preventDefault();
        (keysRef.current[key as Key] as { pressed: boolean }).pressed = true;
        // Update the last pressed key
        keysRef.current.lastPressed = key as Key;

        if (!animationIdRef.current) {
          startAnimation(c); // Start the animation with the correct image
        }
        if (playerRef.current!.inBattle) {
          setInBattle(true);
        }
        if (playerRef.current!.inBattle) {
          // If the player is in battle, save the initial position
          setInitialPlayerPosition({
            x: playerRef.current!.position.x,
            y: playerRef.current!.position.y,
          });
        }
      }
    };

    // Function to handle Escape key press
    const handleKeyEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();

        setShowPokedex(false); // Change state to display the Pokedex
      }
    };

    // Function to handle Enter key press
    const handleKeyEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();

        setShowPokedex(!showPokedex); // Change state to display the Pokedex
      }
    };

    // Add event listener for Escape key
    window.addEventListener('keydown', handleKeyEscape);
    // Add event listener for Enter key
    window.addEventListener('keypress', handleKeyEnter);
    // Add event listener for window resize
    window.addEventListener('resize', updateCanvasSize);
    // Add event listeners for key press
    window.addEventListener('keyup', handleKeyUp);
    // Add event listeners for key release
    window.addEventListener('keydown', handleKeyDown);
    
    // Listener to close Pokedex via mobile
    const handleClosePokedex = () => {
      setShowPokedex(false);
    };
    window.addEventListener('closePokedex', handleClosePokedex as EventListener);

    return () => {
      window.removeEventListener('keydown', handleKeyEscape);
      window.removeEventListener('keypress', handleKeyEnter);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('closePokedex', handleClosePokedex as EventListener);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [inBattle, initialPlayerPosition, showPokedex, startAnimation, wasInBattle]);

  return (
    <>
      <GameProvider>
        <div
          className="flex justify-center items-center w-full h-full"
          style={{
            backgroundColor: 'var(--bg-secondary)',
          }}
        >

          {
            inBattle ? (
              // Renderiza a cena de batalha se o estado inBattle for verdadeiro
              <BattleScene endBattle={endBattle} childPokedex={childPokedex} />
            ) : (
              <>
                <div 
                  className="absolute top-0 left-0 w-full h-full flex justify-center items-center"
                  style={{
                    backgroundColor: 'var(--bg-overlay)',
                  }}
                >
                  <div style={{ color: 'var(--text)' }}>Loading...</div>
                </div>
                <div
                  className="absolute w-full h-full flex justify-center items-center"
                  style={{
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    style={{
                      width: '80%',
                      height: '80%',
                    }}
                    className="absolute"
                  />
                  {/* Game Info Tooltip - inside the map area */}
                  <GameInfoTooltip isOpen={showTooltip} onClose={() => setShowTooltip(false)} />
                </div>
              </>
            )}

          {/* Mobile Controls */}
          {!inBattle && (
            <MobileControls
              onMove={(direction) => {
                // Convert direction to Key
                let key: Key;
                switch (direction) {
                  case 'up':
                    key = 'w';
                    break;
                  case 'down':
                    key = 's';
                    break;
                  case 'left':
                    key = 'a';
                    break;
                  case 'right':
                    key = 'd';
                    break;
                }
                setMobileDirection(key);
                if (!animationIdRef.current) {
                  const c = canvasRef.current?.getContext('2d');
                  if (c) startAnimation(c);
                }
              }}
              onStop={() => {
                setMobileDirection(null);
              }}
              onOpenPokedex={() => {
                setShowPokedex(!showPokedex);
              }}
              onToggleTooltip={() => {
                setShowTooltip(!showTooltip);
              }}
              isPokedexOpen={showPokedex}
            />
          )}

          {/* Mensagem para pressionar Enter - apenas desktop */}
          {!showPokedex && (
            <div
              className="absolute bottom-10 text-center w-full hidden md:block"
              style={{
                color: 'var(--text)',
                fontSize: '1.25rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
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

export default Game;

