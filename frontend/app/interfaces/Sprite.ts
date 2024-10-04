/* eslint-disable @typescript-eslint/no-explicit-any */
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

export class Sprite {
  position: Position;
  image: HTMLImageElement;
  frames: { max: number; };
  sprites?: { up: HTMLImageElement; left: HTMLImageElement; right: HTMLImageElement; down: HTMLImageElement };
  frameCurrent: number;
  size: number;
  lastDirection: Key | null;
  frameCount: number; // Contador para frames
  frameInterval: number; // Tempo entre cada frame
  lastFrameTime: number; // Guarda o tempo da última atualização de frame

  constructor({ position, image, frames = { max: 3 }, sprites, size = 50 }: SpriteProps) {
    this.position = position;
    this.image = image;
    this.frames = frames;
    this.sprites = sprites;
    this.frameCurrent = 0; // Começa no primeiro frame
    this.size = size;
    this.lastDirection = null; // Inicializa a última direção como nula
    this.frameCount = 0; // Inicializa o contador de frames
    this.frameInterval = 100; // Intervalo de tempo entre frames (milissegundos)
    this.lastFrameTime = 0; // Tempo da última atualização do frame
  }

  getSpriteFrame() {
    const frameWidth = this.image.width / this.frames.max; // Dividir a largura pela quantidade de frames
    const frameHeight = this.image.height / this.frames.max; // Utiliza a altura total da imagem

    let x, y;

    console.log(this.frameCurrent)

    switch (this.frameCurrent) {
      case 0:
        x = (0 % this.frames.max) * frameWidth; // Calcula a posição x com base no contador de frames
        y = 0; // Parte superior
        break;
      case 1:
        x = (1 % this.frames.max) * frameWidth; // Calcula a posição x com base no contador de frames
        y = (1 % this.frames.max) * frameHeight; // Calcula a posição y com base no contador de frames
        break;
      case 2:
        x = (1 % this.frames.max) * frameWidth; // Calcula a posição x com base no contador de frames
        y = 0; // Parte superior
        break;
      default:
        x = 0;
        y = 0;
    }

    return { x, y, frameWidth, frameHeight }; // Retorna as informações necessárias
  }

  draw(context: CanvasRenderingContext2D) {
    const { x, y, frameWidth, frameHeight } = this.getSpriteFrame();

    // Desenha a parte correta do sprite baseada na direção atual
    context.drawImage(
      this.image,
      x,
      y,
      frameWidth,
      frameHeight,
      this.position.x,
      this.position.y,
      frameWidth * 2,
      frameHeight * 2
    );
  }

  update(context: CanvasRenderingContext2D, keys: any) {
    let isMoving = false; // Variável para verificar se o personagem está em movimento

    // Lógica de movimento
    if (keys.w.pressed || keys.ArrowUp.pressed) {
      this.position.y -= this.size / 50; // Move o jogador para cima
      isMoving = true;
      this.image = this.sprites!.up; // Atualiza a imagem para o sprite "up"
    }
    if (keys.a.pressed || keys.ArrowLeft.pressed) {
      this.position.x -= this.size / 50; // Move o jogador para a esquerda
      isMoving = true;
      this.image = this.sprites!.left; // Atualiza a imagem para o sprite "left"
    }
    if (keys.s.pressed || keys.ArrowDown.pressed) {
      this.position.y += this.size / 50; // Move o jogador para baixo
      isMoving = true;
      this.image = this.sprites!.down; // Atualiza a imagem para o sprite "down"
    }
    if (keys.d.pressed || keys.ArrowRight.pressed) {
      this.position.x += this.size / 50; // Move o jogador para a direita
      isMoving = true;
      this.image = this.sprites!.right; // Atualiza a imagem para o sprite "right"
    }

    // Lógica para alternar entre os frames de movimento
    if (isMoving) {
      const currentTime = performance.now();
      if (currentTime - this.lastFrameTime > this.frameInterval) {
        this.frameCount++;
        this.frameCurrent = (this.frameCount % 3); // Alterna a movimentação entre 0, 1, 2
        this.lastFrameTime = currentTime; // Atualiza o tempo da última atualização
      }
    } else {
      // Se nenhuma tecla está pressionada, reseta para o frame estático (frame 0)
      this.frameCurrent = 0;
    }

    // Desenha o sprite
    this.draw(context);
  }
}
