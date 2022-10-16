import {
  GameObjectPure,
  StreamValue,
  Game,
  PI_OVER_180,
  getRandomInt,
  toRGBA,
  getRandomElement,
  pipe,
  lighten,
  createArrayFrom,
} from "tiny-game-engine";
import { RootGameObject } from "../RootGameObject";
import { BRICKS_COLORS } from "../../constants";

/**
 *  ·   ·   ·   ·   ·   ·   ·
 * Moving dots on the background
 *    ·   ·   ·   ·   ·   ·   ·
 */
export class FlyingDotsAnimationsGameObject extends GameObjectPure {
  static DOTS_SIZE = 60;

  static COLOR_LIGHTEN = 0.7;

  static TIME_RANGE = [2000, 10000];

  static SPEED_RANGE = [5, 40];

  static RADIUS_RANGE = [1, 2];

  static APPEARING_RANGE = [0.4, 0.4];

  /**
   * @param {Tetris} tetris
   */
  constructor(tetris) {
    super();
    this.tetris = tetris;
    this.dots = [];
    this.colors = BRICKS_COLORS.map((color) =>
      pipe(
        lighten(color, FlyingDotsAnimationsGameObject.COLOR_LIGHTEN),
        (value) => toRGBA(value)
      )
    );

    createArrayFrom(FlyingDotsAnimationsGameObject.DOTS_SIZE).forEach(() =>
      this.dots.push(this.makeDot())
    );

    this.stream = new StreamValue({
      fn: (value) => this.updateStream(value),
      initialValue: 0,
      name: "FlyingDotsAnimationGameObject",
    });
    this.tetris.stream.child(this.stream);
    this.markForUpdate(GameObjectPure.MARKS.SINGLE);
  }

  /**
   * Creates and returns a random dot
   */
  makeDot() {
    const angle = getRandomInt(0, 360) * PI_OVER_180;
    const time = getRandomInt(
      FlyingDotsAnimationsGameObject.TIME_RANGE[0],
      FlyingDotsAnimationsGameObject.TIME_RANGE[1]
    );
    return {
      x: getRandomInt(0, RootGameObject.WIDTH),
      y: getRandomInt(0, RootGameObject.HEIGHT),
      sin: Math.sin(angle),
      cos: Math.cos(angle),
      progress: 0,
      appear: time * FlyingDotsAnimationsGameObject.APPEARING_RANGE[0],
      disappear: time * FlyingDotsAnimationsGameObject.APPEARING_RANGE[1],
      speed: getRandomInt(
        FlyingDotsAnimationsGameObject.SPEED_RANGE[0],
        FlyingDotsAnimationsGameObject.SPEED_RANGE[1]
      ),
      color: getRandomElement(this.colors),
      radius: getRandomInt(
        FlyingDotsAnimationsGameObject.RADIUS_RANGE[0],
        FlyingDotsAnimationsGameObject.RADIUS_RANGE[1]
      ),
      time,
    };
  }

  updateStream(value) {
    this.dots.forEach((dot) => {
      const progress = Game.dt * (dot.speed / 1000);
      dot.x += dot.cos * progress;
      dot.y += dot.sin * progress;
      dot.progress += Game.dt;
    });
    // With the aim of performance update dots
    // after minimum time of them existing
    if (value > FlyingDotsAnimationsGameObject.TIME_RANGE[0]) {
      this.dots = this.dots.map((dot) => {
        if (dot.progress / dot.time > 1) {
          return this.makeDot();
        }
        return dot;
      });
      return 0;
    }

    return value + Game.dt;
  }

  render(ctx) {
    ctx.save();

    this.dots.forEach((dot) => {
      if (
        dot.x > RootGameObject.WIDTH ||
        dot.y > RootGameObject.HEIGHT ||
        dot.x < 0 - dot.radius * 2 ||
        dot.y < 0 - dot.radius * 2
      ) {
        return;
      }

      const end = Math.max(
        0,
        Math.min(1, (dot.progress - (dot.time - dot.disappear)) / dot.disappear)
      );

      if (end === 1) {
        return;
      }

      const start = Math.min(1, dot.progress / dot.appear);

      ctx.save();

      ctx.fillStyle = dot.color;

      ctx.globalAlpha = start - end;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore();
    });

    ctx.restore();
  }

  destroy() {
    this.stream.destroy();
    super.destroy();
  }
}
