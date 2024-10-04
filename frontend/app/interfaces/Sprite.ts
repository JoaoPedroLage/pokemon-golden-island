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
}

export type Key =
  | 'w' | 'a' | 's' | 'd'
  | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';