import {
  GameObjectPure,
  getRandomInt,
  PI_OVER_180,
  toRGBA,
  Stream,
  Game,
  Bezier,
} from "tiny-game-engine";
import { BRICK_SIZE } from "../BrickGameObject";

/**
 * Flying Bricks Animation
 */
export class FlyingAnimationBricksGameObject extends GameObjectPure {
  static FLYING_BRICKS_DECREASE_SPEED = 0.9;

  static FLYING_BRICKS_DECREASE_SIZE = 0.5;

  static FLYING_BRICKS_DECREASE_TIME = 0.2;

  static FLYING_BRICKS_ROTATION_SPEED = 30;

  static FLYING_BRICKS_TIME_FROM = 1000;

  static FLYING_BRICKS_TIME_TO = 3000;

  static FLYING_BRICKS_SPEED_FROM = 1750;

  static FLYING_BRICKS_SPEED_TO = 2000;

  static FLYING_BRICKS_SIZE_FROM = 15;

  static FLYING_BRICKS_SIZE_TO = 20;

  /**
   * @param {Playground} playground
   * @param width
   * @param height
   */
  constructor(playground, width, height) {
    super();
    this.width = width;
    this.height = height;
    this.bricks = [];
    this.curveSpeedBricks = new Bezier([0, 0.8, 0.9, 1]);
    this.stream = new Stream({
      fn: () => this.updateStream(),
      name: "FlyingAnimationBricksGameObject",
      start: false,
    });
    playground.stream.child(this.stream);
  }

  /**
   * Adds animations
   * @param {Array<{x: number, y: number, delay: number, color: *}>} bricks
   */
  add(bricks) {
    bricks.forEach(({ x, y, color, delay }) => {
      const angle = getRandomInt(0, 360);
      this.bricks.push({
        x,
        y,
        delay,
        angle,
        direction: angle,
        sin: Math.sin(angle * PI_OVER_180),
        cos: Math.cos(angle * PI_OVER_180),
        isChangingDirectionY: false,
        isChangingDirectionX: false,
        time: getRandomInt(
          FlyingAnimationBricksGameObject.FLYING_BRICKS_TIME_FROM,
          FlyingAnimationBricksGameObject.FLYING_BRICKS_TIME_TO
        ),
        speed: getRandomInt(
          FlyingAnimationBricksGameObject.FLYING_BRICKS_SPEED_FROM,
          FlyingAnimationBricksGameObject.FLYING_BRICKS_SPEED_TO
        ),
        size: getRandomInt(
          FlyingAnimationBricksGameObject.FLYING_BRICKS_SIZE_FROM,
          FlyingAnimationBricksGameObject.FLYING_BRICKS_SIZE_TO
        ),
        color: toRGBA(color),
        progress: 0,
      });
    });
    this.markForUpdate(GameObjectPure.MARKS.SINGLE);
    this.stream.continue();
  }

  updateStream() {
    this.bricks = this.bricks.filter(
      ({ progress, time, delay }) => Math.max(0, progress - delay) / time <= 1
    );

    if (this.bricks.length === 0) {
      Game.jobs.afterUpdate.addOnce(() => {
        this.unmarkForUpdate(GameObjectPure.MARKS.SINGLE);
      });
      this.stream.stop();
      return;
    }

    this.bricks.forEach((brick) => {
      const beforeTime = brick.progress - brick.delay;

      brick.progress += Game.dt;

      // Skip the animation if the rotation animation has not finished yet
      if (beforeTime < 0) {
        return;
      }

      const progress = Math.max(0, beforeTime) / brick.time;

      const changeOffset =
        brick.speed *
        FlyingAnimationBricksGameObject.FLYING_BRICKS_DECREASE_SPEED *
        this.curveSpeedBricks.getPoint(
          Math.min(
            1,
            progress /
              FlyingAnimationBricksGameObject.FLYING_BRICKS_DECREASE_TIME
          )
        );

      const offset = Game.dt * ((brick.speed - changeOffset) / 1000);

      brick.x += offset * brick.cos;
      brick.y += offset * brick.sin;

      brick.angle +=
        Game.dt *
        ((offset *
          FlyingAnimationBricksGameObject.FLYING_BRICKS_ROTATION_SPEED) /
          1000);
      brick.angle = brick.angle > 360 ? 0 : brick.angle;

      const size =
        brick.size -
        brick.size *
          FlyingAnimationBricksGameObject.FLYING_BRICKS_DECREASE_SIZE *
          progress;

      let isChangedDirection = false;

      if (brick.y <= 0 || brick.y >= this.height - size) {
        if (!brick.isChangingDirectionY) {
          brick.direction = 360 - brick.direction;
          brick.isChangingDirectionY = true;
          isChangedDirection = true;
        }
      } else {
        brick.isChangingDirectionY = false;
      }

      if (brick.x <= 0 || brick.x >= this.width - size) {
        if (!brick.isChangingDirectionX) {
          brick.direction = 180 - brick.direction;
          brick.isChangingDirectionX = true;
          isChangedDirection = true;
        }
      } else {
        brick.isChangingDirectionX = false;
      }

      if (isChangedDirection) {
        brick.sin = Math.sin(brick.direction * PI_OVER_180);
        brick.cos = Math.cos(brick.direction * PI_OVER_180);
      }
    });
  }

  render(ctx) {
    this.bricks.forEach(
      ({ progress, time, angle, x, y, color, size, delay }) => {
        const beforeTime = progress - delay;

        // Skip the animation if the rotation animation has not finished yet
        if (beforeTime < 0) {
          return;
        }

        const selfProgress = this.curveSpeedBricks.getPoint(
          Math.min(1, Math.max(0, beforeTime / time))
        );

        if (selfProgress === 1) {
          return;
        }

        const decreasedSize = (size / 2) * selfProgress;
        const calcSize = size - decreasedSize;

        ctx.save();

        ctx.globalAlpha = 0.8 - 0.8 * selfProgress;

        ctx.translate(
          x + BRICK_SIZE / 2 - decreasedSize,
          y + BRICK_SIZE / 2 - decreasedSize
        );

        ctx.fillStyle = color;
        ctx.rotate(angle * PI_OVER_180);

        ctx.fillRect(-calcSize / 2, -calcSize / 2, calcSize, calcSize);
        ctx.restore();
      }
    );
  }

  destroy() {
    this.stream.destroy();
    super.destroy();
  }
}
