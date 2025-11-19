/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import ImageNext from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BattleSceneProps, Pokemon } from '../interfaces/mainInterface';
import { useGameContext } from '../context/GameContext';

const BattleScreen: React.FC<BattleSceneProps> = ({ endBattle, childPokedex }) => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [catchStatus, setCatchStatus] = useState<'none' | 'waiting' | 'catch' | 'escape' | null>(null);
  const [isThrowing, setIsThrowing] = useState(false);
  const [givingBerry, setGivingBerry] = useState(false);
  const [showPokemon, setShowPokemon] = useState(true);
  const [currentBerryReward, setCurrentBerryReward] = useState<number | null>(null);
  const [currentPokeballReward, setCurrentPokeballReward] = useState<number | null>(null);
  const [bonusCatchChance, setBonusCatchChance] = useState(0);
  const [showPokedex, setShowPokedex] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // For hydration handling
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 }); // For dynamic viewport dimensions

  const imageRefs = useRef<{ [key: string]: HTMLImageElement }>({});
  
  // Add refs for buttons
  const ballButtonRef = useRef<HTMLButtonElement>(null);
  const berryButtonRef = useRef<HTMLButtonElement>(null);
  const runButtonRef = useRef<HTMLButtonElement>(null);

  const {
    pokeballs,
    berries,
    setTotalPokemons,
    resetGame,
    decrementPokeball, // Renamed from usePokeball
    addCapturedPokemon,
    addBerry,
    addPokeballs,
    decrementBerry // Renamed from useBerry
  } = useGameContext();

  // Handler for berry button (works with both mouse and touch)
  const HandleBerryClick = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (berries <= 0 || catchStatus === 'catch' || isThrowing) return; // Don't allow using berry if conditions not met
    
    setGivingBerry(true);
    decrementBerry(); // Renamed from useBerry

    // Each berry gives a bonus of 0.05 to 0.15 (5% to 15%) and accumulates up to a maximum of 0.5 (50%)
    const berryBonus = Math.random() * 0.1 + 0.05; // Bonus of 5% to 15% per berry
    const newBonusChance = Math.min(bonusCatchChance + berryBonus, 0.5); // Limits the maximum bonus to 50%
    setBonusCatchChance(newBonusChance);
    
    console.log(`Berry used! Current bonus: ${(newBonusChance * 100).toFixed(1)}%`);

    setTimeout(() => {
      setGivingBerry(false);
    }, 2000);
  }, [berries, catchStatus, isThrowing, bonusCatchChance, decrementBerry]);

  // Handler for end battle button (works with both mouse and touch)
  const HandleEndBattle = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (pokeballs === 0) resetGame();
    endBattle();
  }, [pokeballs, resetGame, endBattle]);

  // Handler for pokeball button (works with both mouse and touch)
  const HandleBallClick = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Use refs or check state INSIDE setTimeout to get fresh values
    // The problem is that pokeballs value in closure is stale
    // Solution: Check conditions using a function that will be called when button is clicked
    
    // Move getPokemonDifficult inside useCallback to avoid dependency issues
    const getPokemonDifficult = (berry = 0) => {
      if (!pokemon) return 0;

      const legendaryPokemon = ['mewtwo', 'mew', 'articuno', 'zapdos', 'moltres'];
      const mythicalPokemon = ['mew'];
      const rareTypes = ['dragon', 'ghost', 'psychic'];
      
      const pokemonTypes = Array.isArray(pokemon.type) 
        ? pokemon.type 
        : typeof pokemon.type === 'string' 
          ? pokemon.type.split(',').map(t => t.trim().toLowerCase())
          : [];
      
      const isLegendary = legendaryPokemon.includes(pokemon.name.toLowerCase());
      const isMythical = mythicalPokemon.includes(pokemon.name.toLowerCase());
      const hasRareType = rareTypes.some((rareType) => 
        pokemonTypes.some((type: string) => type.toLowerCase() === rareType)
      );

      if (isLegendary || pokemon.name.toLowerCase() === 'mewtwo') {
        return Math.max(0.95 - berry, 0.05);
      } else if (isMythical) {
        return Math.max(0.90 - berry, 0.10);
      } else if (hasRareType) {
        return Math.max(0.85 - berry, 0.15);
      } else {
        return Math.max(0.70 - berry, 0.30);
      }
    };

    // Check conditions - these will use current state at the time of click
    if (catchStatus === 'catch' || isThrowing) {
      return;
    }

    // Call decrementPokeball which will decrement and we'll check inside
    // Store pokeballs BEFORE decrementing
    const currentPokeballs = pokeballs;
    
    // Check if we have pokeballs
    if (currentPokeballs <= 0) {
      console.log('No pokeballs left!');
      return;
    }

    decrementPokeball(); // Renamed from usePokeball
    setIsThrowing(true);
    setCatchStatus(null);
    setShowPokemon(false);

    setTimeout(() => {
      const catchChance = Math.random();
      const success = catchChance >= getPokemonDifficult(bonusCatchChance);
      console.log(bonusCatchChance, catchChance, getPokemonDifficult(bonusCatchChance))

      setIsThrowing(false);

      if (success) {
        setCatchStatus('catch');
        if (pokemon)
          addCapturedPokemon(pokemon);

        const berryChance = Math.random();
        if (berryChance < 0.3) {
          setCurrentBerryReward(1);
          addBerry();
        }

        const lowPokeballs = currentPokeballs <= 5;
        const pokeballReward = Math.random();
        const rewardChanceThreshold = lowPokeballs ? Math.min(0.35 * 2, 1) : 0.5;

        if (pokeballReward < rewardChanceThreshold) {
          const rewardAmount = lowPokeballs
            ? Math.floor(Math.random() * 7) + 4
            : Math.floor(Math.random() * 8) + 2;
          setCurrentPokeballReward(rewardAmount);
          addPokeballs(rewardAmount);
        }
      } else {
        setCatchStatus('escape');
        setTimeout(() => {
          setCatchStatus('none');
          setShowPokemon(true);
        }, 1000);
      }
    }, 2000);
  }, [pokeballs, catchStatus, isThrowing, pokemon, bonusCatchChance, decrementPokeball, addCapturedPokemon, addBerry, addPokeballs]);

  // Handle hydration and detect mobile device with multiple checks
  useEffect(() => {
    setIsMounted(true);

    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    const checkMobile = () => {
      if (typeof window === 'undefined') return;
      
      // Multiple checks for better reliability
      const width = window.innerWidth;
      const isMobileWidth = width < 768;
      const isTouchDevice = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Consider mobile if width is small AND (has touch OR mobile user agent)
      const isMobileDevice = isMobileWidth && (isTouchDevice || isMobileUserAgent);
      
      setIsMobile(isMobileDevice);
      updateDimensions();
    };

    // Initial check
    checkMobile();
    updateDimensions();

    // Listen to resize and orientation changes
    window.addEventListener('resize', () => {
      checkMobile();
      updateDimensions();
    });
    window.addEventListener('orientationchange', () => {
      // Delay to ensure dimensions are updated after orientation change
      setTimeout(() => {
        checkMobile();
        updateDimensions();
      }, 100);
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  useEffect(() => {
    const fetchRandomPokemon = async () => {
      // Reset berry bonus for each new battle
      setBonusCatchChance(0);
      
      const baseResponse = 'https://pokeapi.co/api/v2';
      const getSafeSprite = (detailsData: any) => {
        return (
          detailsData?.sprites?.front_default ||
          detailsData?.sprites?.other?.['official-artwork']?.front_default ||
          detailsData?.sprites?.other?.home?.front_default ||
          detailsData?.sprites?.other?.dream_world?.front_default ||
          'https://storage.googleapis.com/pokemon-golden-island/playerBackSprite.png'
        );
      };
      const generationOne = await fetch('https://pokeapi.co/api/v2/generation/1');
      const dataGenerationOne = await generationOne.json();

      const pokemonSpecies = dataGenerationOne.pokemon_species;
      
      // Get the current battle zone type (1 = normal, 2 = water/ice, 3 = ground/rock/dragon)
      const zoneType = typeof window !== 'undefined' ? (window as any).currentBattleZoneType || 1 : 1;
      
      // Define allowed types for each zone
      const zoneTypeFilters: { [key: number]: string[] } = {
        1: [], // Zone 1: all types (no filter)
        2: ['water', 'ice'], // Zone 2: water and ice types
        3: ['ground', 'rock', 'dragon'], // Zone 3: ground, rock, and dragon types
      };
      
      const allowedTypes = zoneTypeFilters[zoneType] || [];
      
      // Function to check if a pokemon has any of the allowed types
      const hasPokemonAllowedType = async (pokemonName: string): Promise<boolean> => {
        if (allowedTypes.length === 0) return true; // No filter for zone 1
        
        try {
          const detailsData = await (await fetch(`${baseResponse}/pokemon/${pokemonName}`)).json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pokemonTypes = detailsData.types.map((typeInfo: any) => typeInfo.type.name.toLowerCase());
          
          // Check if pokemon has at least one of the allowed types
          return pokemonTypes.some((type: string) => allowedTypes.includes(type));
        } catch (error) {
          console.error(`Error fetching pokemon ${pokemonName}:`, error);
          return false;
        }
      };
      
      // Keep trying to find a pokemon with the correct type
      let foundValidPokemon = false;
      let attempts = 0;
      const maxAttempts = 50; // Limit attempts to avoid infinite loop
      
      while (!foundValidPokemon && attempts < maxAttempts) {
        attempts++;
        const randomPokemon = pokemonSpecies[Math.floor(Math.random() * pokemonSpecies.length)];
        const randomPokemonName = randomPokemon.name;
        
        if (await hasPokemonAllowedType(randomPokemonName)) {
          const detailsData = await (await fetch(`${baseResponse}/pokemon/${randomPokemonName}`)).json();
          const sprite = getSafeSprite(detailsData);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const type = detailsData.types.map((typeInfo: any) => typeInfo.type.name);

          setTotalPokemons(pokemonSpecies.length);

          setPokemon({
            name: detailsData.name,
            sprite: sprite,
            type: Array.isArray(type) ? type.join(', ') : type, // Convert array to comma-separated string
            quantity: 1
          });
          
          foundValidPokemon = true;
        }
      }
      
      // If no valid pokemon found after max attempts, pick any pokemon as fallback
      if (!foundValidPokemon) {
        console.warn(`Could not find pokemon with types ${allowedTypes.join(', ')} after ${maxAttempts} attempts. Picking random pokemon.`);
        const randomPokemon = pokemonSpecies[Math.floor(Math.random() * pokemonSpecies.length)];
        const randomPokemonName = randomPokemon.name;
        const detailsData = await (await fetch(`${baseResponse}/pokemon/${randomPokemonName}`)).json();
        const sprite = getSafeSprite(detailsData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const type = detailsData.types.map((typeInfo: any) => typeInfo.type.name);

        setTotalPokemons(pokemonSpecies.length);

        setPokemon({
          name: detailsData.name,
          sprite: sprite,
          type: Array.isArray(type) ? type.join(', ') : type,
          quantity: 1
        });
      }

      // Don't set loading to false yet - wait for images to load
    };

    setTimeout(async () => {
      await fetchRandomPokemon();
    }, 2000);
  }, [setTotalPokemons]);

  useEffect(() => {
    const loadImages = async () => {
      // Only load images if pokemon data is available
      if (!pokemon?.sprite) {
        return;
      }

      const imagesToLoad = [
        {
          name: 'pokemonSprite',
          src: pokemon?.sprite,
        },
        {
          name: 'playerBackSprite',
          src: 'https://storage.googleapis.com/pokemon-golden-island/playerBackSprite.png',
        },
        {
          name: 'catching',
          src: 'https://storage.googleapis.com/pokemon-golden-island/catching.gif',
        },
        {
          name: 'closePokeball',
          src: 'https://storage.googleapis.com/pokemon-golden-island/closePokeball.png',
        },
        {
          name: 'berry',
          src: 'https://storage.googleapis.com/pokemon-golden-island/berry-gif.webp',
        },
        {
          name: 'openPokeBall',
          src: 'https://storage.googleapis.com/pokemon-golden-island/openPokeBall.png',
        },
      ];

      const validImages = imagesToLoad.filter((image) => Boolean(image.src));

      if (validImages.length === 0) {
        setLoading(false);
        return;
      }

      const imagePromises = validImages.map(async (image: { name: string; src: string | any }) => {
        const img = new Image();

        try {
          const response = await fetch(image.src);

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob); // Cria a URL do blob
          img.src = blobUrl; // Define o src como a URL do blob
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          // console.log(error);
          // console.warn(`Fetch failed for ${image.src}. Falling back to original src.`);
          img.src = image.src; // Fallback para o src original
        }

        return new Promise<void>((resolve) => {
          img.onload = () => {
            imageRefs.current[image.name] = img; // Armazena a imagem carregada
            resolve();
          };
          img.onerror = () => {
            // console.error(`Failed to load image: ${image.src}`);
            resolve(); // Resolve mesmo se falhar para evitar bloqueios
          };
        });
      });

      // Wait for all images to load
      await Promise.all(imagePromises);
      
      // Only set loading to false after ALL images are loaded
      setLoading(false);
    };

    loadImages();

    // Function to handle Escape key press
    const handleKeyEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();

        childPokedex(false);
      }
    };

    // Function to handle Enter key press
    const handleKeyEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();

        childPokedex(!showPokedex);
        setShowPokedex(!showPokedex);
      }
    };

    // Adiciona o event listener para tecla esc
    window.addEventListener('keydown', handleKeyEscape);
    // Adiciona o event listener para tecla enter
    window.addEventListener('keypress', handleKeyEnter);

    // Setup button event listeners with { passive: false }
    if (typeof window !== 'undefined' && isMounted) {
      const ballButton = ballButtonRef.current;
      const berryButton = berryButtonRef.current;
      const runButton = runButtonRef.current;

      const handleBallTouch = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Don't check pokeballs here - let HandleBallClick do all validation
        // This avoids stale closure issues
        if (catchStatus !== 'catch' && !isThrowing) {
          HandleBallClick();
        }
      };

      const handleBerryTouch = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Don't check berries here - let HandleBerryClick do all validation
        if (catchStatus !== 'catch' && !isThrowing) {
          HandleBerryClick();
        }
      };

      const handleRunTouch = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        HandleEndBattle();
      };

      // Add touch listeners with { passive: false }
      if (ballButton) {
        ballButton.addEventListener('touchstart', handleBallTouch, { passive: false });
      }
      if (berryButton) {
        berryButton.addEventListener('touchstart', handleBerryTouch, { passive: false });
      }
      if (runButton) {
        runButton.addEventListener('touchstart', handleRunTouch, { passive: false });
      }

      // Cleanup
      return () => {
        if (ballButton) {
          ballButton.removeEventListener('touchstart', handleBallTouch);
        }
        if (berryButton) {
          berryButton.removeEventListener('touchstart', handleBerryTouch);
        }
        if (runButton) {
          runButton.removeEventListener('touchstart', handleRunTouch);
        }
      };
    }

    return () => {
      window.removeEventListener('keydown', handleKeyEscape);
      window.removeEventListener('keypress', handleKeyEnter);
    };
  }, [pokemon?.sprite, childPokedex, showPokedex, isMounted, catchStatus, pokeballs, berries, isThrowing, HandleBallClick, HandleBerryClick, HandleEndBattle]);

  // Don't render until mounted (hydration safety)
  if (!isMounted) {
    return (
      <div 
        style={{ 
          width: '100%',
          height: '100%',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: 'var(--bg-primary)',
        }}
      >
        <div style={{ color: 'var(--text-primary)' }}>Loading...</div>
      </div>
    );
  }

  if (loading) {
    // Use calculated dimensions instead of vh/vw for better mobile support
    const containerWidth = isMobile && dimensions.height > 0 
      ? `${dimensions.height}px` 
      : '80vw';
    const containerHeight = isMobile && dimensions.width > 0 
      ? `${dimensions.width}px` 
      : '80vh';

    return (
      <div 
        style={{ 
          // When parent is rotated 90deg, swap dimensions
          width: containerWidth,
          height: containerHeight,
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: 'var(--bg-primary)',
          overflow: 'hidden',
        }}
      >
        <ImageNext
          src="https://storage.googleapis.com/pokemon-golden-island/pokeball.gif"
          alt="Loading..."
          width={isMobile ? 150 : 300}
          height={isMobile ? 150 : 300}
          unoptimized
          style={{
            width: isMobile ? '150px' : '300px',
            height: isMobile ? '150px' : '300px',
          }}
        />
      </div>
    );
  }

  // Use calculated dimensions instead of vh/vw for better mobile support
  const containerWidth = isMobile && dimensions.height > 0 
    ? `${dimensions.height}px` 
    : '80vw';
  const containerHeight = isMobile && dimensions.width > 0 
    ? `${dimensions.width}px` 
    : '80vh';

  const berryRunHeight = isMobile ? 28 : 32;
  const berryRunGap = isMobile ? 4 : 6;
  const ballHeight = berryRunHeight * 2 + berryRunGap;

  return (
    <div 
      className="flex justify-center items-center overflow-hidden relative"
      style={{ 
        // When parent is rotated 90deg, dimensions are swapped
        // iPhone SE: 375x667 portrait -> 667x375 landscape after rotation
        // Use calculated pixel values instead of vh/vw for better mobile reliability
        width: containerWidth,
        height: containerHeight,
        maxWidth: containerWidth,
        maxHeight: containerHeight,
        backgroundColor: 'var(--bg-tertiary)',
        zIndex: 1001, // Ensure it's above the container
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div 
        className="flex flex-row-reverse relative"
        style={{
          width: isMobile ? '100%' : '60vw',
          height: isMobile ? '100%' : '65vh',
          maxWidth: isMobile ? '100%' : '60vw',
          maxHeight: isMobile ? '100%' : '65vh',
          overflow: 'hidden',
        }}
      >
        {pokemon && showPokemon && (
          <div 
            className="absolute"
            style={{
              // Similar layout for both mobile and desktop: Pokemon on top right
              top: isMobile ? '1rem' : '1rem',
              right: isMobile ? '1rem' : '1rem',
              left: isMobile ? 'auto' : 'auto',
              width: isMobile ? 'auto' : 'auto',
              maxWidth: isMobile ? '40%' : '40%',
            }}
          >
            <div 
              className="flex flex-col items-center justify-center rounded-full"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                padding: isMobile ? '0.375rem' : '0.75rem',
                marginBottom: isMobile ? '0.375rem' : '0.75rem',
                width: '100%',
              }}
            >
              <h2 
                className="mb-1"
                style={{ 
                  color: 'var(--text-primary)',
                  fontSize: isMobile ? '0.75rem' : '1.25rem',
                  textAlign: 'center',
                  lineHeight: '1.2',
                }}
              >
                {pokemon.name.toUpperCase()}
              </h2>
              <div className="flex items-center gap-1">
                <h2 
                  style={{ 
                    color: 'var(--text-secondary)',
                    fontSize: isMobile ? '0.5rem' : '0.875rem'
                  }}
                >
                  HP
                </h2>
                <div 
                  className="flex items-center justify-center rounded-full relative"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    width: isMobile ? '60px' : '120px',
                    height: isMobile ? '10px' : '16px',
                    minWidth: isMobile ? '60px' : '120px',
                  }}
                >
                  <div className="bg-green-500 w-[98%] h-[80%] rounded-full" />
                </div>
              </div>
            </div>
            <ImageNext
              src={pokemon.sprite}
              alt={pokemon.name}
              width={isMobile ? 180 : 280}
              height={isMobile ? 180 : 280}
              unoptimized
              priority
              style={{
                width: isMobile ? '180px' : '280px',
                height: isMobile ? '180px' : '280px',
                maxWidth: isMobile ? '180px' : '280px',
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        <div 
          className="absolute"
          style={{
            // Player on bottom left
            bottom: isMobile ? '1rem' : '1rem',
            left: isMobile ? '1rem' : '1rem',
            right: isMobile ? 'auto' : 'auto',
            width: isMobile ? 'auto' : 'auto',
          }}
        >
          <ImageNext
            src={imageRefs.current['playerBackSprite']?.src}
            alt={'Player'}
            width={isMobile ? 150 : 250}
            height={isMobile ? 150 : 250}
            unoptimized
            style={{
              width: isMobile ? '150px' : '250px',
              height: isMobile ? '150px' : '250px',
              maxWidth: isMobile ? '150px' : '250px',
              objectFit: 'contain',
            }}
          />
        </div>

        <div 
          className="absolute"
          style={{
            // Buttons on bottom right
            bottom: isMobile ? '1rem' : '1rem',
            left: isMobile ? 'auto' : 'auto',
            right: isMobile ? '1rem' : '1rem',
            width: isMobile ? 'auto' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMobile ? 'flex-end' : 'flex-end',
            gap: isMobile ? '0.375rem' : '0.5rem',
          }}
        >
          <div 
            className="rounded-lg border-2"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: isMobile ? '0.625rem' : '1rem',
              padding: isMobile ? '0.25rem 0.5rem' : '0.25rem 0.5rem',
              whiteSpace: 'nowrap',
            }}
          >
            Balls Left: {pokeballs}
          </div>

          <div 
            className="rounded-lg border-2"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: isMobile ? '0.625rem' : '1rem',
              padding: isMobile ? '0.25rem 0.5rem' : '0.25rem 0.5rem',
              whiteSpace: 'nowrap',
            }}
          >
            Berries Left: {berries}
          </div>

          <div 
            className="flex"
            style={{
              gap: isMobile ? '0.75rem' : '1rem',
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                padding: 0,
              }}
            >
              <button
                ref={ballButtonRef}
                className="rounded-lg border-2 transition-colors touch-manipulation"
                style={{
                  width: isMobile ? '100px' : '140px',
                  height: `${ballHeight}px`,
                  fontSize: isMobile ? '0.875rem' : '1.125rem',
                  backgroundColor: catchStatus === 'catch' || pokeballs === 0 || isThrowing
                    ? 'var(--gray-400)' 
                    : 'var(--success)',
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-inverse)',
                  flexShrink: 0,
                  cursor: catchStatus === 'catch' || pokeballs === 0 || isThrowing ? 'not-allowed' : 'pointer',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
                onClick={HandleBallClick}
                disabled={catchStatus === 'catch' || pokeballs === 0 || isThrowing}
              >
                BALL
              </button>
            </div>

            <div 
              className="flex"
              style={{
              gap: `${berryRunGap}px`,
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                padding: 0,
                }}
              >
                <button
                  ref={berryButtonRef}
                  className="rounded-lg border-2 transition-colors touch-manipulation"
                  style={{
                    width: isMobile ? '65px' : '80px',
                  height: `${berryRunHeight}px`,
                    fontSize: isMobile ? '0.625rem' : '0.875rem',
                    backgroundColor: catchStatus === 'catch' || berries === 0 || isThrowing
                      ? 'var(--gray-400)' 
                      : 'var(--primary)',
                    borderColor: 'var(--border-medium)',
                    color: 'var(--text-inverse)',
                    flexShrink: 0,
                    cursor: catchStatus === 'catch' || berries === 0 || isThrowing ? 'not-allowed' : 'pointer',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                  }}
                  onClick={HandleBerryClick}
                  disabled={catchStatus === 'catch' || berries === 0 || isThrowing}
                >
                  BERRY
                </button>
              </div>
              <div
                style={{
                padding: 0,
                }}
              >
                <button
                  ref={runButtonRef}
                  className="rounded-lg border-2 transition-colors touch-manipulation"
                  style={{
                    width: isMobile ? '65px' : '80px',
                  height: `${berryRunHeight}px`,
                    fontSize: isMobile ? '0.625rem' : '0.875rem',
                    backgroundColor: 'var(--danger)',
                    borderColor: 'var(--border-medium)',
                    color: 'var(--text-inverse)',
                    flexShrink: 0,
                    cursor: 'pointer',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                  }}
                  onClick={HandleEndBattle}
                >
                  RUN
                </button>
              </div>
            </div>
          </div>
        </div>

        {isThrowing && (
          <div 
            className="absolute"
            style={{
              top: isMobile ? '20%' : '30%',
              left: isMobile ? '75%' : '80%',
              transform: isMobile ? 'translateX(-50%)' : 'none',
            }}
          >
            <ImageNext
              src={imageRefs.current['catching']?.src}
              alt="Catching Pokemon..."
              width={isMobile ? 50 : 100}
              height={isMobile ? 50 : 100}
              unoptimized
              style={{
                width: isMobile ? '50px' : '100px',
                height: isMobile ? '50px' : '100px',
                maxWidth: isMobile ? '50px' : '100px',
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {givingBerry && (
          <div 
            className="absolute"
            style={{
              top: isMobile ? '15%' : '25%',
              left: isMobile ? '65%' : '70%',
              transform: isMobile ? 'translateX(-50%)' : 'none',
            }}
          >
            <ImageNext
              src={imageRefs.current['berry']?.src}
              alt="Giving Berry..."
              width={isMobile ? 50 : 100}
              height={isMobile ? 50 : 100}
              unoptimized
              style={{
                width: isMobile ? '50px' : '100px',
                height: isMobile ? '50px' : '100px',
                maxWidth: isMobile ? '50px' : '100px',
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {catchStatus === 'catch' && (
          <div 
            className="absolute flex flex-col items-center"
            style={{
              top: isMobile ? '30%' : '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              width: isMobile ? '90%' : 'auto',
              maxWidth: isMobile ? '90%' : 'none',
            }}
          >
            <ImageNext
              src={imageRefs.current['closePokeball']?.src}
              alt="Caught!"
              width={isMobile ? 60 : 150}
              height={isMobile ? 60 : 150}
              unoptimized
              style={{
                objectFit: 'contain',
              }}
            />
            <div style={{ marginTop: isMobile ? '0.5rem' : '1rem', width: '100%' }}>
              {currentBerryReward && (
                <p 
                  className="font-bold"
                  style={{ 
                    color: 'var(--primary)',
                    fontSize: isMobile ? '0.625rem' : '1.4rem',
                    marginBottom: isMobile ? '0.25rem' : '0.5rem',
                    lineHeight: '1.2',
                  }}
                >
                  Congratulations! +{currentBerryReward} Berry
                </p>
              )}
              <p 
                className={`font-bold ${currentPokeballReward ? '' : 'invisible'}`}
                style={{ 
                  color: 'var(--text-primary)',
                  fontSize: isMobile ? '0.625rem' : '1.5rem',
                  marginBottom: isMobile ? '0.25rem' : '0.5rem',
                  lineHeight: '1.2',
                }}
              >
                Congratulations! +{currentPokeballReward} Pokeballs
              </p>
              <h2 
                className="font-bold"
                style={{ 
                  color: 'var(--success)',
                  fontSize: isMobile ? '1rem' : '1.875rem',
                  lineHeight: '1.2',
                }}
              >
                Caught!
              </h2>
            </div>
          </div>
        )}

        {catchStatus === 'escape' && (
          <div 
            className="flex flex-col items-center absolute"
            style={{
              top: isMobile ? '35%' : '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              width: isMobile ? '90%' : 'auto',
            }}
          >
            <ImageNext
              src={imageRefs.current['openPokeBall']?.src}
              alt="Escaped!"
              width={isMobile ? 40 : 80}
              height={isMobile ? 40 : 80}
              unoptimized
              style={{
                objectFit: 'contain',
              }}
            />
            <h2 
              className="font-bold"
              style={{ 
                color: 'var(--danger)',
                fontSize: isMobile ? '0.875rem' : '1.675rem',
                marginTop: isMobile ? '0.5rem' : '1rem',
                lineHeight: '1.2',
                whiteSpace: 'nowrap',
              }}
            >
              The Pokemon escaped!
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleScreen;
