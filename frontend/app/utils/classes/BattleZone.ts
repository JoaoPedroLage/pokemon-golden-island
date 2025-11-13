import { Position } from '../../interfaces/mainInterface';
import { Boundary } from './Boundary';

export class BattleZone {
  position: Position; // BattleZone position
  width: number;      // BattleZone width
  height: number;     // BattleZone height

  constructor({ width, height, position }: { position: Position, width: number, height: number }) {
    this.position = position;
    this.width = width;
    this.height = height;
  }
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'; // Visualization color for battle zone
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  // Method to check collisions
  static checkBattleZone(rectA: Boundary | BattleZone, rectB: Boundary | BattleZone): boolean {
    return (
      rectA.position.x < rectB.position.x + rectB.width / 2 && // Check collision at half width since character is wider
      rectA.position.x + rectA.width > rectB.position.x &&
      rectA.position.y < rectB.position.y + rectB.height / 2 && // Check collision at half height since character is taller
      rectA.position.y + rectA.height > rectB.position.y
    );
  }

  // Method to start battle
  static startBattle(startBattleCallback: () => void): void {
    startBattleCallback(); // Call the function passed as parameter to start battle
  }
}
