/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import ImageNext from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
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

  const imageRefs = useRef<{ [key: string]: HTMLImageElement }>({});

  const {
    pokeballs,
    berries,
    setTotalPokemons,
    resetGame,
    usePokeball,
    addCapturedPokemon,
    addBerry,
    addPokeballs,
    useBerry
  } = useGameContext();

  const getPokemonDifficult = (berry = 0) => {
    if (!pokemon) return 0;

    // List of legendary and mythical Pokemon from the 1st generation
    const legendaryPokemon = ['mewtwo', 'mew', 'articuno', 'zapdos', 'moltres'];
    const mythicalPokemon = ['mew'];
    
    // Rare types that make the Pokemon harder to catch
    const rareTypes = ['dragon', 'ghost', 'psychic'];
    
    // Convert type to array if it's a string (can come as "fire, flying" or ["fire", "flying"])
    const pokemonTypes = Array.isArray(pokemon.type) 
      ? pokemon.type 
      : typeof pokemon.type === 'string' 
        ? pokemon.type.split(',').map(t => t.trim().toLowerCase())
        : [];
    
    // Check if it's a legendary or mythical Pokemon by name
    const isLegendary = legendaryPokemon.includes(pokemon.name.toLowerCase());
    const isMythical = mythicalPokemon.includes(pokemon.name.toLowerCase());
    
    // Check if it has rare types
    const hasRareType = rareTypes.some((rareType) => 
      pokemonTypes.some((type: string) => type.toLowerCase() === rareType)
    );

    // Calculate difficulty based on rarity
    if (isLegendary || pokemon.name.toLowerCase() === 'mewtwo') {
      // Legendary Pokemon: 95% difficulty (5% catch chance without berry)
      return Math.max(0.95 - berry, 0.05);
    } else if (isMythical) {
      // Mythical Pokemon: 90% difficulty (10% catch chance without berry)
      return Math.max(0.90 - berry, 0.10);
    } else if (hasRareType) {
      // Rare types: 85% difficulty (15% catch chance without berry)
      return Math.max(0.85 - berry, 0.15);
    } else {
      // Common Pokemon: 70% difficulty (30% catch chance without berry)
      return Math.max(0.70 - berry, 0.30);
    }
  };

  const HandleBerryClick = () => {
    if (berries <= 0) return; // Don't allow using berry if there are none
    
    setGivingBerry(true);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useBerry(); // Decrements the number of Berries (not a React hook, it's a context function)

    // Each berry gives a bonus of 0.05 to 0.15 (5% to 15%) and accumulates up to a maximum of 0.5 (50%)
    const berryBonus = Math.random() * 0.1 + 0.05; // Bonus of 5% to 15% per berry
    const newBonusChance = Math.min(bonusCatchChance + berryBonus, 0.5); // Limits the maximum bonus to 50%
    setBonusCatchChance(newBonusChance);
    
    console.log(`Berry used! Current bonus: ${(newBonusChance * 100).toFixed(1)}%`);

    setTimeout(() => {
      setGivingBerry(false);
    }, 2000);
  };

  const HandleEndBattle = () => {
    if (pokeballs === 0) resetGame();
    endBattle();
  };

  const HandleBallClick = () => {

    usePokeball(); // Decrements the number of Pokeballs
    setIsThrowing(true);
    setCatchStatus(null);
    setShowPokemon(false); // Hides the Pokemon during Pokeball throw

    setTimeout(() => {
      const catchChance = Math.random();
      const success = catchChance >= getPokemonDifficult(bonusCatchChance);
      console.log(bonusCatchChance, catchChance, getPokemonDifficult(bonusCatchChance))

      setIsThrowing(false);

      if (success) {
        setCatchStatus('catch');
        if (pokemon)
          addCapturedPokemon(pokemon); // Adds the captured Pokemon to the context

        // Random chance to win Berries
        const berryChance = Math.random();
        if (berryChance < 0.3) { // 30% chance to win a Berry
          setCurrentBerryReward(1);
          addBerry();
        }

        // Random chance to win 1 to 3 Pokeballs
        const pokeballReward = Math.random();
        if (pokeballReward < 0.5) { // 50% chance to win 1-3 Pokeballs
          const rewardAmount = Math.floor(Math.random() * 3) + 1; // Wins 1 to 3
          setCurrentPokeballReward(rewardAmount);
          addPokeballs(rewardAmount);
        }
      } else {
        setCatchStatus('escape');
        setTimeout(() => {
          setCatchStatus('none');
          setShowPokemon(true); // Show Pokemon again after escape
        }, 1000);
      }
    }, 2000);
  };

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    // Check on mount
    checkMobile();

    // Check on resize
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const fetchRandomPokemon = async () => {
      // Reset berry bonus for each new battle
      setBonusCatchChance(0);
      
      const baseResponse = 'https://pokeapi.co/api/v2';
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
          const sprite = detailsData.sprites.front_default;
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
        const sprite = detailsData.sprites.front_default;
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

      const imagePromises = imagesToLoad.map(async (image: { name: string; src: string | any }) => {
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

    return () => {
      window.removeEventListener('keydown', handleKeyEscape);
      window.removeEventListener('keypress', handleKeyEnter);
    };
  }, [pokemon?.sprite, childPokedex, showPokedex]);

  if (loading) {
    return (
      <div 
        style={{ 
          width: '80vw', 
          height: '80vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: 'var(--bg-primary)' 
        }}
      >
        <ImageNext
          src="https://storage.googleapis.com/pokemon-golden-island/pokeball.gif"
          alt="Loading..."
          width={300}
          height={300}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div 
      className="flex justify-center items-center overflow-hidden relative"
      style={{ 
        width: isMobile ? '100vw' : '80vw',
        height: isMobile ? '100vh' : '80vh',
        backgroundColor: 'var(--bg-tertiary)',
        zIndex: 1001, // Ensure it's above the container
        position: 'relative',
      }}
    >
      <div className="flex flex-row-reverse w-[60vw] h-[65vh] relative">
        {pokemon && showPokemon && (
          <div className="top-2 left-2">
            <div 
              className="flex flex-col items-center justify-center w-[100%] h-[12%] rounded-full"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <h2 
                className="mb-1 top-1/2 left-2"
                style={{ 
                  color: 'var(--text-primary)',
                  fontSize: isMobile ? '1.25rem' : '1.5rem'
                }}
              >
                {pokemon.name.toUpperCase()}
              </h2>
              <div className="flex items-start">
                <h2 
                  className="pr-1"
                  style={{ 
                    color: 'var(--text-secondary)',
                    fontSize: isMobile ? '0.875rem' : '1.125rem'
                  }}
                >
                  HP
                </h2>
                <div 
                  className="flex items-center justify-center rounded-full mb-1 relative"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    width: isMobile ? '120px' : '200px',
                    height: isMobile ? '20px' : '30px'
                  }}
                >
                  <div className="bg-green-500 w-[98%] h-[80%] rounded-full" />
                </div>
              </div>
            </div>
            <ImageNext
              src={pokemon.sprite}
              alt={pokemon.name}
              width={isMobile ? 180 : 300}
              height={isMobile ? 180 : 300}
              unoptimized
              priority
              style={{
                width: isMobile ? '180px' : '300px',
                height: isMobile ? '180px' : '300px',
              }}
            />
          </div>
        )}

        <div className="absolute bottom-0 left-2">
          <ImageNext
            src={imageRefs.current['playerBackSprite']?.src}
            alt={'Player'}
            width={isMobile ? 120 : 250}
            height={isMobile ? 120 : 250}
            unoptimized
            style={{
              width: isMobile ? '120px' : '250px',
              height: isMobile ? '120px' : '250px',
            }}
          />
        </div>

        <div className="absolute bottom-2 right-2">
          <div className="flex justify-end mb-1">
            <div 
              className="py-1 px-2 rounded-lg border-2"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: isMobile ? '0.75rem' : '1rem',
                padding: isMobile ? '0.25rem 0.5rem' : '0.25rem 0.5rem'
              }}
            >
              Balls Left: {pokeballs}
            </div>
          </div>

          <div className="flex justify-end mb-1">
            <div 
              className="py-1 px-2 rounded-lg border-2"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: isMobile ? '0.75rem' : '1rem',
                padding: isMobile ? '0.25rem 0.5rem' : '0.25rem 0.5rem'
              }}
            >
              Berries Left: {berries}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className={`rounded-lg border-2 transition-colors
                ${catchStatus === 'catch' || pokeballs === 0 ? 'cursor-not-allowed' : 'hover:opacity-90'}
              `}
              style={{
                width: isMobile ? '100px' : '150px',
                height: isMobile ? '60px' : '80px',
                fontSize: isMobile ? '1rem' : '1.25rem',
                backgroundColor: catchStatus === 'catch' || pokeballs === 0 
                  ? 'var(--gray-400)' 
                  : 'var(--success)',
                borderColor: 'var(--border-medium)',
                color: 'var(--text-inverse)'
              }}
              onClick={HandleBallClick}
              disabled={catchStatus === 'catch' || pokeballs === 0 || isThrowing}
            >
              BALL
            </button>

            <div className="flex flex-col gap-2">
              <button
                className={`rounded-lg border-2 transition-colors
                ${catchStatus === 'catch' || berries === 0 ? 'cursor-not-allowed' : 'hover:opacity-90'}
              `}
                style={{
                  width: isMobile ? '60px' : '80px',
                  height: isMobile ? '28px' : '35px',
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  backgroundColor: catchStatus === 'catch' || berries === 0 
                    ? 'var(--gray-400)' 
                    : 'var(--primary)',
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-inverse)'
                }}
                onClick={HandleBerryClick}
                disabled={catchStatus === 'catch' || berries === 0 || isThrowing}
              >
                BERRY
              </button>
              <button
                className="rounded-lg border-2 transition-colors hover:opacity-90"
                style={{
                  width: isMobile ? '60px' : '80px',
                  height: isMobile ? '28px' : '35px',
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  backgroundColor: 'var(--danger)',
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-inverse)'
                }}
                onClick={HandleEndBattle}
              >
                RUN
              </button>
            </div>
          </div>
        </div>

        {isThrowing && (
          <div className="absolute top-[30%] left-[80%]">
            <ImageNext
              src={imageRefs.current['catching']?.src}
              alt="Catching Pokemon..."
              width={isMobile ? 60 : 100}
              height={isMobile ? 60 : 100}
              unoptimized
              style={{
                width: isMobile ? '60px' : '100px',
                height: isMobile ? '60px' : '100px',
              }}
            />
          </div>
        )}

        {givingBerry && (
          <div className="absolute top-[25%] left-[70%]">
            <ImageNext
              src={imageRefs.current['berry']?.src}
              alt="Giving Berry..."
              width={isMobile ? 60 : 100}
              height={isMobile ? 60 : 100}
              unoptimized
              style={{
                width: isMobile ? '60px' : '100px',
                height: isMobile ? '60px' : '100px',
              }}
            />
          </div>
        )}

        {catchStatus === 'catch' && (
          <div 
            className="absolute flex flex-col items-center"
            style={{
              top: isMobile ? '25%' : '40%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center'
            }}
          >
            <ImageNext
              src={imageRefs.current['closePokeball']?.src}
              alt="Caught!"
              width={isMobile ? 80 : 150}
              height={isMobile ? 100 : 200}
              unoptimized
              style={{
                width: isMobile ? '80px' : '200px',
                height: isMobile ? '80px' : '200px',
              }}
            />
            <div style={{ marginTop: isMobile ? '0.5rem' : '1rem' }}>
              {currentBerryReward && (
                <p 
                  className="font-bold"
                  style={{ 
                    color: 'var(--primary)',
                    fontSize: isMobile ? '0.7rem' : '1rem',
                    marginBottom: isMobile ? '0.25rem' : '0.5rem'
                  }}
                >
                  Congratulations! +{currentBerryReward} Berry
                </p>
              )}
              <p 
                className={`font-bold ${currentPokeballReward ? '' : 'invisible'}`}
                style={{ 
                  color: 'var(--text-primary)',
                  fontSize: isMobile ? '0.7rem' : '1rem',
                  marginBottom: isMobile ? '0.25rem' : '0.5rem'
                }}
              >
                Congratulations! +{currentPokeballReward} Pokeballs
              </p>
              <h2 
                className="font-bold"
                style={{ 
                  color: 'var(--success)',
                  fontSize: isMobile ? '1.25rem' : '1.875rem',
                  marginTop: isMobile ? '0.5rem' : '1rem'
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
              top: isMobile ? '30%' : '40%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center'
            }}
          >
            <ImageNext
              src={imageRefs.current['openPokeBall']?.src}
              alt="Escaped!"
              width={isMobile ? 50 : 200}
              height={isMobile ? 50 : 200}
              unoptimized
            />
            <h2 
              className="mt-4 font-bold"
              style={{ 
                color: 'var(--danger)',
                fontSize: isMobile ? '1.125rem' : '1.875rem',
                whiteSpace: 'nowrap'
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
