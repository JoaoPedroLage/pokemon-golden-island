/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
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
  const frameCountRef = useRef<number>(0); // Frame counter for saving position

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
  const [playerPositionBeforePokedex, setPlayerPositionBeforePokedex] = useState<{ x: number; y: number } | null>(null); // State to save player position before opening pokedex
  const [showPokedex, setShowPokedex] = React.useState(false); // State to control the Pokedex display
  const [showTooltip, setShowTooltip] = useState(false); // State to control the tooltip display
  const [isLandscape, setIsLandscape] = useState(false); // State to track landscape orientation (not used for rotation anymore)
  const [isLoading, setIsLoading] = useState(false); // State to control loading overlay - start as false, will be set to true when authenticated
  const [isDesktop, setIsDesktop] = useState(false); // State to track if device is desktop/notebook
  const [isMobileDevice, setIsMobileDevice] = useState(false); // State to track if device is mobile
  const [viewMode, setViewMode] = useState<'full' | 'fog'>('fog'); // View mode: 'full' for full map, 'fog' for fog of war
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // State to track if we're checking authentication

  const revealedAreasRef = useRef<Set<string>>(new Set()); // Track revealed areas in fog of war mode
  const cameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 }); // Camera position

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      
      // Check if token exists
    if (!authAPI.isAuthenticated()) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      // Validate token by making a request to the backend
      const token = authAPI.getToken();
      if (token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/players`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            // Valid token, allow access
            setIsAuthenticated(true);
            setIsCheckingAuth(false);
            setIsLoading(true); // Start loading images after authentication is validated
          } else {
            // Invalid token, clear but don't redirect
            authAPI.logout();
            setIsAuthenticated(false);
            setIsCheckingAuth(false);
          }
        } catch (error) {
          // Error validating token, clear but don't redirect
          console.error('Error validating token:', error);
          authAPI.logout();
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
      } else {
        // No token
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // Function to start the animation
  const startAnimation = useCallback((c: CanvasRenderingContext2D) => {
    if (!canvasRef.current) return; // Check if canvas exists

    const boundaries: Boundary[] = [];
    const battleZones: BattleZone[] = [];
    const cols = 70; // Number of columns in your map
    const rows = 40; // Number of rows in your map

    if (!imageRef.current) return; // Check if the image is loaded

    c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const image = imageRef.current;

    const imageAspectRatio = image.width / image.height;
    const canvasAspectRatio = canvasRef.current.width / canvasRef.current.height;

    let canvasWidth, canvasHeight;

    if (imageAspectRatio > canvasAspectRatio) {
      canvasWidth = canvasRef.current.width;
      canvasHeight = canvasRef.current.width / imageAspectRatio;
    } else {
      canvasHeight = canvasRef.current.height;
      canvasWidth = canvasRef.current.height * imageAspectRatio;
    }

    // Calculate the offset
    const offsetX = (canvasRef.current.width - canvasWidth) / 2;
    const offsetY = (canvasRef.current.height - canvasHeight) / 2;

    // Calculate the width and height of each cell
    const cellWidth = canvasWidth / cols;
    const cellHeight = canvasHeight / rows;

    // Create battle zones taking the offset into account
    battleZonesData.forEach((symbol: number, index: number) => {
      if (symbol === 1 || symbol === 2 || symbol === 3) {
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
            zoneType: symbol, // Pass zone type: 1 = normal, 2 = water/ice, 3 = ground/rock/dragon
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
      if (!imageRef.current || !canvasRef.current || !playerRef.current) return;

      c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const image = imageRef.current;

      const imageAspectRatio = image.width / image.height;
      const canvasAspectRatio = canvasRef.current.width / canvasRef.current.height;

      let renderWidth, renderHeight;

      if (imageAspectRatio > canvasAspectRatio) {
        renderWidth = canvasRef.current.width;
        renderHeight = canvasRef.current.width / imageAspectRatio;
      } else {
        renderHeight = canvasRef.current.height;
        renderWidth = canvasRef.current.height * imageAspectRatio;
      }

      const offsetX = (canvasRef.current.width - renderWidth) / 2;
      const offsetY = (canvasRef.current.height - renderHeight) / 2;

      // Update camera to follow player (centered on player) in fog mode
      if (viewMode === 'fog') {
        // Center camera on player
        cameraRef.current.x = playerRef.current.position.x - canvasRef.current.width / 2;
        cameraRef.current.y = playerRef.current.position.y - canvasRef.current.height / 2;
      } else {
        // Full map view - no camera offset
        cameraRef.current.x = 0;
        cameraRef.current.y = 0;
      }

      // Save context state
      c.save();

      // Apply camera offset and zoom for fog of war mode
      if (viewMode === 'fog') {
        c.translate(-cameraRef.current.x, -cameraRef.current.y);
        // Apply zoom effect
        const scale = 1.8; // 1.8x zoom for better detail
        const centerX = playerRef.current.position.x;
        const centerY = playerRef.current.position.y;
        c.translate(centerX, centerY);
        c.scale(scale, scale);
        c.translate(-centerX, -centerY);
      }

      // Draw the image in the center of the canvas
      c.drawImage(image, offsetX, offsetY, renderWidth, renderHeight);

      // Update revealed areas in fog of war mode
      if (viewMode === 'fog' && playerRef.current) {
        const playerX = playerRef.current.position.x;
        const playerY = playerRef.current.position.y;
        const visionRadius = Math.min(renderWidth, renderHeight) * 0.3; // Vision radius based on canvas size

        // Mark area around player as revealed
        const gridSize = 20; // Grid cell size for revealed areas
        const startX = Math.floor((playerX - visionRadius) / gridSize);
        const endX = Math.ceil((playerX + visionRadius) / gridSize);
        const startY = Math.floor((playerY - visionRadius) / gridSize);
        const endY = Math.ceil((playerY + visionRadius) / gridSize);

        for (let x = startX; x <= endX; x++) {
          for (let y = startY; y <= endY; y++) {
            const cellX = x * gridSize;
            const cellY = y * gridSize;
            const distance = Math.sqrt(
              Math.pow(cellX - playerX, 2) + Math.pow(cellY - playerY, 2)
            );
            if (distance <= visionRadius) {
              revealedAreasRef.current.add(`${x},${y}`);
            }
          }
        }
      }

      // Restore context state
      c.restore();

      // // Draw collision areas
      // boundaries.forEach(boundary => {
      //   boundary.draw(c); // Boundaries are drawn at adjusted positions
      // });

      // // Draw battle areas
      // battleZones.forEach(battleZone => {
      //   battleZone.draw(c); // Battle zones are drawn at adjusted positions
      // });

      // Save context state before drawing player
      c.save();

      // Apply camera offset and zoom for fog of war mode
      if (viewMode === 'fog') {
        c.translate(-cameraRef.current.x, -cameraRef.current.y);
        // Apply same zoom effect as background
        const scale = 1.8;
        const centerX = playerRef.current.position.x;
        const centerY = playerRef.current.position.y;
        c.translate(centerX, centerY);
        c.scale(scale, scale);
        c.translate(-centerX, -centerY);
      }

      // Update and draw the player - use keysRef directly (same as keyboard)
      playerRef.current?.update(c, keysRef.current, boundaries, battleZones);

      // Save player position to localStorage periodically (every 60 frames ~ 1 second at 60fps)
      frameCountRef.current += 1;
      if (playerRef.current && frameCountRef.current % 60 === 0) {
        try {
          localStorage.setItem('playerPosition', JSON.stringify({
            x: playerRef.current.position.x,
            y: playerRef.current.position.y
          }));
          // Save revealed areas
          if (viewMode === 'fog') {
            localStorage.setItem('revealedAreas', JSON.stringify(Array.from(revealedAreasRef.current)));
          }
        } catch (e) {
          console.error('Error saving player position:', e);
        }
      }

      // Draw the player
      playerRef.current?.draw(c);

      // Restore context state
      c.restore();

      // Draw fog of war overlay if in fog mode
      if (viewMode === 'fog') {
        c.save();

        if (playerRef.current) {
          const visionRadius = Math.min(canvasRef.current.width, canvasRef.current.height) * 0.45;
          const centerX = canvasRef.current.width / 2;
          const centerY = canvasRef.current.height / 2;

          // Create circular clipping path (the area that will be visible)
          c.beginPath();
          c.arc(centerX, centerY, visionRadius, 0, Math.PI * 2);
          c.closePath();

          // Invert the clipping region: everything EXCEPT the circle
          c.rect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Use even-odd fill rule to create a hole in the middle
          c.clip('evenodd');

          // Fill the clipped area (everything except the circle) with black
          c.fillStyle = 'rgba(0, 0, 0, 0.95)';
          c.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Reset clipping
          c.restore();
          c.save();

          // Optionally: Add a subtle gradient at the circle edge for softer transition
          const edgeGradient = c.createRadialGradient(
            centerX, centerY, visionRadius - 30,
            centerX, centerY, visionRadius + 30
          );
          edgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          edgeGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
          edgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');

          c.fillStyle = edgeGradient;
          c.beginPath();
          c.arc(centerX, centerY, visionRadius + 30, 0, Math.PI * 2);
          c.fill();

        }

        c.restore();
      }

      // Continue the animation - check only keysRef (same as keyboard)
      const hasKeyPressed = keysRef.current.w.pressed || keysRef.current.a.pressed ||
        keysRef.current.s.pressed || keysRef.current.d.pressed ||
        keysRef.current.ArrowUp.pressed || keysRef.current.ArrowDown.pressed ||
        keysRef.current.ArrowLeft.pressed || keysRef.current.ArrowRight.pressed;
      if (hasKeyPressed) {
        animationIdRef.current = requestAnimationFrame(animate);
      } else {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        animationIdRef.current = null;
        frameCountRef.current = 0; // Reset frame counter when animation stops
      }
    };

    if (playerRef.current) {
      animate(); // Start animation
    }
  }, [viewMode]);

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
    // Only load images if authenticated
    if (!isAuthenticated) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const c = canvas.getContext('2d');
    if (!c) return;

    const updateCanvasSize = () => {
      if (!canvasRef.current) return; // Check if canvas exists

      // Check if device is mobile and in portrait mode
      // Use a more reliable breakpoint to prevent canvas from disappearing
      const isMobile = window.innerWidth < 768;
      const isDesktopDevice = window.innerWidth >= 768;

      setIsDesktop(isDesktopDevice);

      // Ensure canvas container is always visible, especially for widths between 730-768px
      if (window.innerWidth < 768) {
        // Force mobile behavior for any width below 768px
        if (canvasRef.current && canvasRef.current.parentElement) {
          const parent = canvasRef.current.parentElement;
          parent.style.display = 'block';
          parent.style.visibility = 'visible';
          parent.style.opacity = '1';

          // Also ensure the grandparent container is visible
          if (parent.parentElement) {
            parent.parentElement.style.display = 'block';
            parent.parentElement.style.visibility = 'visible';
            parent.parentElement.style.opacity = '1';
          }
        }
      }

      // Define minimum dimensions to prevent canvas from disappearing
      const MIN_WIDTH = 320;
      const MIN_HEIGHT = 240;

      // Ensure we always have valid dimensions
      const screenWidth = Math.max(window.innerWidth || 320, MIN_WIDTH);
      const screenHeight = Math.max(window.innerHeight || 240, MIN_HEIGHT);

      // Set mobile device state for rotation control
      setIsMobileDevice(isMobile);

      // Set isLandscape to false for mobile (we'll rotate the canvas instead)
      // This ensures consistent behavior
      if (isMobile) {
        // Mobile: swap width/height since canvas will be rotated 90deg
        // Use viewport height as canvas width (becomes screen width after rotation)
        canvas.width = Math.max(screenHeight, MIN_WIDTH);
        canvas.height = Math.max(screenWidth, MIN_HEIGHT);
        setIsLandscape(false); // Let CSS handle rotation
        console.log('Mobile mode: canvas size set to', canvas.width, 'x', canvas.height, 'isMobile:', isMobile);
      } else {
        // Desktop/Notebook: use full window size (canvas will be scaled to 80% via CSS)
        canvas.width = Math.max(screenWidth, MIN_WIDTH);
        canvas.height = Math.max(screenHeight, MIN_HEIGHT);
        setIsLandscape(false);
      }

      // Force canvas to be visible
      if (canvasRef.current) {
        canvasRef.current.style.display = 'block';
        canvasRef.current.style.visibility = 'visible';
        canvasRef.current.style.opacity = '1';
      }

      if (!imageRef.current) return; // Check if image is loaded

      const image = imageRef.current;

      if (!canvasRef.current) return; // Check again after updating size

      const imageAspectRatio = image.width / image.height;
      const canvasAspectRatio = canvasRef.current.width / canvasRef.current.height;

      let renderWidth, renderHeight;

      if (imageAspectRatio > canvasAspectRatio) {
        renderWidth = canvasRef.current.width;
        renderHeight = canvasRef.current.width / imageAspectRatio;
      } else {
        renderHeight = canvasRef.current.height;
        renderWidth = canvasRef.current.height * imageAspectRatio;
      }

      const playerNeWSize = Math.min(renderWidth, renderHeight) / 10; // Player size based on screen

      // Update player size and position
      if (playerRef.current) {
        playerRef.current.resize(playerNeWSize, canvas.width, canvas.height, wasInBattle, setWasInBattle); // Update player size
      }

      // Redraw canvas
      if (imageRef.current) {
        c.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
        startAnimation(c); // Restart animation with new proportions
      }
    };

    // Function to load player images
    const playerImagesLoad = () => {
      // Create all image objects first
      const image = new Image();
      const playerDownImage = new Image();
      const playerUpImage = new Image();
      const playerLeftImage = new Image();
      const playerRightImage = new Image();

      // Set image sources
      image.src = 'https://storage.cloud.google.com/pokemon-golden-island/pokemonTileSetMap.png';
      playerDownImage.src = 'https://storage.cloud.google.com/pokemon-golden-island/playerDown.png';
      playerUpImage.src = 'https://storage.cloud.google.com/pokemon-golden-island/playerUp.png';
      playerLeftImage.src = 'https://storage.cloud.google.com/pokemon-golden-island/playerLeft.png';
      playerRightImage.src = 'https://storage.cloud.google.com/pokemon-golden-island/playerRight.png';

      // Wait for ALL images to load before proceeding
      Promise.all([
        new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        }),
        new Promise((resolve, reject) => {
          playerDownImage.onload = resolve;
          playerDownImage.onerror = reject;
        }),
        new Promise((resolve, reject) => {
          playerUpImage.onload = resolve;
          playerUpImage.onerror = reject;
        }),
        new Promise((resolve, reject) => {
          playerLeftImage.onload = resolve;
          playerLeftImage.onerror = reject;
        }),
        new Promise((resolve, reject) => {
          playerRightImage.onload = resolve;
          playerRightImage.onerror = reject;
        }),
      ]).then(() => {
        // All images loaded successfully
        imageRef.current = image; // Store image in ref
          // Calculate the player size based on current canvas dimensions
          const playerSize = Math.min(canvas.width, canvas.height) / 10; // Player size based on canvas

          // Try to load saved position from localStorage
          let savedPosition: { x: number; y: number } | null = null;
          try {
            const saved = localStorage.getItem('playerPosition');
            if (saved) {
              const parsed = JSON.parse(saved);
              // Validate saved position is within canvas bounds (with some margin for safety)
              const margin = playerSize;
              if (parsed.x >= -margin && parsed.x <= canvas.width + margin &&
                parsed.y >= -margin && parsed.y <= canvas.height + margin) {
                // Clamp position to canvas bounds
                savedPosition = {
                  x: Math.max(0, Math.min(canvas.width - playerSize, parsed.x)),
                  y: Math.max(0, Math.min(canvas.height - playerSize, parsed.y))
                };
              }
            }
          } catch (e) {
            console.error('Error loading saved position:', e);
          }

          const playerPosition = wasInBattle && initialPlayerPosition
            ? initialPlayerPosition // Use the initial position if the player was in battle
            : savedPosition || {
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

          playerRef.current = player; // Save player in ref to manipulate later

          updateCanvasSize(); // Update canvas and player size

          // Hide loading overlay only after ALL images are loaded and player is created
          setIsLoading(false);

          // Call animation function to start after a small delay to ensure everything is ready
          setTimeout(() => {
            if (playerRef.current && imageRef.current && canvasRef.current) {
              startAnimation(c);
            }
          }, 100);
        }).catch((error) => {
          console.error('Error loading images:', error);
          // Still hide loading to prevent infinite loading screen
          setIsLoading(false);
          alert('Failed to load game images. Please refresh the page.');
        });
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

        // Save current position before closing pokedex
        if (playerRef.current && showPokedex) {
          setPlayerPositionBeforePokedex({
            x: playerRef.current.position.x,
            y: playerRef.current.position.y
          });
          // Save to localStorage immediately
          try {
            localStorage.setItem('playerPosition', JSON.stringify({
              x: playerRef.current.position.x,
              y: playerRef.current.position.y
            }));
          } catch (e) {
            console.error('Error saving player position:', e);
          }
        }
        setShowPokedex(false); // Change state to close the Pokedex
      }
    };

    // Function to handle Enter key press
    const handleKeyEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();

        if (!showPokedex) {
          // Opening pokedex - save current position
          if (playerRef.current) {
            setPlayerPositionBeforePokedex({
              x: playerRef.current.position.x,
              y: playerRef.current.position.y
            });
            // Save to localStorage immediately
            try {
              localStorage.setItem('playerPosition', JSON.stringify({
                x: playerRef.current.position.x,
                y: playerRef.current.position.y
              }));
            } catch (e) {
              console.error('Error saving player position:', e);
            }
          }
        } else {
          // Closing pokedex - restore position
          if (playerRef.current && playerPositionBeforePokedex) {
            playerRef.current.position.x = playerPositionBeforePokedex.x;
            playerRef.current.position.y = playerPositionBeforePokedex.y;
            // Save to localStorage
            try {
              localStorage.setItem('playerPosition', JSON.stringify(playerPositionBeforePokedex));
            } catch (e) {
              console.error('Error saving player position:', e);
            }
          }
        }
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
      // Restore position when closing pokedex via mobile button
      if (playerRef.current && playerPositionBeforePokedex) {
        playerRef.current.position.x = playerPositionBeforePokedex.x;
        playerRef.current.position.y = playerPositionBeforePokedex.y;
        // Save to localStorage
        try {
          localStorage.setItem('playerPosition', JSON.stringify(playerPositionBeforePokedex));
        } catch (e) {
          console.error('Error saving player position:', e);
        }
      }
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
  }, [inBattle, initialPlayerPosition, showPokedex, playerPositionBeforePokedex, startAnimation, wasInBattle, isAuthenticated]);

  // Show loading screen while checking authentication
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

  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div
          className="text-center max-w-md mx-auto p-8 rounded-lg shadow-lg"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '2px solid var(--border-medium)',
          }}
        >
          <div
            className="text-6xl mb-4"
            style={{ opacity: 0.8 }}
          >
            🔒
          </div>
          <h1
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            You are not authenticated
          </h1>
          <p
            className="text-base mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            You need to be logged in to access the game. Please log in to continue.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 rounded-lg transition-all hover:opacity-90 font-medium"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)',
              border: '2px solid var(--border-medium)',
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <GameProvider>
        <div
          className="flex justify-center items-center w-full h-full"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            touchAction: inBattle ? 'auto' : 'none', // Allow touch events during battle
            zIndex: 1, // Base z-index for the container
          }}
        >

          {
            inBattle ? (
              // Render battle scene if inBattle state is true
              // Rotate to landscape mode on mobile (cellphone lying down)
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: isMobileDevice ? 'rotate(90deg)' : 'none',
                  transformOrigin: 'center center',
                  zIndex: 1000, // Higher than MobileControls (50), Pokedex (50), and other elements
                  backgroundColor: 'var(--bg-secondary)',
                  overflow: 'hidden',
                }}
              >
                <BattleScene endBattle={endBattle} childPokedex={childPokedex} />
              </div>
            ) : (
              <>
                {isLoading && !inBattle && (
                  <div
                    className="absolute top-0 left-0 w-full h-full flex justify-center items-center"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      zIndex: 999,
                    }}
                  >
                    <div 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <NextImage 
                        src="https://storage.cloud.google.com/pokemon-golden-island/pokeball.gif" 
                        alt="Loading..." 
                        width={100}
                        height={100}
                        unoptimized
                        priority
                      />
                      <div style={{ color: 'var(--text)', fontSize: '1.2rem' }}>Loading...</div>
                    </div>
                  </div>
                )}
                <div
                  className="absolute w-full h-full"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    minWidth: '320px',
                    minHeight: '240px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-secondary)',
                    display: inBattle ? 'none' : 'block', // Hide canvas when in battle
                    visibility: inBattle ? 'hidden' : 'visible',
                    opacity: inBattle ? 0 : 1,
                    zIndex: inBattle ? -1 : 1, // Put canvas behind when in battle
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      // Mobile devices ALWAYS rotate 90deg, desktop never rotates
                      transform: isMobileDevice
                        ? 'translate(-50%, -50%) rotate(90deg)'
                        : 'translate(-50%, -50%)',
                      transformOrigin: 'center center',
                      // Mobile: use viewport height as width (since rotated) to fill screen
                      width: isMobileDevice ? '100vh' : isDesktop ? '80%' : '100vw',
                      height: isMobileDevice ? '100vw' : isDesktop ? '80%' : '100vh',
                      minWidth: '320px',
                      minHeight: '240px',
                      maxWidth: isMobileDevice ? '100vh' : isDesktop ? '80%' : '100vw',
                      maxHeight: isMobileDevice ? '100vw' : isDesktop ? '80%' : '100vh',
                      top: '50%',
                      left: '50%',
                      display: 'block',
                      visibility: 'visible',
                      opacity: 1,
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        minWidth: '320px',
                        minHeight: '240px',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        visibility: 'visible',
                        opacity: 1,
                      }}
                    />
                  </div>
                  {/* View Mode Toggle Button - top left on desktop, top right on mobile - only show when not in battle */}
                  {!inBattle && (
                  <button
                    onClick={() => {
                      const newMode = viewMode === 'full' ? 'fog' : 'full';
                      setViewMode(newMode);
                      // Clear revealed areas when switching to fog mode
                      if (newMode === 'fog') {
                        revealedAreasRef.current.clear();
                      }
                    }}
                    className="fixed z-50 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
                    style={{
                      width: '3rem',
                      height: '3rem',
                      top: '1rem',
                      left: isMobileDevice ? 'auto' : '1rem',
                      right: isMobileDevice ? '1rem' : 'auto',
                      backgroundColor: viewMode === 'fog' ? 'var(--primary)' : 'var(--success)',
                      color: 'var(--text-inverse)',
                      border: '2px solid var(--border-medium)',
                      zIndex: 100,
                      transform: isMobileDevice ? 'rotate(90deg)' : 'none',
                    }}
                    aria-label={viewMode === 'fog' ? 'Switch to full map view' : 'Switch to fog of war view'}
                    title={viewMode === 'fog' ? 'Show full map' : 'Show fog of war'}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{viewMode === 'fog' ? '🗺️' : '👁️'}</span>
                  </button>
                  )}
                </div>
              </>
            )}

          {/* Mobile Controls */}
          {!inBattle && (
            <MobileControls
              isLandscape={isLandscape}
              onMove={(direction) => {
                // Convert direction to Key (same as keyboard)
                let key: Key;
                switch (direction) {
                  case 'up':
                    key = isLandscape ? 'ArrowLeft' : 'w';
                    break;
                  case 'down':
                    key = isLandscape ? 'ArrowRight' : 's';
                    break;
                  case 'left':
                    key = isLandscape ? 'ArrowDown' : 'a';
                    break;
                  case 'right':
                    key = isLandscape ? 'ArrowUp' : 'd';
                    break;
                }

                // Update keysRef exactly like keyboard keydown (same behavior)
                if (key in keysRef.current && keysRef.current[key as Key] && typeof keysRef.current[key as Key] === 'object' && 'pressed' in (keysRef.current[key as Key] as any)) {
                  (keysRef.current[key as Key] as { pressed: boolean }).pressed = true;
                  keysRef.current.lastPressed = key;

                  if (!animationIdRef.current) {
                    const c = canvasRef.current?.getContext('2d');
                    if (c) startAnimation(c);
                  }
                }
              }}
              onStop={(direction) => {
                // Convert direction to Key to reset the correct key (same as keyboard keyup)
                let key: Key;
                switch (direction) {
                  case 'up':
                    key = isLandscape ? 'ArrowLeft' : 'w';
                    break;
                  case 'down':
                    key = isLandscape ? 'ArrowRight' : 's';
                    break;
                  case 'left':
                    key = isLandscape ? 'ArrowDown' : 'a';
                    break;
                  case 'right':
                    key = isLandscape ? 'ArrowUp' : 'd';
                    break;
                }

                // Reset key exactly like keyboard keyup (same behavior)
                if (key in keysRef.current && keysRef.current[key as Key] && typeof keysRef.current[key as Key] === 'object' && 'pressed' in (keysRef.current[key as Key] as any)) {
                  (keysRef.current[key as Key] as { pressed: boolean }).pressed = false;

                  if (playerRef.current && !playerRef.current.inBattle) {
                    playerRef.current.frameCurrent = 0; // Reset frame to 0
                  }
                }
              }}
              onOpenPokedex={() => {
                if (!showPokedex) {
                  // Opening pokedex - save current position
                  if (playerRef.current) {
                    setPlayerPositionBeforePokedex({
                      x: playerRef.current.position.x,
                      y: playerRef.current.position.y
                    });
                    // Save to localStorage immediately
                    try {
                      localStorage.setItem('playerPosition', JSON.stringify({
                        x: playerRef.current.position.x,
                        y: playerRef.current.position.y
                      }));
                    } catch (e) {
                      console.error('Error saving player position:', e);
                    }
                  }
                } else {
                  // Closing pokedex - restore position
                  if (playerRef.current && playerPositionBeforePokedex) {
                    playerRef.current.position.x = playerPositionBeforePokedex.x;
                    playerRef.current.position.y = playerPositionBeforePokedex.y;
                    // Save to localStorage
                    try {
                      localStorage.setItem('playerPosition', JSON.stringify(playerPositionBeforePokedex));
                    } catch (e) {
                      console.error('Error saving player position:', e);
                    }
                  }
                }
                setShowPokedex(!showPokedex);
              }}
              onToggleTooltip={() => {
                setShowTooltip(!showTooltip);
              }}
              isPokedexOpen={showPokedex}
            />
          )}

          {/* Game Info Tooltip - outside map container, rendered after MobileControls to ensure it's on top - only show when not in battle */}
          {!inBattle && <GameInfoTooltip isOpen={showTooltip} onClose={() => setShowTooltip(false)} onToggle={() => setShowTooltip(!showTooltip)} />}

          {/* Message to press Enter - desktop only */}
          {!showPokedex && !inBattle && (
            <div
              className="fixed bottom-10 text-center w-full hidden md:block"
              style={{
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                zIndex: 100,
                pointerEvents: 'none',
              }}
            >
              Press <span className="font-bold" style={{ color: 'var(--primary)' }}>Enter</span> to open the Pokédex
            </div>
          )}

          {showPokedex && <Pokedex />}
        </div>
      </GameProvider>
    </>
  );
};

export default Game;

