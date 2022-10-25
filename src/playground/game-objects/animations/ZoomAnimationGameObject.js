import {
  GameObjectPure,
  PI_OVER_180,
  Stream,
  Game,
  getRandomInt,
  Bezier,
  toRGBA,
  colorLerp,
  resolveColor,
} from "tiny-game-engine";
import { BRICK_SIZE } from "../BrickGameObject";

/**
 * Zoom Animation
 * Shows after filling rows
 */
export class ZoomAnimationGameObject extends GameObjectPure {
  static ZOOM_TIME_FROM = 500;

  static ZOOM_TIME_TO = 1000;

  static ZOOM_INCREASE_FROM = 1;

  static ZOOM_INCREASE_TO = 3;

  static ZOOM_DECREASING_BY = 2;

  static ZOOM_ANGLE = 45;

  /**
   * @param {Playground} playground
   */
  constructor(playground) {
    super();

    this.zooms = [];

    this.curveExplosionIncreasing = new Bezier([0, 0.9, 1, 1]);

    this.stream = new Stream({
      fn: () => this.updateStream(),
      start: false,
      name: "ZoomAnimationGameObject",
    });

    playground.stream.child(this.stream);
  }

  /**
   * Adds animations
   * @param {Array<{x: number, y: number, delay: number, color: *}>} zooms
   */
  add(zooms) {
    this.zooms = this.zooms.concat(
      zooms.map(({ x, y, color, delay = 0 }) => ({
        progress: 0,
        time: getRandomInt(
          ZoomAnimationGameObject.ZOOM_TIME_FROM,
          ZoomAnimationGameObject.ZOOM_TIME_TO
        ),
        increase: getRandomInt(
          ZoomAnimationGameObject.ZOOM_INCREASE_FROM,
          ZoomAnimationGameObject.ZOOM_INCREASE_TO
        ),
        color: resolveColor(color),
        delay,
        x,
        y,
      }))
    );

    this.markForUpdate(GameObjectPure.MARKS.SINGLE);
    this.stream.continue();
  }

  updateStream() {
    this.zooms = this.zooms.filter(
      ({ progress, time, delay }) => Math.max(0, progress - delay) / time <= 1
    );

    if (this.zooms.length === 0) {
      Game.jobs.afterUpdate.add(() => {
        this.unmarkForUpdate(GameObjectPure.MARKS.SINGLE);
      });
      this.stream.stop();
      return;
    }

    this.zooms.forEach((item) => {
      item.progress += Game.dt;
    });
  }

  render(ctx) {
    this.zooms.forEach(({ progress, time, color, x, y, increase, delay }) => {
      const beforeTime = progress - delay;

      // Skip the animation if the rotation animation has not finished yet
      if (beforeTime < 0) {
        return;
      }

      const selfProgress = this.curveExplosionIncreasing.getPoint(
        Math.min(1, Math.max(0, beforeTime / time))
      );

      if (selfProgress === 1) {
        return;
      }

      const size =
        BRICK_SIZE / ZoomAnimationGameObject.ZOOM_DECREASING_BY +
        BRICK_SIZE * increase * selfProgress;

      ctx.save();

      ctx.globalAlpha = 1 - selfProgress;

      ctx.translate(x, y);

      ctx.rotate(ZoomAnimationGameObject.ZOOM_ANGLE * PI_OVER_180);

      ctx.fillStyle = toRGBA(colorLerp([255, 255, 255], color, selfProgress));
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    });
  }

  destroy() {
    this.stream.destroy();
    super.destroy();
  }
}
