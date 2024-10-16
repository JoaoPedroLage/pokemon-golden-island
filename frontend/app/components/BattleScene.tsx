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

    const rareTypes = ['dragon', 'ghost', 'psychic'];
    const isRare = rareTypes.some((rareType) => pokemon.type.includes(rareType));

    if (isRare) return 0.85 - berry;
    else if (pokemon.type.includes('mythical')) return 0.90 - berry;
    else if (pokemon.type.includes('legendary') || pokemon.name === 'mewtwo') return 0.95 - berry;
    else return 0.70 - berry;
  };

  const HandleBerryClick = () => {
    setGivingBerry(true);
    useBerry(); // Decrementa o número de Berries

    const bonusChance = (Math.random() * 0.2); // Bônus de 0 a 20%
    console.log(bonusChance);
    const newBonusChance = bonusChance + bonusCatchChance;
    setBonusCatchChance(newBonusChance);

    setTimeout(() => {
      setGivingBerry(false);
    }, 2000);
  };

  const HandleEndBattle = () => {
    if (pokeballs === 0) resetGame();
    endBattle();
  };

  const HandleBallClick = () => {

    usePokeball(); // Decrementa o número de Pokébolas
    setIsThrowing(true);
    setCatchStatus(null);
    setShowPokemon(false); // Oculta o Pokémon durante o lançamento da Pokébola

    setTimeout(() => {
      const catchChance = Math.random();
      const success = catchChance >= getPokemonDifficult(bonusCatchChance);
      console.log(bonusCatchChance, catchChance, getPokemonDifficult(bonusCatchChance))

      setIsThrowing(false);

      if (success) {
        setCatchStatus('catch');
        if (pokemon)
          addCapturedPokemon(pokemon); // Adiciona o Pokémon capturado ao contexto

        // Sorteio para ganhar Berries
        const berryChance = Math.random();
        if (berryChance < 0.3) { // 30% de chance de ganhar uma Berry
          setCurrentBerryReward(1);
          addBerry();
        }

        // Sorteio para ganhar de 1 a 3 Pokébolas
        const pokeballReward = Math.random();
        if (pokeballReward < 0.5) { // 50% de chance de ganhar 1-3 Pokébolas
          const rewardAmount = Math.floor(Math.random() * 3) + 1; // Ganha de 1 a 3
          setCurrentPokeballReward(rewardAmount);
          addPokeballs(rewardAmount);
        }
      } else {
        setCatchStatus('escape');
        setTimeout(() => {
          setCatchStatus('none');
          setShowPokemon(true); // Exibe o Pokémon novamente após a fuga
        }, 1000);
      }
    }, 2000);
  };

  useEffect(() => {
    const fetchRandomPokemon = async () => {
      const baseResponse = 'https://pokeapi.co/api/v2';
      const generationOne = await fetch('https://pokeapi.co/api/v2/generation/1');
      const dataGenerationOne = await generationOne.json();

      const pokemonSpecies = dataGenerationOne.pokemon_species;
      const randomPokemon = pokemonSpecies[Math.floor(Math.random() * pokemonSpecies.length)];
      const randownPokemon = randomPokemon.name;
      const detailsData = await (await fetch(`${baseResponse}/pokemon/${randownPokemon}`)).json();
      const sprite = detailsData.sprites.front_default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const type = detailsData.types.map((typeInfo: any) => typeInfo.type.name);

      setTotalPokemons(pokemonSpecies.length);

      setPokemon({
        name: detailsData.name,
        sprite: sprite,
        type: type,
        quantity: 1
      });

      setLoading(false);
    };

    setTimeout(async () => {
      await fetchRandomPokemon();
    }, 2000);
  }, [setTotalPokemons]);

  useEffect(() => {
    const loadImages = async () => {
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

      await Promise.all(imagePromises);
    };

    loadImages();

    // Função para lidar com a pressão da tecla Escape
    const handleKeyEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();

        childPokedex(false);
      }
    };

    // Função para lidar com a pressão da tecla Enter
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
      <div style={{ width: '80vw', height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
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
    <div className="flex justify-center items-center w-[80vw] h-[80vh] overflow-hidden relative bg-gray-300/60">
      <div className="flex flex-row-reverse w-[60vw] h-[65vh] relative">
        {pokemon && showPokemon && (
          <div className="top-2 left-2">
            <div className="flex flex-col items-center justify-center bg-gray-500 w-[100%] h-[12%] rounded-full">
              <h2 className="text-2xl mb-1 top-1/2 left-2">
                {pokemon.name.toUpperCase()}
              </h2>
              <div className="flex items-start">
                <h2 className="text-lg text-gray-800 pr-1">HP</h2>
                <div className="flex items-center justify-center w-[200px] h-[30px] bg-gray-300 rounded-full mb-1 relative">
                  <div className="bg-green-500 w-[98%] h-[80%] rounded-full" />
                </div>
              </div>
            </div>
            <ImageNext
              src={pokemon.sprite}
              alt={pokemon.name}
              width={300}
              height={300}
              unoptimized
              priority
            />
          </div>
        )}

        <div className="absolute bottom-0 left-2">
          <ImageNext
            src={imageRefs.current['playerBackSprite']?.src}
            alt={'Player'}
            width={250}
            height={250}
            unoptimized
          />
        </div>

        <div className="absolute bottom-2 right-2">
          <div className="flex justify-end mb-1">
            <div className="bg-white py-1 px-2 rounded-lg border-2 border-black">
              Balls Left: {pokeballs}
            </div>
          </div>

          <div className="flex justify-end mb-1">
            <div className="bg-white py-1 px-2 rounded-lg border-2 border-black">
              Berries Left: {berries}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className={`w-[150px] h-[80px] rounded-lg text-xl border-2 border-black 
                ${catchStatus === 'catch' || pokeballs === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-400 hover:bg-green-600'}
              `}
              onClick={HandleBallClick}
              disabled={catchStatus === 'catch' || pokeballs === 0 || isThrowing}
            >
              BALL
            </button>

            <div className="flex flex-col gap-2">
              <button
                className={`w-[80px] h-[35px] rounded-lg text-sm border-2 border-black 
                ${catchStatus === 'catch' || berries === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-400 hover:bg-blue-600'}
              `}
                onClick={HandleBerryClick}
                disabled={catchStatus === 'catch' || berries === 0 || isThrowing}
              >
                BERRY
              </button>
              <button
                className="w-[80px] h-[35px] bg-red-500 hover:bg-red-700 rounded-lg text-sm border-2 border-black"
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
              width={100}
              height={100}
              unoptimized
            />
          </div>
        )}

        {givingBerry && (
          <div className="absolute top-[25%] left-[70%]">
            <ImageNext
              src={imageRefs.current['berry']?.src}
              alt="Giving Berry..."
              width={100}
              height={100}
              unoptimized
            />
          </div>
        )}

        {catchStatus === 'catch' && (
          <div className="absolute top-40 rigth-[2%]">
            <ImageNext
              className='absolute right-[25%] top-[20%]'
              src={imageRefs.current['closePokeball']?.src}
              alt="Caught!"
              width={150}
              height={200}
              unoptimized
            />
            <div>
              {currentBerryReward && <p className="text-blue-600 mt-4 font-bold">Congratulations this capture gives you + {currentBerryReward} Berry</p>}
              <p className={`
                ${currentPokeballReward ? 'text-black mt-4 font-bold' : 'invisible'}
               `}>
                Congratulations this capture gives you + {currentPokeballReward} Pokeballs
              </p>
              <h2 className="text-3xl text-green-800 mt-4 font-bold ">Caught!</h2>
            </div>
          </div>
        )}

        {catchStatus === 'escape' && (
          <div className="flex flex-col absolute top-40">
            <ImageNext
              src={imageRefs.current['openPokeBall']?.src}
              alt="Escaped!"
              width={200}
              height={200}
              className="pl-[40%]"
              unoptimized
            />
            <h2 className="text-3xl text-red-500 mt-4">The Pokémon escaped!</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleScreen;
