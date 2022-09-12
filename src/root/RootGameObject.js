import { GameObjectCanvas } from "tiny-game-engine";
import { LoadingGameObject } from "../loading/LoadingGameObject";
import { BlackoutGameObject } from "../blackout/BlackoutGameObject";
import { BackgroundGameObject } from "../background/BackgroundGameObject";
import { Blackout } from "../blackout";
import { World } from "../world/World";
import { PlaygroundGameObject } from "../playground/PlaygroundGameObject";
import { Tetris } from "../tetris/Tetris";

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

    this.loadingGameObject = new LoadingGameObject(
      this.size.width,
      this.size.height
    );

    this.loadingGameObject.events.subscribeOnce(
      LoadingGameObject.EVENTS.DONE,
      () => {
        this.loadingGameObject.destroy();
        this.loadingGameObject = null;
        this.backgroundGameObject = new BackgroundGameObject(
          this.size.width,
          this.size.height
        );
        this.backgroundGameObject.subscribe(this);
        Blackout.light();
        World.toGame();

        Tetris.makePlayground();
        this.playgroundGameObject = new PlaygroundGameObject();
        this.playgroundGameObject.subscribe(this);
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
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(0, 0, this.size.width, this.size.height);

    if (this.loadingGameObject) {
      this.draw(this.loadingGameObject);
      return;
    }

    if (this.backgroundGameObject) {
      this.draw(this.backgroundGameObject);
    }

    if (this.playgroundGameObject) {
      this.draw(
        this.playgroundGameObject,
        (RootGameObject.WIDTH - this.playgroundGameObject.size.width) / 2,
        (RootGameObject.HEIGHT - this.playgroundGameObject.size.height) / 2
      );
    }

    if (this.blackoutGameObject) {
      this.draw(this.blackoutGameObject);
    }
  }
}
