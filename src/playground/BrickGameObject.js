import { GameObjectNode } from "tiny-game-engine";
import { Brick } from "./Brick";

export const BRICK_SIZE = 28;

export class BrickGameObject extends GameObjectNode {
  static MARKS = {
    MOVE: Symbol("MOVE"),
  };

  /**
   * @param {Brick} brick
   */
  constructor(brick) {
    super({ width: BRICK_SIZE, height: BRICK_SIZE });
    this.brick = brick;

    this.brick.events.subscribe(Brick.EVENTS.MOVE, () => {
      this.markForUpdate(BrickGameObject.MARKS.MOVE, 1);
    });

    this.markForUpdate(BrickGameObject.MARKS.MOVE, 1);
  }

  getPosition() {
    return {
      x: this.brick.gameMapCell.col * BRICK_SIZE,
      y: this.brick.gameMapCell.row * BRICK_SIZE,
    };
  }

  draw() {
    this.ctx.fillRect(0, 0, BRICK_SIZE, BRICK_SIZE);
  }
}
