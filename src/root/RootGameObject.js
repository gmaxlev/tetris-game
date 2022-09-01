import { GameObjectNode } from "tiny-game-engine";
import { LoadingGameObject } from "../loading/LoadingGameObject";
import { BlackoutGameObject } from "../blackout/BlackoutGameObject";
import { BackgroundGameObject } from "../background/BackgroundGameObject";
import { Blackout } from "../blackout";
import { World } from "../world/World";

export class RootGameObject extends GameObjectNode {
  static WIDTH = 600;

  static HEIGHT = 800;

  constructor() {
    super({
      width: RootGameObject.WIDTH,
      height: RootGameObject.HEIGHT,
    });

    this.loadingGameObject = new LoadingGameObject(
      this.size.width,
      this.size.height
    );

    this.blackoutGameObject = new BlackoutGameObject({
      width: this.size.width,
      height: this.size.height,
      defaultState: BlackoutGameObject.STATES.DARK,
    });

    this.backgroundGameObject = null;

    this.loadingGameObject.events.subscribeOnce(
      GameObjectNode.EVENTS.BEFORE_DESTROYING,
      () => {
        this.loadingGameObject = null;
        this.backgroundGameObject = new BackgroundGameObject(
          this.size.width,
          this.size.height
        );
        this.connect(this.backgroundGameObject);
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

    this.blackoutGameObject.drawTo(this.ctx);
  }
}
