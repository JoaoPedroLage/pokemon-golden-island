import { Position } from '../../interfaces/mainInterface';
import { Boundary } from './Boundary';

export class BattleZone {
  position: Position; // Posição da BattleZone
  width: number;      // Largura da BattleZone
  height: number;     // Altura da BattleZone

  constructor({ width, height, position }: { position: Position, width: number, height: number }) {
    this.position = position;
    this.width = width;
    this.height = height;
  }
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'; // Cor de visualização para a zona de batalha
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  // Método para verificar colisões
  static checkBattleZone(rectA: Boundary | BattleZone, rectB: Boundary | BattleZone): boolean {
    return (
      rectA.position.x < rectB.position.x + rectB.width / 2 && // Verifica a colisão na metade da largura pois o personagem é mais largo
      rectA.position.x + rectA.width > rectB.position.x &&
      rectA.position.y < rectB.position.y + rectB.height / 2 && // Verifica a colisão na metade da altura pois o personagem é mais alto
      rectA.position.y + rectA.height > rectB.position.y
    );
  }

  // Método para iniciar a batalha
  static startBattle(startBattleCallback: () => void): void {
    startBattleCallback(); // Chama a função passada como parâmetro para iniciar a batalha
  }
}
