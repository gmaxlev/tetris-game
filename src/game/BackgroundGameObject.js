import { GameObject } from "../core/GameObject";
import { Vector2 } from "../core/Vector2";
import { Tetris } from "./Tetris";
import { Bezier } from "../core/Bezier";
import { PolyBezier } from "../core/PolyBezier";
import { World } from "./World";

export class BackgroundGameObject extends GameObject {
  constructor(width, height) {
    super({ width, height });

    this.sunPicture = Tetris.resourcesMap.sun.get();

    this.objects = [
      {
        position: new Vector2(0, 450 / 0.009),
        color: "red",
        width: 50,
        height: 50,
        distance: 0.009,
        image: Tetris.resourcesMap.m6.get(),
      },
      {
        position: new Vector2(284 / 0.01, 496 / 0.01),
        color: "red",
        width: 50,
        height: 50,
        distance: 0.01,
        image: Tetris.resourcesMap.m5.get(),
      },
      {
        position: new Vector2(0, 430 / 0.03),
        color: "red",
        width: 50,
        height: 50,
        distance: 0.03,
        image: Tetris.resourcesMap.m4.get(),
      },
      {
        position: new Vector2(200 / 0.06, 460 / 0.06),
        color: "red",
        width: 50,
        height: 50,
        distance: 0.06,
        image: Tetris.resourcesMap.m3.get(),
      },
      {
        position: new Vector2(260 / 0.08, 560 / 0.08),
        color: "red",
        width: 50,
        height: 50,
        distance: 0.08,
        image: Tetris.resourcesMap.m2.get(),
      },
      {
        position: new Vector2(0, 480 / 0.1),
        color: "blue",
        width: 50,
        height: 50,
        distance: 0.1,
        image: Tetris.resourcesMap.m1.get(),
      },
    ];

    this.curve = new PolyBezier([
      new Bezier([
        new Vector2(0, 0),
        new Vector2(50, 0),
        new Vector2(100, -2330),
        new Vector2(150, -2330),
      ]),
      new Bezier([
        new Vector2(150, -2330),
        new Vector2(400, -2300),
        new Vector2(600, -2300),
      ]),
    ]);

    World.events.subscribe(World.EVENTS.START_TRANSITION_TO_GAME, () => {
      this.markForUpdate();
    });

    World.events.subscribe(World.EVENTS.END_TRANSITION_TO_GAME, () => {
      this.unmarkForUpdate();
    });

    this.markFramesForUpdate(1);
  }

  draw() {
    this.ctx.fillStyle = "#AAECDE";
    this.ctx.fillRect(0, 0, this.size.width, this.size.height);

    this.ctx.drawImage(this.sunPicture, -100, 0);

    this.objects.forEach((object) => {
      this.ctx.fillStyle = object.color;
      const x = object.position.x * object.distance;
      const y = (object.position.y - World.camera.y) * object.distance;
      if (object.image) {
        this.ctx.drawImage(object.image, x, y);
      }
    });
  }
}
