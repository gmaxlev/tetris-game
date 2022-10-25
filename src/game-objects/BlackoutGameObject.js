import {
  GameObjectPure,
  Jobs,
  Stream,
  Game,
  limitNumber,
} from "tiny-game-engine";
import { Blackout } from "../Blackout";

export class BlackoutGameObject extends GameObjectPure {
  /**
   * @param {Tetris} tetris
   * @param {Blackout} blackout
   * */
  constructor(tetris, blackout) {
    super();
    this.tetris = tetris;
    this.blackout = blackout;
    this.state = [1, 1];

    this.destroyJobs = new Jobs();
    this.destroyJobs.add([
      this.blackout.events.subscribe(Blackout.EVENTS.DARK, () => {
        this.state[1] = 1;
        this.markForUpdate(GameObjectPure.MARKS.SINGLE);
        this.stream.continue();
      }),
      this.blackout.events.subscribe(Blackout.EVENTS.LIGHT, () => {
        this.state[1] = 0;
        this.markForUpdate(GameObjectPure.MARKS.SINGLE);
        this.stream.continue();
      }),
    ]);

    this.stream = new Stream({
      fn: () => this.updateStream(),
      name: "Blackout",
      start: false,
    });

    this.tetris.stream.child(this.stream);
  }

  updateStream() {
    const update = Game.dt * (1 / 1000);

    this.state[0] = limitNumber(
      0,
      1,
      this.state[1] > this.state[0]
        ? this.state[0] + update
        : this.state[0] - update
    );

    if (this.state[0] === this.state[1]) {
      Game.jobs.afterUpdate.add(() => {
        this.stream.stop();
        if (this.state[0] !== 1) {
          this.unmarkForUpdate(GameObjectPure.MARKS.SINGLE);
        }
      });
    }
  }

  /** @param {CanvasRenderingContext2D} ctx */
  render(ctx) {
    ctx.fillStyle = `rgba(0,0,0,${this.state[0]})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  destroy() {
    this.stream.destroy();
    this.destroyJobs.run();
    super.destroy();
  }
}
