import {
  GameObjectCanvas,
  Jobs,
  StreamValue,
  Game,
  toRGBA,
  lighten,
} from "tiny-game-engine";
import { Brick } from "../Brick";
import { PLAYGROUND_MAP_PADDING } from "./PlaygroundGameObject";

export const BRICK_SIZE = 28;
export const BRICK_LIGHT_HEIGHT = 3;
export const BRICK_DARKEN_HEIGHT = 5;

export class BrickGameObject extends GameObjectCanvas {
  /**
   * @param {GameMapCell} from
   * @param {GameMapCell} to
   * @param {number} t
   * @returns {number}
   */
  static lerpBricksPosition(from, to, t) {
    return {
      x: Math.floor(
        from.col * BRICK_SIZE + (to.col - from.col) * BRICK_SIZE * t
      ),
      y: Math.floor(
        from.row * BRICK_SIZE + (to.row - from.row) * BRICK_SIZE * t
      ),
    };
  }

  static MARKS = {
    MOVE: Symbol("MOVE"),
    FALLING: Symbol("FALLING"),
    COLLISION: Symbol("COLLISION"),
    APPEARING: Symbol("APPEARING"),
    SMOOTH_MOVING: Symbol("SMOOTH_MOVING"),
  };

  static APPEARING_DELAY = 200;

  /**
   * @param {PlaygroundGameObject} playgroundGameObject
   * @param {Playground} playground
   * @param {Brick} brick
   */
  constructor(playgroundGameObject, playground, brick) {
    super({
      width: BRICK_SIZE,
      height: BRICK_SIZE + BRICK_LIGHT_HEIGHT + BRICK_DARKEN_HEIGHT,
    });
    this.playgroundGameObject = playgroundGameObject;
    this.playground = playground;
    this.brick = brick;
    this.brick.setGameObject(this);

    this.destroyingJobs = new Jobs();

    this.opacity = 0;

    this.destroyingJobs.add([
      this.brick.events.subscribe(Brick.EVENTS.MOVE, () => {
        this.markForUpdate(BrickGameObject.MARKS.MOVE, 1);
      }),
      this.brick.events.subscribe(Brick.EVENTS.COLLISION, () => {
        this.markForUpdate(BrickGameObject.MARKS.COLLISION, 1);
      }),
      this.brick.events.subscribe(Brick.EVENTS.SMOOTH_MOVING_START, () => {
        this.markForUpdate(BrickGameObject.MARKS.SMOOTH_MOVING);
      }),
      this.brick.events.subscribe(Brick.EVENTS.SMOOTH_MOVING_STOP, () => {
        this.unmarkForUpdate(BrickGameObject.MARKS.SMOOTH_MOVING);
      }),
      this.brick.events.subscribe(Brick.EVENTS.FALLING_START, () => {
        this.markForUpdate(BrickGameObject.MARKS.FALLING);
      }),
      this.brick.events.subscribe(Brick.EVENTS.FALLING_STOP, () => {
        this.unmarkForUpdate(BrickGameObject.MARKS.FALLING);
      }),
    ]);

    // Add a little delay before appearing :)
    this.playground.stream.child(
      new StreamValue({
        fn: (value, stream) => {
          this.opacity = Math.min(1, value / BrickGameObject.APPEARING_DELAY);
          if (this.opacity >= 1) {
            Game.jobs.afterUpdate.add(() => {
              this.unmarkForUpdate(BrickGameObject.MARKS.APPEARING);
            });
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

  getAbsolutePosition() {
    const { x: playgroundX, y: playgroundY } =
      this.playgroundGameObject.getPosition();
    const { x: brickX, y: brickY } = this.getPosition();
    return {
      x: playgroundX + brickX + PLAYGROUND_MAP_PADDING,
      y: playgroundY + brickY + PLAYGROUND_MAP_PADDING,
    };
  }

  getPosition() {
    if (
      this.brick.figure &&
      this.brick.figure.falling.isActive &&
      this.brick.falling
    ) {
      const { x, y } = BrickGameObject.lerpBricksPosition(
        this.brick.gameMapCell,
        this.brick.falling,
        this.brick.figure.falling.progress
      );
      return {
        x,
        y: y - BRICK_LIGHT_HEIGHT,
      };
    }

    if (this.brick.smoothMoving && this.playground.falling.isActive) {
      const { x, y } = BrickGameObject.lerpBricksPosition(
        this.brick.gameMapCell,
        this.brick.smoothMoving,
        this.playground.falling.progress
      );
      return {
        x,
        y: y - BRICK_LIGHT_HEIGHT,
      };
    }

    return {
      x: this.brick.gameMapCell.col * BRICK_SIZE,
      y: this.brick.gameMapCell.row * BRICK_SIZE - BRICK_LIGHT_HEIGHT,
    };
  }

  render() {
    this.ctx.save();
    this.ctx.globalAlpha = this.opacity;

    if (!this.brick.gameMapCell.top || !this.brick.gameMapCell.top.brick) {
      this.ctx.fillStyle = toRGBA(lighten(this.brick.color, 0.3));
      this.ctx.fillRect(0, 0, BRICK_SIZE, BRICK_LIGHT_HEIGHT);
    }

    this.ctx.fillStyle = toRGBA(this.brick.color);
    this.ctx.fillRect(0, BRICK_LIGHT_HEIGHT, BRICK_SIZE, BRICK_SIZE);

    if (
      !this.brick.gameMapCell.bottom ||
      !this.brick.gameMapCell.bottom.brick
    ) {
      this.ctx.fillStyle = "rgba(0,0,0,0.1)";
      this.ctx.fillRect(
        0,
        BRICK_SIZE + BRICK_LIGHT_HEIGHT,
        BRICK_SIZE,
        BRICK_DARKEN_HEIGHT
      );
    }

    this.ctx.restore();
  }

  destroy() {
    this.destroyingJobs.run();
    super.destroy();
  }
}
