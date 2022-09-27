import {
  Game,
  GameObjectPure,
  lighten,
  PI_OVER_180,
  Stream,
  toRGBA,
} from "tiny-game-engine";
import { Tetris } from "../../../Tetris";
import { BRICK_SIZE } from "../BrickGameObject";

/**
 * Rotation Animation
 */
export class RotationAnimationGameObject extends GameObjectPure {
  static ROTATION_TIME = 200;

  static ROTATING_DECREASING_BY = 2;

  static ROTATING_ANGLE = 45;

  constructor() {
    super();
    this.rows = [];
    this.stream = new Stream({
      fn: () => this.updateStream(),
      name: "RotationsAnimationGameObject",
      start: false,
    });
    Tetris.playground.stream.child(this.stream);
  }

  add(rows) {
    this.rows.push({
      progress: 0,
      rows,
    });
    this.markForUpdate(GameObjectPure.MARKS.SINGLE);
    this.stream.continue();
  }

  updateStream() {
    this.rows = this.rows.filter(
      ({ progress }) =>
        progress / RotationAnimationGameObject.ROTATION_TIME <= 1
    );

    if (this.rows.length === 0) {
      Game.jobs.afterUpdate.addOnce(() => {
        this.unmarkForUpdate(GameObjectPure.MARKS.SINGLE);
      });
      this.stream.stop();
      return;
    }

    this.rows.forEach((item) => {
      item.progress += Game.dt;
    });
  }

  render(ctx, offsetX, offsetY) {
    this.rows.forEach((item) => {
      const progress = Math.min(
        1,
        item.progress / RotationAnimationGameObject.ROTATION_TIME
      );
      const size =
        BRICK_SIZE -
        (BRICK_SIZE / RotationAnimationGameObject.ROTATING_DECREASING_BY) *
          progress;

      item.rows.forEach(({ row, bricks }) => {
        bricks.forEach(({ color }, index) => {
          const x = index * BRICK_SIZE + offsetX;
          const y = row * BRICK_SIZE + offsetY;

          ctx.save();

          ctx.translate(x + BRICK_SIZE / 2, y + BRICK_SIZE / 2);

          ctx.rotate(
            RotationAnimationGameObject.ROTATING_ANGLE * progress * PI_OVER_180
          );

          ctx.fillStyle = toRGBA(lighten(color, progress));
          ctx.fillRect(-size / 2, -size / 2, size, size);
          ctx.restore();
        });
      });
    });
  }
}
