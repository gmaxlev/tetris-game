import {
  Game,
  GameObjectPure,
  lighten,
  PI_OVER_180,
  Stream,
  toRGBA,
} from "tiny-game-engine";
import { BRICK_SIZE } from "../BrickGameObject";

/**
 * Rotation Animation
 */
export class RotationAnimationGameObject extends GameObjectPure {
  static ROTATION_TIME = 200;

  static ROTATING_DECREASING_BY = 2;

  static ROTATING_ANGLE = 45;

  /**
   * @param {Playground} playground
   */
  constructor(playground) {
    super();
    this.bricks = [];

    this.stream = new Stream({
      fn: () => this.updateStream(),
      start: false,
      name: "RotationsAnimationGameObject",
    });
    playground.stream.child(this.stream);
  }

  /**
   * Adds animations
   * @param {Array<{x: number, y: number, delay: number, color: *}>} bricks
   */
  add(bricks) {
    this.bricks = this.bricks.concat(
      bricks.map(({ x, y, color, delay = 0 }) => ({
        progress: 0,
        x,
        y,
        color,
        delay,
      }))
    );

    this.markForUpdate(GameObjectPure.MARKS.SINGLE);
    this.stream.continue();
  }

  updateStream() {
    this.bricks = this.bricks.filter(
      ({ progress, delay }) =>
        Math.max(0, progress - delay) /
          RotationAnimationGameObject.ROTATION_TIME <=
        1
    );

    if (this.bricks.length === 0) {
      Game.jobs.afterUpdate.add(() => {
        this.unmarkForUpdate(GameObjectPure.MARKS.SINGLE);
      });
      this.stream.stop();
      return;
    }

    this.bricks.forEach((item) => {
      item.progress += Game.dt;
    });
  }

  render(ctx) {
    this.bricks.forEach(({ x, y, color, progress }) => {
      const selfProgress = Math.min(
        1,
        progress / RotationAnimationGameObject.ROTATION_TIME
      );

      if (selfProgress === 1) {
        return;
      }

      const size =
        BRICK_SIZE -
        (BRICK_SIZE / RotationAnimationGameObject.ROTATING_DECREASING_BY) *
          selfProgress;

      ctx.save();

      ctx.translate(x, y);

      ctx.rotate(
        RotationAnimationGameObject.ROTATING_ANGLE * selfProgress * PI_OVER_180
      );

      ctx.fillStyle = toRGBA(lighten(color, selfProgress));
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    });
  }

  destroy() {
    this.stream.destroy();
    super.destroy();
  }
}
