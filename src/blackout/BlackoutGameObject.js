import { GameObjectNode, Stream, Game } from "tiny-game-engine";
import { Blackout } from "./index";

const SPEED = 0.5;

export class BlackoutGameObject extends GameObjectNode {
  static STATES = {
    DARK: 1,
    LIGHT: 0,
  };

  static MARKS = {
    MARK: Symbol("MARK"),
  };

  constructor({
    width,
    height,
    defaultState = BlackoutGameObject.STATES.DARK,
  }) {
    super({
      width,
      height,
      visible: defaultState !== BlackoutGameObject.STATES.DARK,
    });

    this.destination = 0;
    this.state = defaultState;

    this.stream = new Stream({
      start: false,
      fn: () => {
        const progress = Game.dt * (SPEED / 1000);

        if (this.destination > this.state) {
          this.state = Math.min(1, this.state + progress);
        } else if (this.destination < this.state) {
          this.state = Math.max(0, this.state - progress);
        } else {
          this.stream.stop();
          this.unmarkForUpdate(BlackoutGameObject.MARKS.MARK);
          if (this.state === 0) {
            this.hide();
          }
        }
      },
    });

    Game.stream.child(this.stream);

    Blackout.events.subscribe(Blackout.EVENTS.LIGHT, () => {
      if (!this.stream.isActive) {
        this.stream.continue();
        this.markForUpdate(BlackoutGameObject.MARKS.MARK);
      }
      this.show();
      this.destination = 0;
    });

    Blackout.events.subscribe(Blackout.EVENTS.DARK, () => {
      if (!this.stream.isActive) {
        this.stream.continue();
        this.markForUpdate(BlackoutGameObject.MARKS.MARK);
      }

      this.show();
      this.destination = 1;
    });
  }

  draw() {
    this.ctx.fillStyle = `rgba(0,0,0, ${this.state})`;
    this.ctx.fillRect(0, 0, this.size.width, this.size.height);
  }
}
