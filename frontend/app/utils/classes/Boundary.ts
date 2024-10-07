import { Position } from '../../interfaces/mainInterface';

export class Boundary {
  position: Position; // Posição do Boundary
  width: number;      // Largura do Boundary
  height: number;     // Altura do Boundary

  constructor({ width, height, position }: { position: Position, width: number, height: number }) {
    this.position = position;
    this.width = width;
    this.height = height;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Cor de visualização para a colisão
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  // Método para verificar colisões
  static checkCollision(rectA: Boundary, rectB: Boundary): boolean {
    return (
      rectA.position.x < rectB.position.x + rectB.width / 2 && // Verifica a colisão na metade da largura pois o personagem é mais largo
      rectA.position.x + rectA.width > rectB.position.x &&
      rectA.position.y < rectB.position.y + rectB.height / 2 && // Verifica a colisão na metade da altura pois o personagem é mais alto
      rectA.position.y + rectA.height > rectB.position.y
    );
  }
}
