import { GameObject } from "../../core/GameObject";
import { Blackout } from "./index";
import { Game } from "../../core/Game";
import { Stream } from "../../core/Stream";

const SPEED = 0.5;

export class BlackoutGameObject extends GameObject {
  static STATES = {
    DARK: 1,
    LIGHT: 0,
  };

  constructor({
    width,
    height,
    defaultState = BlackoutGameObject.STATES.DARK,
  }) {
    super({ width, height });

    this.aim = 0;
    this.state = defaultState;

    this.stream = new Stream({
      start: false,
      fn: () => {
        if (this.aim > this.state) {
          this.state = Math.min(1, this.state + Game.dt * (SPEED / 1000));
        } else if (this.aim < this.state) {
          this.state = Math.max(0, this.state - Game.dt * (SPEED / 1000));
        } else {
          this.stream.stop();
          this.unmarkForUpdate();
          if (this.state === 0) {
            this.setState(GameObject.STATES.HIDDEN);
          }
        }
      },
    });

    Game.stream.child(this.stream);

    Blackout.events.subscribe(Blackout.EVENTS.LIGHT, () => {
      if (!this.stream.isActive) {
        this.stream.continue();
        this.markForUpdate();
      }
      this.setState(GameObject.STATES.SHOWN);
      this.aim = 0;
    });

    Blackout.events.subscribe(Blackout.EVENTS.DARK, () => {
      if (!this.stream.isActive) {
        this.stream.continue();
        this.markForUpdate();
      }

      this.setState(GameObject.STATES.SHOWN);
      this.aim = 1;
    });

    this.setState(GameObject.STATES.HIDDEN);
  }

  draw() {
    this.ctx.fillStyle = `rgba(0,0,0, ${this.state})`;
    this.ctx.fillRect(0, 0, this.size.width, this.size.height);
  }
}
