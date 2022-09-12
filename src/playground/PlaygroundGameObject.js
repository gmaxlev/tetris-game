import { GameObjectCanvas, Jobs } from "tiny-game-engine";
import { Tetris } from "../tetris/Tetris";
import { PlaygroundBackgroundGameObject } from "./PlaygroundBackgroundGameObject";
import { Playground } from "./Playground";
import { BrickGameObject } from "./BrickGameObject";

export class PlaygroundGameObject extends GameObjectCanvas {
  constructor() {
    super({ width: 320, height: 600 });

    this.destroyingJobs = new Jobs();

    this.playgroundBackgroundGameObject = new PlaygroundBackgroundGameObject();
    this.playgroundBackgroundGameObject.subscribe(this);

    /** @type {Array<BrickGameObject>} */
    this.bricks = [];

    this.destroyingJobs.addOnce([
      Tetris.playground.events.subscribe(
        Playground.EVENTS.MADE_FIGURE,
        /** @param {Figure} figure */
        (figure) => {
          figure.getAllBricks().forEach((brick) => {
            const brickGameObject = new BrickGameObject(brick);
            this.bricks.push(brickGameObject);
            brickGameObject.subscribe(this);
          });
        }
      ),
    ]);
  }

  render() {
    this.draw(this.playgroundBackgroundGameObject, 0, 0);

    this.bricks.forEach((brickGameObject) => {
      const { x, y } = brickGameObject.getPosition();
      this.draw(brickGameObject, 20 + x, 20 + y);
    });
  }

  destroy() {
    this.playgroundBackgroundGameObject.destroy();
    this.bricks.forEach((brickGameObject) => brickGameObject.destroy());
    this.destroyingJobs.run();
    super.destroy();
  }
}
