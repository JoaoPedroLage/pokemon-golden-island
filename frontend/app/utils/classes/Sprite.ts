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
  frameCount: number; // Frame counter
  frameInterval: number; // Time between each frame
  lastFrameTime: number; // Stores the time of the last frame update
  inBattle: boolean;

  constructor({ position, image, frames = { max: 3 }, sprites, size = 50 }: SpriteProps) {
    this.position = position;
    this.image = image;
    this.frames = frames;
    this.sprites = sprites;
    this.frameCurrent = 0; // Start at the first frame
    this.size = size;
    this.lastDirection = null; // Initialize last direction as null
    this.frameCount = 0; // Initialize frame counter
    this.frameInterval = 150; // Time interval between frames (milliseconds) - increased for better mobile performance
    this.lastFrameTime = 0; // Time of last frame update
    this.inBattle = false; // Initialize outside battle zone
  }

  getSpriteFrame() {
    const frameWidth = this.image.width / this.frames.max; // Divide width by number of frames
    const frameHeight = this.image.height / this.frames.max; // Uses total image height

    let x, y;

    switch (this.frameCurrent) {
      case 0:
        x = 0
        y = 0; // Top part
        break;
      case 1:
        x = (1 % this.frames.max) * frameWidth; // Calculate x position based on frame counter
        y = (1 % this.frames.max) * frameHeight; // Calculate y position based on frame counter
        break;
      case 2:
        x = (1 % this.frames.max) * frameWidth; // Calculate x position based on frame counter
        y = 0; // Top part
        break;
      default:
        x = 0;
        y = 0;
    }

    return { x, y, frameWidth, frameHeight }; // Returns necessary information
  }

  // Method to update sprite size and position
  resize(newSize: number, canvasWidth: number, canvasHeight: number, wasInBattle: boolean, setWasInBattle: (value: boolean) => void) {
    this.size = newSize; // Update player size

    if (!wasInBattle) {
      this.position = {
        x: canvasWidth / 2 - newSize / 2, // Recenter player on canvas
        y: canvasHeight / 2 - newSize / 2,
      };

      setWasInBattle(false); // Update battle state
    } 
  }

  draw(context: CanvasRenderingContext2D) {
    const { x, y, frameWidth, frameHeight } = this.getSpriteFrame();

    // Here are the original sprite dimensions (assuming you have this information)
    const originalWidth = this.image.width / this.frames.max; // Width of one sprite frame
    const originalHeight = this.image.height / this.frames.max;; // Total image height

    // Calculate scale factor
    const scale = this.size / 50; // Adjust the constant (50) if the original player size is different

    // Calculate new width and height
    const newWidth = originalWidth * scale;
    const newHeight = originalHeight * scale;

    // Draw the correct part of the sprite based on current direction
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
    let isMoving = false; // Variable to check if the character is moving

    // Store previous position before moving
    const previousPosition = {
      x: this.position.x,
      y: this.position.y
    };

    // Calculate movement speed based on player size - proportional to cell size
    // Use a base speed that scales with player size, ensuring smooth movement on all screen sizes
    const baseSpeed = 2; // Base speed in pixels
    const movementSpeed = Math.max(1, (this.size / 50) * baseSpeed); // Scale speed with player size, minimum 1px

    // Check which keys are pressed
    const upPressed = keys.w.pressed || keys.ArrowUp.pressed;
    const downPressed = keys.s.pressed || keys.ArrowDown.pressed;
    const leftPressed = keys.a.pressed || keys.ArrowLeft.pressed;
    const rightPressed = keys.d.pressed || keys.ArrowRight.pressed;

    // Count how many keys are pressed in total
    const totalKeysPressed = (upPressed ? 1 : 0) + (downPressed ? 1 : 0) + (leftPressed ? 1 : 0) + (rightPressed ? 1 : 0);

    // If only one key is pressed, move normally
    // If multiple keys are pressed, use the last pressed key
    let directionToMove: 'up' | 'down' | 'left' | 'right' | null = null;

    if (totalKeysPressed === 1) {
      // Only one key pressed - move in that key's direction
      if (upPressed) directionToMove = 'up';
      else if (downPressed) directionToMove = 'down';
      else if (leftPressed) directionToMove = 'left';
      else if (rightPressed) directionToMove = 'right';
    } else if (totalKeysPressed > 1 && keys.lastPressed) {
      // Multiple keys pressed - use the last pressed key
      const lastKey = keys.lastPressed;
      if (lastKey === 'w' || lastKey === 'ArrowUp') directionToMove = 'up';
      else if (lastKey === 's' || lastKey === 'ArrowDown') directionToMove = 'down';
      else if (lastKey === 'a' || lastKey === 'ArrowLeft') directionToMove = 'left';
      else if (lastKey === 'd' || lastKey === 'ArrowRight') directionToMove = 'right';
    }

    // Apply movement based on determined direction
    if (directionToMove === 'up') {
      this.position.y -= movementSpeed; // Move player up
      isMoving = true;
      this.image = this.sprites!.up;
    } else if (directionToMove === 'down') {
      this.position.y += movementSpeed; // Move player down
      isMoving = true;
      this.image = this.sprites!.down;
    } else if (directionToMove === 'left') {
      this.position.x -= movementSpeed; // Move player left
      isMoving = true;
      this.image = this.sprites!.left;
    } else if (directionToMove === 'right') {
      this.position.x += movementSpeed; // Move player right
      isMoving = true;
      this.image = this.sprites!.right;
    }

    // Calculate scaled dimensions for collision detection (same as in draw method)
    const { frameWidth: originalFrameWidth, frameHeight: originalFrameHeight } = this.getSpriteFrame();
    const scale = this.size / 50; // Same scale factor used in draw method
    const scaledWidth = originalFrameWidth * scale;
    const scaledHeight = originalFrameHeight * scale;

    // Represent player as an object with position and dimensions for collision checking
    // Use SCALED dimensions, not original frame dimensions
    const playerRect = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      width: scaledWidth,
      height: scaledHeight,
    };

    // Check if there was a collision with any boundary
    const isColliding = boundaries.some(boundary =>
      Boundary.checkCollision(playerRect as Boundary, boundary)
    );

    if (isColliding) {
      // Revert position if there was a collision
      this.position.x = previousPosition.x;
      this.position.y = previousPosition.y;
    }

    // Check if player is in battle zone and get the zone type
    const currentBattleZone = battleZones.find(zone =>
      BattleZone.checkBattleZone(playerRect as BattleZone, zone)
    );

    // If in battle zone, roll a chance to start battle
    if (currentBattleZone && isMoving) {
      const chanceToStartBattle = Math.floor(Math.random() * 101);
      if (chanceToStartBattle > 99) { // 2% chance to start battle
        BattleZone.startBattle(() => {
          this.inBattle = true; // Update player state to in battle
        }, currentBattleZone.zoneType);
      }
    }

    // Logic to alternate between movement frames
    if (isMoving) {
      const currentTime = performance.now();
      if (currentTime - this.lastFrameTime > this.frameInterval) {
        this.frameCount++;
        this.frameCurrent = (this.frameCount % 3); // Alternates movement between 0, 1, 2
        this.lastFrameTime = currentTime; // Update last update time
      }
    }

    // Draw the sprite
    this.draw(context);
  }
}