import { GameObjectNode } from "tiny-game-engine";
import { Tetris } from "../tetris/Tetris";
import { PlaygroundBackgroundGameObject } from "./PlaygroundBackgroundGameObject";
import { Playground } from "./Playground";
import { BrickGameObject } from "./BrickGameObject";

export class PlaygroundGameObject extends GameObjectNode {
  constructor() {
    super({ width: 320, height: 600 });

    this.bgImage = Tetris.resources.get("playground");
    this.playgroundBackgroundGameObject = new PlaygroundBackgroundGameObject();
    this.connect(this.playgroundBackgroundGameObject);

    /**
     * Controlled bricks
     * @type {Array<BrickGameObject>}
     */
    this.controlledBricks = [];

    Tetris.playground.events.subscribe(
      Playground.EVENTS.MADE_FIGURE,
      /** @param {Figure} figure */
      (figure) => {
        figure.getAllBricks().forEach((brick) => {
          const brickGameObject = new BrickGameObject(brick);
          this.controlledBricks.push(brickGameObject);
        });
        this.connect(this.controlledBricks);
      }
    );

    this.test = [];

    Tetris.playground.events.subscribe(Playground.EVENTS.TEST, (bricks) => {
      bricks.forEach((brick) => {
        const brickGameObject = new BrickGameObject(brick);
        this.test.push(brickGameObject);
      });
      this.connect(this.test);
    });
  }

  draw() {
    this.ctx.drawImage(this.bgImage, 0, 0);
    this.playgroundBackgroundGameObject.drawTo(this.ctx, 20, 20);

    this.controlledBricks.forEach((brickGameObject) => {
      const { x, y } = brickGameObject.getPosition();
      brickGameObject.drawTo(this.ctx, 20 + x, 20 + y);
    });

    this.test.forEach((brickGameObject) => {
      const { x, y } = brickGameObject.getPosition();
      brickGameObject.drawTo(this.ctx, 20 + x, 20 + y);
    });
  }
}
