import { GameObjectCanvas, Jobs, StreamValue, Game } from "tiny-game-engine";
import { Brick } from "./Brick";
import { Tetris } from "../tetris/Tetris";
import { Figure } from "./Figure";

export const BRICK_SIZE = 28;

/**
 *
 * @param {GameMapCell} from
 * @param {GameMapCell} to
 * @param {number} progress
 * @returns {number}
 */
export function getFallingPosition(from, to, progress) {
  return {
    x: Math.floor(
      from.col * BRICK_SIZE + (to.col - from.col) * BRICK_SIZE * progress
    ),
    y: Math.floor(
      from.row * BRICK_SIZE + (to.row - from.row) * BRICK_SIZE * progress
    ),
  };
}

export class BrickGameObject extends GameObjectCanvas {
  static MARKS = {
    MOVE: Symbol("MOVE"),
    FALLING: Symbol("FALLING"),
    COLLISION: Symbol("COLLISION"),
    APPEARING: Symbol("APPEARING"),
  };

  /**
   * @param {Brick} brick
   */
  constructor(brick) {
    super({ width: BRICK_SIZE, height: BRICK_SIZE + 5 });
    this.brick = brick;

    this.destroyingJobs = new Jobs();

    this.opacity = 0;

    this.destroyingJobs.addOnce([
      this.brick.events.subscribe(Brick.EVENTS.MOVE, () => {
        this.markForUpdate(BrickGameObject.MARKS.MOVE, 1);
      }),
      this.brick.events.subscribe(Brick.EVENTS.COLLISION, () => {
        this.markForUpdate(BrickGameObject.MARKS.COLLISION, 1);
      }),
      this.brick.figure.events.subscribe(Figure.EVENTS.FALLING_START, () => {
        this.markForUpdate(BrickGameObject.MARKS.FALLING);
      }),
      this.brick.figure.events.subscribe(Figure.EVENTS.FALLING_STOP, () => {
        this.unmarkForUpdate(BrickGameObject.MARKS.FALLING);
      }),
    ]);

    Tetris.playground.stream.child(
      new StreamValue({
        fn: (value, stream) => {
          this.opacity = Math.min(1, value / 200);
          if (this.opacity >= 1) {
            this.unmarkForUpdate(BrickGameObject.MARKS.APPEARING);
            stream.destroy();
            return;
          }
          return value + Game.dt;
        },
        initialValue: 0,
        name: "Appearing BrickGameObject",
      })
    );

    this.markForUpdate(BrickGameObject.MARKS.APPEARING);
  }

  getPosition() {
    if (this.brick.figure && this.brick.figure.falling.isActive) {
      return getFallingPosition(
        this.brick.gameMapCell,
        this.brick.falling,
        this.brick.figure.falling.progress
      );
    }

    return {
      x: Math.floor(this.brick.gameMapCell.col * BRICK_SIZE),
      y: Math.floor(this.brick.gameMapCell.row * BRICK_SIZE),
    };
  }

  render() {
    this.ctx.save();
    this.ctx.globalAlpha = this.opacity;
    if (
      !this.brick.gameMapCell.bottom ||
      !this.brick.gameMapCell.bottom.brick
    ) {
      this.ctx.fillStyle = "rgba(0,0,0,0.3)";
      this.ctx.fillRect(0, BRICK_SIZE, BRICK_SIZE, 5);
    }

    this.ctx.fillStyle = this.brick.color;
    this.ctx.fillRect(0, 0, BRICK_SIZE, BRICK_SIZE);
    this.ctx.restore();
  }

  destroy() {
    this.destroyingJobs.run();
  }
}
