import { GameObjectCanvas } from "tiny-game-engine";
import { LoadingGameObject } from "./LoadingGameObject";
import { BlackoutGameObject } from "./BlackoutGameObject";
import { BackgroundGameObject } from "./BackgroundGameObject";
import { Blackout } from "../Blackout";
import { Tetris } from "../Tetris";
import {
  PLAYGROUND_MAP_PADDING,
  PlaygroundGameObject,
} from "../playground/game-objects/PlaygroundGameObject";
import { FallingAnimationGameObject } from "../playground/game-objects/animations/FallingAnimationGameObject";
import { ExplosionAnimationGameObject } from "../playground/game-objects/animations/ExplosionAnimationGameObject";
import { FlyingDotsAnimationsGameObject } from "./animations/FlyingDotsAnimationsGameObject";
import { QueueGameObject } from "../playground/game-objects/QueueGameObject";

export class RootGameObject extends GameObjectCanvas {
  static WIDTH = 600;

  static HEIGHT = 800;

  constructor() {
    super({
      width: RootGameObject.WIDTH,
      height: RootGameObject.HEIGHT,
    });

    this.backgroundGameObject = null;
    this.playgroundGameObject = null;
    this.fallingAnimationGameObject = null;
    this.explosionGameObject = null;
    this.flyingDotsAnimationGameObject = null;
    this.queueGameObject = null;

    this.loadingGameObject = new LoadingGameObject(
      this.size.width,
      this.size.height
    );

    this.loadingGameObject.events.subscribeOnce(
      LoadingGameObject.EVENTS.DONE,
      () => {
        this.loadingGameObject.destroy();
        this.loadingGameObject = null;

        this.flyingDotsAnimationGameObject =
          new FlyingDotsAnimationsGameObject();
        this.flyingDotsAnimationGameObject.subscribe(this);

        this.backgroundGameObject = new BackgroundGameObject(
          this.size.width,
          this.size.height
        );
        this.backgroundGameObject.subscribe(this);
        Blackout.light();

        Tetris.makePlayground();
        this.playgroundGameObject = new PlaygroundGameObject();
        this.playgroundGameObject.subscribe(this);

        this.queueGameObject = new QueueGameObject();
        this.playgroundGameObject.subscribe(this);

        this.fallingAnimationGameObject = new FallingAnimationGameObject();
        this.fallingAnimationGameObject.subscribe(this);

        this.explosionGameObject = new ExplosionAnimationGameObject(
          this.size.width,
          this.size.height,
          this.playgroundGameObject
        );
        this.explosionGameObject.subscribe(this);
      }
    );

    this.loadingGameObject.subscribe(this);

    this.blackoutGameObject = new BlackoutGameObject({
      width: this.size.width,
      height: this.size.height,
      defaultState: BlackoutGameObject.STATES.DARK,
    });

    this.blackoutGameObject.subscribe(this);
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
      const { x, y } = this.playgroundGameObject.getPosition();
      this.draw(this.playgroundGameObject, x, y);
      this.draw(
        this.queueGameObject,
        this.size.width +
          PLAYGROUND_MAP_PADDING / 2 -
          (this.size.width - this.playgroundGameObject.size.width) / 2,
        (this.size.height - this.playgroundGameObject.size.height) / 2
      );
      this.draw(this.fallingAnimationGameObject, x, y);
      this.draw(this.explosionGameObject, x + 20, y + 20);
    }

    if (this.blackoutGameObject) {
      this.draw(this.blackoutGameObject);
    }
  }
}
