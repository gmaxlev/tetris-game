import { GameObjectNode } from "tiny-game-engine";
import { LoadingGameObject } from "../loading/LoadingGameObject";
import { BlackoutGameObject } from "../blackout/BlackoutGameObject";
import { BackgroundGameObject } from "../background/BackgroundGameObject";
import { Blackout } from "../blackout";
import { World } from "../world/World";
import { PlaygroundGameObject } from "../playground/PlaygroundGameObject";
import { Tetris } from "../tetris/Tetris";

export class RootGameObject extends GameObjectNode {
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

    this.blackoutGameObject = new BlackoutGameObject({
      width: this.size.width,
      height: this.size.height,
      defaultState: BlackoutGameObject.STATES.DARK,
    });

    this.loadingGameObject.events.subscribeOnce(
      GameObjectNode.EVENTS.BEFORE_DESTROYING,
      () => {
        this.loadingGameObject = null;
        this.backgroundGameObject = new BackgroundGameObject(
          this.size.width,
          this.size.height
        );
        Tetris.makePlayground();
        this.playgroundGameObject = new PlaygroundGameObject();
        this.connect([this.backgroundGameObject, this.playgroundGameObject]);
        World.toGame();
        Blackout.light();
      }
    );

    this.connect(this.loadingGameObject);
    this.connect(this.blackoutGameObject);
  }

  draw() {
    if (this.loadingGameObject) {
      this.loadingGameObject.drawTo(this.ctx);
    }

    if (this.backgroundGameObject) {
      this.backgroundGameObject.drawTo(this.ctx);
    }

    if (this.playgroundGameObject) {
      this.playgroundGameObject.drawTo(
        this.ctx,
        (RootGameObject.WIDTH - this.playgroundGameObject.size.width) / 2,
        (RootGameObject.HEIGHT - this.playgroundGameObject.size.height) / 2
      );
    }

    this.blackoutGameObject.drawTo(this.ctx);
  }
}
