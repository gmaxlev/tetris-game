import {
  GameObjectCanvas,
  Vector2,
  PolyBezier,
  Bezier,
  StreamValue,
  Game,
} from "tiny-game-engine";
import { Tetris } from "../Tetris";

export class BackgroundGameObject extends GameObjectCanvas {
  constructor(width, height) {
    super({ width, height });

    this.sunPicture = Tetris.resourcesMap.sun.get();

    this.appearingCurve = new PolyBezier([
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
        image: Tetris.resourcesMap.m6.get(),
      },
      {
        position: new Vector2(284 / 0.01, 496 / 0.01),
        distance: 0.01,
        image: Tetris.resourcesMap.m5.get(),
      },
      {
        position: new Vector2(0, 430 / 0.03),
        distance: 0.03,
        image: Tetris.resourcesMap.m4.get(),
      },
      {
        position: new Vector2(200 / 0.06, 460 / 0.06),
        distance: 0.06,
        image: Tetris.resourcesMap.m3.get(),
      },
      {
        position: new Vector2(260 / 0.08, 560 / 0.08),
        distance: 0.08,
        image: Tetris.resourcesMap.m2.get(),
      },
      {
        position: new Vector2(0, 480 / 0.1),
        distance: 0.1,
        image: Tetris.resourcesMap.m1.get(),
      },
    ];

    this.yProgress = 0;

    this.stream = new StreamValue({
      fn: (value) => {
        const progress = Math.min(1, value / 5000);
        this.yProgress = progress;
        if (progress === 1) {
          Game.jobs.afterUpdate.addOnce(() => {
            this.stream.stop();
            this.unmarkForUpdate(GameObjectCanvas.MARKS.SINGLE);
          });
        }

        return value + Game.dt;
      },
      initialValue: 0,
      name: "BackgroundGameObject",
    });

    Tetris.stream.child(this.stream);

    this.markForUpdate(GameObjectCanvas.MARKS.SINGLE);
  }

  render() {
    this.ctx.fillStyle = "#AAECDE";
    this.ctx.fillRect(0, 0, this.size.width, this.size.height);

    this.ctx.drawImage(this.sunPicture, -100, 0);

    this.objects.forEach((object) => {
      const x = object.position.x * object.distance;
      const y =
        (object.position.y - this.appearingCurve.getPoint(this.yProgress).y) *
        object.distance;
      this.ctx.drawImage(object.image, x, y);
    });
  }

  destroy() {
    this.stream.destroy();
    super.destroy();
  }
}
