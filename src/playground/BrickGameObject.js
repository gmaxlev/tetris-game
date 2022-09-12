import { GameObjectCanvas, Jobs, StreamValue, Game } from "tiny-game-engine";
import { Brick } from "./Brick";
import { Tetris } from "../tetris/Tetris";

export const BRICK_SIZE = 28;

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
      this.brick.events.subscribe(Brick.EVENTS.FALLING_START, () => {
        this.markForUpdate(BrickGameObject.MARKS.FALLING);
      }),
      this.brick.events.subscribe(Brick.EVENTS.FALLING_END, () => {
        this.unmarkForUpdate(BrickGameObject.MARKS.FALLING);
      }),
    ]);

    this.appearStream = new StreamValue({
      fn: (value) => {
        this.opacity = Math.min(1, value / 100);
        if (this.opacity >= 1) {
          this.unmarkForUpdate(BrickGameObject.MARKS.APPEARING);
          this.appearStream.destroy();
          return;
        }
        return value + Game.dt;
      },
      initialValue: 0,
      name: "Appearing BrickGameObject",
    });

    Tetris.playground.stream.child(this.appearStream);

    this.markForUpdate(BrickGameObject.MARKS.APPEARING);
  }

  getPosition() {
    if (this.brick.falling.isActive) {
      return {
        x: Math.floor(
          this.brick.falling.from.col * BRICK_SIZE +
            (this.brick.falling.to.col - this.brick.falling.from.col) *
              BRICK_SIZE *
              this.brick.falling.progress
        ),
        y: Math.floor(
          this.brick.falling.from.row * BRICK_SIZE +
            (this.brick.falling.to.row - this.brick.falling.from.row) *
              BRICK_SIZE *
              this.brick.falling.progress
        ),
      };
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
      (this.brick.gameMapCell.bottom && !this.brick.gameMapCell.bottom.brick)
    ) {
      this.ctx.fillStyle = "rgba(0,0,0,0.3)";
      this.ctx.fillRect(0, BRICK_SIZE, BRICK_SIZE, 5);
    }

    this.ctx.fillStyle = this.brick.color;
    this.ctx.fillRect(0, 0, BRICK_SIZE, BRICK_SIZE);
    this.ctx.restore();
  }

  destroy() {
    this.appearStream.destroy();
    this.destroyingJobs.run();
  }
}
