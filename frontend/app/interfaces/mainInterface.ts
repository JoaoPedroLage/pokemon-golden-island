export interface Position {
  x: number;
  y: number;
}

export interface SpriteProps {
  position: Position;
  image: HTMLImageElement;
  frames?: { max: number; };
  sprites?: { up: HTMLImageElement; left: HTMLImageElement; right: HTMLImageElement; down: HTMLImageElement };
  size?: number;
  inBattle: boolean;
}

export type Key =
  | 'w' | 'a' | 's' | 'd'
  | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

export interface Renderable {
  draw: (context: CanvasRenderingContext2D) => void;
  position: { x: number; y: number };
}

export interface Movable {
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
  draw: (c: CanvasRenderingContext2D) => void;
  image?: HTMLImageElement; // Adiciona a propriedade `image` opcionalmente
}

export interface Player extends Movable {
  frameCurrent: number;
  animate: boolean;
  image: HTMLImageElement;
}

// Tipagem para as keys
export interface Keys {
  w: { pressed: boolean };
  a: { pressed: boolean };
  s: { pressed: boolean };
  d: { pressed: boolean };
}

export interface Pokemon {
  name: string;
  sprite: string;
  type: string;
  quantity: number;
}

export interface BattleSceneProps {
  endBattle: () => void;
  childPokedex: (open: boolean) => void;
}