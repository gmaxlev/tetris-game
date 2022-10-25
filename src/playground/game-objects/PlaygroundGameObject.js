import { GameObjectCanvas, Jobs } from "tiny-game-engine";
import { PlaygroundBackgroundGameObject } from "./PlaygroundBackgroundGameObject";
import { Playground } from "../Playground";
import { BrickGameObject } from "./BrickGameObject";
import { RootGameObject } from "../../game-objects/RootGameObject";
import { FinishGameObject } from "./FinishGameObject";
import { Figure } from "../Figure";
import { Brick } from "../Brick";

export const PLAYGROUND_MAP_PADDING = 20;

export class PlaygroundGameObject extends GameObjectCanvas {
  static WIDTH = 320;

  static HEIGHT = 600;

  /**
   * @param {Playground} playground
   */
  constructor(playground) {
    super({
      width: PlaygroundGameObject.WIDTH,
      height: PlaygroundGameObject.HEIGHT,
    });

    this.playground = playground;

    this.defaultPosition = {
      x: (RootGameObject.WIDTH - this.size.width) / 2,
      y: (RootGameObject.HEIGHT - this.size.height) / 2,
    };

    this.destroyingJobs = new Jobs();

    this.playgroundBackgroundGameObject = new PlaygroundBackgroundGameObject(
      this.playground
    );
    this.playgroundBackgroundGameObject.subscribe(this);

    /** @type {Array<BrickGameObject>} */
    this.bricks = [];

    this.finishGameObject = null;

    this.destroyingJobs.add([
      this.playground.events.subscribe(
        Playground.EVENTS.BEFORE_CLEARING_ROWS,
        () => {
          this.markForUpdate(GameObjectCanvas.MARKS.SINGLE, 1);
        }
      ),
      this.playground.events.subscribe(
        Playground.EVENTS.MADE_FIGURE,
        /** @param {Figure} figure */
        (figure) => {
          figure.getAllBricks().forEach((brick) => {
            const brickGameObject = new BrickGameObject(
              this,
              this.playground,
              brick
            );
            brickGameObject.subscribe(this);

            brick.events.subscribeOnce(Brick.EVENTS.DESTROY, () => {
              this.bricks = this.bricks.filter(
                (item) => item !== brickGameObject
              );
              brickGameObject.destroy();
            });

            this.bricks.push(brickGameObject);
          });

          this.finishGameObject = new FinishGameObject(this.playground, figure);
          this.finishGameObject.subscribe(this);

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
  }

  getPosition() {
    return this.defaultPosition;
  }

  destroy() {
    this.playgroundBackgroundGameObject.destroy();
    this.bricks.forEach((brickGameObject) => brickGameObject.destroy());
    this.destroyingJobs.run();
    super.destroy();
  }
}
