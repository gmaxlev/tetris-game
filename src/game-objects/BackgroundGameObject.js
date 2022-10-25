import {
  GameObjectCanvas,
  Vector2,
  PolyBezier,
  Bezier,
  StreamValue,
  Game,
} from "tiny-game-engine";
import { RootGameObject } from "./RootGameObject";

/**
 *   ^  ^  ^^^  ^  ^^^^ ^^  ^
 * The background with mountains
 * ^^^ ^^^  ^   ^  ^^^^  ^  ^
 */
export class BackgroundGameObject extends GameObjectCanvas {
  /** @param {Tetris} tetris */
  constructor(tetris) {
    super({ width: RootGameObject.WIDTH, height: RootGameObject.HEIGHT });

    this.tetris = tetris;

    this.sunPicture = this.tetris.resourcesMap.sun.get();

    // Curve of initial moving above mountains ;)
    this.appearCurve = new PolyBezier([
      new Bezier([
        new Vector2(0, 0),
        new Vector2(50, 0),
        new Vector2(100, -2350),
        new Vector2(150, -2350),
      ]),
      new Bezier([
        new Vector2(150, -2350),
        new Vector2(300, -2300),
        new Vector2(1800, -2300),
      ]),
    ]);

    this.objects = [
      {
        position: new Vector2(0, 450 / 0.009),
        distance: 0.009,
        image: this.tetris.resourcesMap.m6.get(),
      },
      {
        position: new Vector2(284 / 0.01, 496 / 0.01),
        distance: 0.01,
        image: this.tetris.resourcesMap.m5.get(),
      },
      {
        position: new Vector2(0, 430 / 0.03),
        distance: 0.03,
        image: this.tetris.resourcesMap.m4.get(),
      },
      {
        position: new Vector2(200 / 0.06, 460 / 0.06),
        distance: 0.06,
        image: this.tetris.resourcesMap.m3.get(),
      },
      {
        position: new Vector2(260 / 0.08, 560 / 0.08),
        distance: 0.08,
        image: this.tetris.resourcesMap.m2.get(),
      },
      {
        position: new Vector2(0, 480 / 0.1),
        distance: 0.1,
        image: this.tetris.resourcesMap.m1.get(),
      },
    ];

    this.yProgress = 0;

    this.tetris.stream.child(
      new StreamValue({
        fn: (value, stream) => this.updateStream(value, stream),
        initialValue: 0,
        name: "BackgroundGameObject",
      })
    );

    this.markForUpdate(GameObjectCanvas.MARKS.SINGLE);
  }

  updateStream(value, stream) {
    this.yProgress = Math.min(1, value / 5000);

    if (this.yProgress === 1) {
      Game.jobs.afterUpdate.add(() => {
        stream.destroy();
        this.unmarkForUpdate(GameObjectCanvas.MARKS.SINGLE);
      });
      return;
    }

    return value + Game.dt;
  }

  render() {
    this.ctx.fillStyle = "#AAECDE";
    this.ctx.fillRect(0, 0, this.size.width, this.size.height);

    this.ctx.drawImage(this.sunPicture, -100, 0);

    this.objects.forEach((object) => {
      const x = object.position.x * object.distance;
      const y =
        (object.position.y - this.appearCurve.getPoint(this.yProgress).y) *
        object.distance;
      this.ctx.drawImage(object.image, x, y);
    });
  }
}
