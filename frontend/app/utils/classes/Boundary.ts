import { Position } from '../../interfaces/mainInterface';

export class Boundary {
  position: Position; // Boundary position
  width: number;      // Boundary width
  height: number;     // Boundary height

  constructor({ width, height, position }: { position: Position, width: number, height: number }) {
    this.position = position;
    this.width = width;
    this.height = height;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Visualization color for collision
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  // Method to check collisions
  static checkCollision(rectA: Boundary, rectB: Boundary): boolean {
    return (
      rectA.position.x < rectB.position.x + rectB.width / 2 && // Check collision at half width since character is wider
      rectA.position.x + rectA.width > rectB.position.x &&
      rectA.position.y < rectB.position.y + rectB.height / 2 && // Check collision at half height since character is taller
      rectA.position.y + rectA.height > rectB.position.y
    );
  }
}
