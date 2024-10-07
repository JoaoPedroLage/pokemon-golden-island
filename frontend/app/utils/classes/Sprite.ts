/* eslint-disable @typescript-eslint/no-explicit-any */

import { Key, Position, SpriteProps } from "@/app/interfaces/mainInterface";
import { Boundary } from "./Boundary";
import { BattleZone } from "./BattleZone";

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
  inBattle: boolean;

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
    this.inBattle = false; // Inicializa fora da zona de batalha
  }

  getSpriteFrame() {
    const frameWidth = this.image.width / this.frames.max; // Dividir a largura pela quantidade de frames
    const frameHeight = this.image.height / this.frames.max; // Utiliza a altura total da imagem

    let x, y;

    switch (this.frameCurrent) {
      case 0:
        x = 0
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

  // Método para atualizar o tamanho e a posição do sprite
  resize(newSize: number, canvasWidth: number, canvasHeight: number, wasInBattle: boolean, setWasInBattle: (value: boolean) => void) {
    this.size = newSize; // Atualiza o tamanho do jogador

    if (!wasInBattle) {
      this.position = {
        x: canvasWidth / 2 - newSize / 2, // Recentraliza o jogador no canvas
        y: canvasHeight / 2 - newSize / 2,
      };

      setWasInBattle(false); // Atualiza o estado de batalha
    } 
  }

  draw(context: CanvasRenderingContext2D) {
    const { x, y, frameWidth, frameHeight } = this.getSpriteFrame();

    // Aqui estão as dimensões originais do sprite (supondo que você tenha essas informações)
    const originalWidth = this.image.width / this.frames.max; // Largura de um frame do sprite
    const originalHeight = this.image.height / this.frames.max;; // Altura total da imagem

    // Cálculo do fator de escala
    const scale = this.size / 50; // Ajuste a constante (50) se o tamanho original do jogador for diferente

    // Cálculo da nova largura e altura
    const newWidth = originalWidth * scale;
    const newHeight = originalHeight * scale;

    // Desenha a parte correta do sprite baseada na direção atual
    context.drawImage(
      this.image,
      x,
      y,
      frameWidth,
      frameHeight,
      this.position.x,
      this.position.y,
      newWidth,
      newHeight
    );
  }

  update(context: CanvasRenderingContext2D, keys: any, boundaries: Boundary[], battleZones: BattleZone[]) {
    let isMoving = false; // Variável para verificar se o personagem está em movimento

    // Armazena a posição anterior antes de mover
    const previousPosition = {
      x: this.position.x,
      y: this.position.y
    };

    const movementSpeed = this.size / 50; // Ajusta a velocidade com base no tamanho do jogador e do canvas

    // Lógica de movimentação	do jogador
    if (keys.w.pressed || keys.ArrowUp.pressed) {
      this.position.y -= movementSpeed; // Move o jogador para cima
      isMoving = true;
      this.image = this.sprites!.up;
    }
    if (keys.a.pressed || keys.ArrowLeft.pressed) {
      this.position.x -= movementSpeed; // Move o jogador para a esquerda
      isMoving = true;
      this.image = this.sprites!.left;
    }
    if (keys.s.pressed || keys.ArrowDown.pressed) {
      this.position.y += movementSpeed; // Move o jogador para baixo
      isMoving = true;
      this.image = this.sprites!.down;
    }
    if (keys.d.pressed || keys.ArrowRight.pressed) {
      this.position.x += movementSpeed; // Move o jogador para a direita
      isMoving = true;
      this.image = this.sprites!.right;
    }


    // Representa o jogador como um objeto com posição e dimensões para a verificação de colisão
    const { frameWidth, frameHeight } = this.getSpriteFrame();

    const playerRect = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      width: frameWidth,
      height: frameHeight,
    };

    // Verifica se houve colisão com alguma boundary
    const isColliding = boundaries.some(boundary =>
      Boundary.checkCollision(playerRect as Boundary, boundary)
    );

    if (isColliding) {
      // Reverte a posição se houve colisão
      this.position.x = previousPosition.x;
      this.position.y = previousPosition.y;
      console.log("Colisão detectada!");
    }

    // Verifica se o jogador está na zona de batalha
    const inBattleZone = battleZones.some(zone =>
      BattleZone.checkBattleZone(playerRect as BattleZone, zone)
    );

    // Se está na zona de batalha, sorteia uma chance de iniciar a batalha
    if (inBattleZone && isMoving) {
      const chanceToStartBattle = Math.floor(Math.random() * 101);
      if (chanceToStartBattle > 99) { // 2% de chance de iniciar a batalha
        BattleZone.startBattle(() => {
          this.inBattle = true; // Atualiza o estado do jogador para dentro da batalha
        });
      }
    }

    // Lógica para alternar entre os frames de movimento
    if (isMoving) {
      const currentTime = performance.now();
      if (currentTime - this.lastFrameTime > this.frameInterval) {
        this.frameCount++;
        this.frameCurrent = (this.frameCount % 3); // Alterna a movimentação entre 0, 1, 2
        this.lastFrameTime = currentTime; // Atualiza o tempo da última atualização
      }
    }

    // Desenha o sprite
    this.draw(context);
  }
}