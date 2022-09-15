import { GameObjectCanvas, Jobs } from "tiny-game-engine";
import { Tetris } from "../tetris/Tetris";
import { PlaygroundBackgroundGameObject } from "./PlaygroundBackgroundGameObject";
import { Playground } from "./Playground";
import { BrickGameObject } from "./BrickGameObject";
import { RootGameObject } from "../root/RootGameObject";
import { FinishGameObject } from "./FinishGameObject";
import { Figure } from "./Figure";
// import { FallingAnimationGameObject } from "./FallingAnimationGameObject";

export class PlaygroundGameObject extends GameObjectCanvas {
  constructor() {
    super({ width: 320, height: 600 });

    this.destroyingJobs = new Jobs();

    this.playgroundBackgroundGameObject = new PlaygroundBackgroundGameObject();
    this.playgroundBackgroundGameObject.subscribe(this);

    // this.fallingAnimationGameObject = new FallingAnimationGameObject();
    // this.fallingAnimationGameObject.subscribe(this);

    /** @type {Array<BrickGameObject>} */
    this.bricks = [];

    this.finishGameObject = null;

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
          this.finishGameObject = new FinishGameObject(figure);
          this.finishGameObject.subscribe(this);
          // this.fallingAnimationGameObject.listenFigure(figure);
          figure.events.subscribeOnce(Figure.EVENTS.DESTROY, () => {
            this.finishGameObject.destroy();
            this.finishGameObject = null;
          });
        }
      ),
    ]);
  }

  render() {
    this.draw(this.playgroundBackgroundGameObject, 0, 0);

    if (this.finishGameObject) {
      const { x, y } = this.finishGameObject.getPosition();
      this.draw(this.finishGameObject, x, y);
    }

    this.bricks.forEach((brickGameObject) => {
      const { x, y } = brickGameObject.getPosition();
      this.draw(brickGameObject, 20 + x, 20 + y);
    });

    // this.draw(this.fallingAnimationGameObject);
  }

  getPosition() {
    return {
      x: (RootGameObject.WIDTH - this.size.width) / 2,
      y: (RootGameObject.HEIGHT - this.size.height) / 2,
    };
  }

  destroy() {
    this.playgroundBackgroundGameObject.destroy();
    this.bricks.forEach((brickGameObject) => brickGameObject.destroy());
    this.destroyingJobs.run();
    super.destroy();
  }
}
