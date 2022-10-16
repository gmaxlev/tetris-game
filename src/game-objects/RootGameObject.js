import { GameObjectCanvas } from "tiny-game-engine";
import { LoadingGameObject } from "./LoadingGameObject";
import { BlackoutGameObject } from "./BlackoutGameObject";
import { BackgroundGameObject } from "./BackgroundGameObject";
import { PlaygroundGameObject } from "../playground/game-objects/PlaygroundGameObject";
import { FallingAnimationGameObject } from "../playground/game-objects/animations/FallingAnimationGameObject";
import { ExplosionAnimationGameObject } from "../playground/game-objects/animations/ExplosionAnimationGameObject";
import { FlyingDotsAnimationsGameObject } from "./animations/FlyingDotsAnimationsGameObject";
import { QueueGameObject } from "../playground/game-objects/QueueGameObject";
import { LevelGameObject } from "../playground/game-objects/LevelGameObject";
import { ScoreGameObject } from "../playground/game-objects/ScoreGameObject";
import { MoveNumbersAnimationGameObject } from "../playground/game-objects/animations/MoveNumbersAnimationGameObject";

/**
 * The root canvas
 */
export class RootGameObject extends GameObjectCanvas {
  static WIDTH = 600;

  static HEIGHT = 800;

  /** @param {Tetris} tetris */
  constructor(tetris) {
    super({
      width: RootGameObject.WIDTH,
      height: RootGameObject.HEIGHT,
    });

    this.tetris = tetris;

    /** @type {BackgroundGameObject} */
    this.backgroundGameObject = null;

    /** @type {PlaygroundGameObject} */
    this.playgroundGameObject = null;

    /** @type {FallingAnimationGameObject} */
    this.fallingAnimationGameObject = null;

    /** @type {ExplosionAnimationGameObject} */
    this.explosionGameObject = null;

    /** @type {FlyingDotsAnimationsGameObject} */
    this.flyingDotsAnimationGameObject = null;

    /** @type {QueueGameObject} */
    this.queueGameObject = null;

    /** @type {LevelGameObject} */
    this.levelGameObject = null;

    /** @type {ScoreGameObject} */
    this.scoreGameObject = null;

    /** @type {MoveNumbersAnimationGameObject} */
    this.moveNumbersAnimationGameObject = null;

    this.loadingGameObject = new LoadingGameObject(this.tetris);

    this.loadingGameObject.events.subscribeOnce(
      LoadingGameObject.EVENTS.DONE,
      () => this.makePlayground()
    );

    this.flyingDotsAnimationGameObject = new FlyingDotsAnimationsGameObject(
      this.tetris
    );
    this.flyingDotsAnimationGameObject.subscribe(this);

    this.blackoutGameObject = new BlackoutGameObject(
      this.tetris,
      this.tetris.blackout
    );

    this.loadingGameObject.subscribe(this);
    this.blackoutGameObject.subscribe(this);
  }

  makePlayground() {
    this.tetris.blackout.light();
    this.tetris.makePlayground();

    this.loadingGameObject.destroy();
    this.loadingGameObject = null;

    this.backgroundGameObject = new BackgroundGameObject(this.tetris);
    this.playgroundGameObject = new PlaygroundGameObject(
      this.tetris.playground
    );
    this.queueGameObject = new QueueGameObject(this.tetris.playground);
    this.levelGameObject = new LevelGameObject(this.tetris.playground);
    this.scoreGameObject = new ScoreGameObject(this.tetris.playground);
    this.moveNumbersAnimationGameObject = new MoveNumbersAnimationGameObject(
      this.tetris.playground,
      this.scoreGameObject
    );
    this.fallingAnimationGameObject = new FallingAnimationGameObject(
      this.tetris.playground,
      this.playgroundGameObject
    );
    this.explosionGameObject = new ExplosionAnimationGameObject(
      this.tetris.playground,
      this.size.width,
      this.size.height,
      this.playgroundGameObject
    );

    this.moveNumbersAnimationGameObject.subscribe(this);
    this.fallingAnimationGameObject.subscribe(this);
    this.backgroundGameObject.subscribe(this);
    this.playgroundGameObject.subscribe(this);
    this.playgroundGameObject.subscribe(this);
    this.explosionGameObject.subscribe(this);
    this.levelGameObject.subscribe(this);
    this.scoreGameObject.subscribe(this);
  }

  render() {
    if (this.loadingGameObject) {
      this.draw(this.loadingGameObject);
      return;
    }

    if (this.backgroundGameObject) {
      this.draw(this.backgroundGameObject);
    }

    if (this.flyingDotsAnimationGameObject) {
      this.draw(this.flyingDotsAnimationGameObject);
    }

    if (this.playgroundGameObject) {
      {
        const { x, y } = this.playgroundGameObject.getPosition();
        this.draw(this.playgroundGameObject, x, y);
        this.draw(this.fallingAnimationGameObject);
        this.draw(this.explosionGameObject, x + 20, y + 20);
      }

      {
        const { x, y } = this.queueGameObject.getPosition();
        this.draw(this.queueGameObject, x, y);
      }

      {
        const { x, y } = this.levelGameObject.getPosition();
        this.draw(this.levelGameObject, x, y);
      }

      {
        const { x, y } = this.scoreGameObject.getPosition();
        this.draw(this.scoreGameObject, x, y);
      }

      this.draw(this.moveNumbersAnimationGameObject);
    }

    if (this.blackoutGameObject) {
      this.draw(this.blackoutGameObject);
    }
  }
}
