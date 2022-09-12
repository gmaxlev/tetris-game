import { GameObjectCanvas, Vector2, Jobs } from "tiny-game-engine";
import { Tetris } from "../tetris/Tetris";
import { World } from "../world/World";

export class BackgroundGameObject extends GameObjectCanvas {
  constructor(width, height) {
    super({ width, height });

    this.sunPicture = Tetris.resourcesMap.sun.get();

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

    this.destroyingJobs = new Jobs();

    this.destroyingJobs.addOnce([
      World.events.subscribe(World.EVENTS.START_TRANSITION_TO_GAME, () => {
        this.markForUpdate(GameObjectCanvas.MARKS.SINGLE);
      }),
      World.events.subscribe(World.EVENTS.END_TRANSITION_TO_GAME, () => {
        this.unmarkForUpdate(GameObjectCanvas.MARKS.SINGLE);
      }),
    ]);
  }

  render() {
    this.ctx.fillStyle = "#AAECDE";
    this.ctx.fillRect(0, 0, this.size.width, this.size.height);

    this.ctx.drawImage(this.sunPicture, -100, 0);

    this.objects.forEach((object) => {
      const x = object.position.x * object.distance;
      const y = (object.position.y - World.camera.y) * object.distance;
      this.ctx.drawImage(object.image, x, y);
    });
  }

  destroy() {
    this.destroyingJobs.run();
    super.destroy();
  }
}
