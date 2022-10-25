import {
  buildCanvasFont,
  GameObjectCanvas,
  Bezier,
  StreamValue,
  Game,
  toRGBA,
} from "tiny-game-engine";

export class ScoreGameObject extends GameObjectCanvas {
  static JUMP_TIME = 500;

  /**
   * @param {Playground} playground
   */
  constructor(playground) {
    super({ width: 100, height: 100 });
    this.score = [0, 0];
    this.circles = [];

    this.curve = new Bezier([1, 0.5, 1.5, 1]);

    this.stream = new StreamValue({
      fn: (value) => this.updateStream(value),
      initialValue: {
        total: 0,
        jumps: 0,
      },
    });

    playground.stream.child(this.stream);

    this.markForUpdate(GameObjectCanvas.MARKS.SINGLE, 1);

    window.add = (num, color) => {
      this.add(num, color);
    };
  }

  add(score, color) {
    this.score[1] += score;

    this.circles.push({
      progress: 0,
      time: 700,
      color: toRGBA(color),
      radius: Math.min(100, (score / 50) * 50),
    });

    this.markForUpdate(GameObjectCanvas.MARKS.SINGLE);
    this.stream.continue();
  }

  updateStream({ total, jumps }) {
    this.circles = this.circles.filter((item) => item.progress <= item.time);

    const updateJumps = jumps > ScoreGameObject.JUMP_TIME ? 0 : jumps + Game.dt;

    this.score[0] = Math.min(
      this.score[1],
      this.score[0] + Game.dt * (100 / 1000)
    );

    if (
      this.score[0] === this.score[1] &&
      updateJumps === 0 &&
      this.circles.length === 0
    ) {
      Game.jobs.afterUpdate.add(() => {
        this.unmarkForUpdate(GameObjectCanvas.MARKS.SINGLE);
        this.stream.stop();
      });
      return {
        total: 0,
        jumps: 0,
      };
    }

    this.circles.forEach((item) => {
      item.progress += Game.dt;
    });

    return {
      total: total + Game.dt,
      jumps: updateJumps,
    };
  }

  getCenterAbsolutePosition() {
    return {
      x: 520,
      y: 628,
    };
  }

  getPosition() {
    return {
      x: 470,
      y: 580,
    };
  }

  render() {
    this.ctx.save();

    this.circles.forEach(({ progress, time, color }) => {
      const t = Math.min(1, progress / time);

      const radius = 40 * t;
      this.ctx.globalAlpha = 1 - t;
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(this.size.width / 2, 50, radius, 0, 2 * Math.PI);
      this.ctx.fill();
    });

    this.ctx.restore();

    {
      this.ctx.save();
      this.ctx.font = buildCanvasFont({
        fontSize: `10px`,
        fontFamily: "RubikMonoOne",
      });
      this.ctx.fillStyle = "#fff";

      const { width } = this.ctx.measureText("score");

      this.ctx.fillText("score", (this.size.width - width) / 2, 35);
      this.ctx.restore();
    }

    {
      this.ctx.save();

      const plus =
        16 *
        this.curve.getPoint(
          Math.min(ScoreGameObject.JUMP_TIME, this.stream.value.jumps) /
            ScoreGameObject.JUMP_TIME
        );

      this.ctx.font = buildCanvasFont({
        fontSize: `${plus}px`,
        fontFamily: "RubikMonoOne",
      });

      this.ctx.fillStyle = "#fff";

      const { width } = this.ctx.measureText(Math.floor(this.score[0]));

      this.ctx.fillText(
        Math.floor(this.score[0]),
        (this.size.width - width) / 2,
        55
      );
      this.ctx.restore();
    }
  }
}
