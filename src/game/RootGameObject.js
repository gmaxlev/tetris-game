import { GameObject } from "../core/GameObject";
import { LoadingGameObject } from "./LoadingGameObject";
import { BlackoutGameObject } from "./blackout/BlackoutGameObject";
import { BackgroundGameObject } from "./BackgroundGameObject";
import { Blackout } from "./blackout";
import { World } from "./World";

export class RootGameObject extends GameObject {
  constructor() {
    super({ width: 600, height: 800 });

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
      GameObject.EVENTS.BEFORE_DESTROYING,
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
