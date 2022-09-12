import { GameObjectPure, Stream, Game } from "tiny-game-engine";
import { Blackout } from "./index";

const SPEED = 0.5;

export class BlackoutGameObject extends GameObjectPure {
  static STATES = {
    DARK: 1,
    LIGHT: 0,
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
          if (this.state === 0) {
            this.unmarkForUpdate(GameObjectPure.MARKS.SINGLE);
          }
        }
      },
      name: "BlackoutGameObject",
    });

    Game.stream.child(this.stream);

    this.unsubscribes = [
      Blackout.events.subscribe(Blackout.EVENTS.LIGHT, () => {
        this.stream.continue();
        this.markForUpdate(GameObjectPure.MARKS.SINGLE);
        this.destination = 0;
      }),
      Blackout.events.subscribe(Blackout.EVENTS.DARK, () => {
        this.stream.continue();
        this.markForUpdate(GameObjectPure.MARKS.SINGLE);
        this.destination = 1;
      }),
    ];

    if (this.state === 1) {
      this.markForUpdate(GameObjectPure.MARKS.SINGLE);
    }
  }

  render(ctx) {
    if (this.state === 0) {
      return;
    }

    ctx.save();
    ctx.fillStyle = `rgba(0,0,0, ${this.state})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  destroy() {
    this.stream.destroy();
    this.unsubscribes.forEach((fn) => fn());
    super.destroy();
  }
}
