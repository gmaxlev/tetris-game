import {
  buildCanvasFont,
  GameObjectCanvas,
  StreamValue,
  Game,
  Bezier,
} from "tiny-game-engine";
import { Playground } from "../Playground";

export class LevelGameObject extends GameObjectCanvas {
  static APPEAR_TIME = 300;

  static DISAPPEAR_TIME = 500;

  /**
   * @param {Playground} playground
   */
  constructor(playground) {
    super({
      width: 100,
      height: 200,
    });

    this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.size.height);
    this.gradient.addColorStop(0, "rgba(255,255,255,0.3)");
    this.gradient.addColorStop(0.8, "rgba(255,255,255,0)");

    this.level = [1, 1];

    this.disappearProgress = 0;
    this.appearProgress = 0;

    this.curve = new Bezier([0, 1, 2, 1]);

    this.curve2 = new Bezier([1, 0]);

    this.stream = new StreamValue({
      fn: (value) => this.updateStream(value),
      initialValue: 0,
      start: false,
    });

    playground.stream.child(this.stream);

    playground.events.subscribe(Playground.EVENTS.UPDATE_LEVEL, (level) => {
      this.level[1] = level;
      this.markForUpdate(GameObjectCanvas.MARKS.SINGLE);
      this.stream.continue();
    });

    this.markForUpdate(GameObjectCanvas.MARKS.SINGLE, 1);
  }

  updateStream(value) {
    this.appearProgress = Math.min(
      1,
      Math.max(0, value - LevelGameObject.APPEAR_TIME) /
        LevelGameObject.DISAPPEAR_TIME
    );

    this.disappearProgress = Math.min(
      1,
      Math.max(0, value / LevelGameObject.APPEAR_TIME)
    );

    if (this.disappearProgress === 1) {
      this.level[0] = this.level[1];
    }

    if (this.appearProgress === 1) {
      Game.jobs.afterUpdate.addOnce(() => {
        this.unmarkForUpdate(GameObjectCanvas.MARKS.SINGLE);
        this.stream.stop();
      });
      return 0;
    }
    return value + Game.dt;
  }

  getPosition() {
    return {
      x: 470,
      y: 471,
    };
  }

  render() {
    this.ctx.fillStyle = this.gradient;
    this.ctx.fillRect(0, 0, 100, 200);

    {
      this.ctx.font = buildCanvasFont({
        fontSize: "20px",
        fontFamily: "RubikMonoOne",
      });
      this.ctx.fillStyle = "#fff";

      const { width } = this.ctx.measureText("LEVEL");

      this.ctx.fillText("LEVEL", (this.size.width - width) / 2, 30);
    }

    {
      this.ctx.save();

      this.ctx.globalAlpha = Math.max(
        Math.min(1, this.appearProgress),
        1 - this.disappearProgress
      );

      const dynamic =
        15 * this.curve2.getPoint(this.disappearProgress) +
        15 * this.curve.getPoint(this.appearProgress);

      this.ctx.font = buildCanvasFont({
        fontSize: `${35 + dynamic}px`,
        fontFamily: "RubikMonoOne",
      });
      this.ctx.fillStyle = "#fff";

      const { width } = this.ctx.measureText(this.level[0]);

      this.ctx.fillText(this.level[0], (this.size.width - width) / 2, 100);
      this.ctx.restore();
    }
  }
}
