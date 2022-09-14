import { GameObjectCanvas, Stream, Game } from "tiny-game-engine";
import { Tetris } from "../tetris/Tetris";

export class PlaygroundBackgroundGameObject extends GameObjectCanvas {
  constructor() {
    super({ width: 320, height: 600 });

    this.bgImage = Tetris.resources.get("playground");

    this.map = Array.from(new Array(Tetris.playground.gameMap.rows - 1))
      .map(() => Array.from(new Array(Tetris.playground.gameMap.cols - 1)))
      .map((row, rowIndex) =>
        row.map((col, colIndex) => ({
          rowTime: Math.abs((9 - rowIndex) / 9),
          colTime: Math.abs((4 - colIndex) / 4),
        }))
      );

    this.progress = 0;
    this.time = 5000;

    this.stream = new Stream({
      fn: () => {
        this.progress = Math.min(this.time, this.progress + Game.dt);
        if (this.progress === this.time) {
          this.stream.stop();
          this.unmarkForUpdate(GameObjectCanvas.MARKS.SINGLE);
        }
      },
      name: "PlaygroundBackgroundGameObject",
    });

    Tetris.playground.stream.child(this.stream);

    this.markForUpdate(GameObjectCanvas.MARKS.SINGLE);
  }

  render() {
    this.ctx.drawImage(this.bgImage, 0, 0);

    if (this.progress === 0) {
      return;
    }

    this.ctx.save();
    this.ctx.translate(20, 20);

    this.ctx.fillStyle = "#A43CAC";

    this.map.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        const { rowTime, colTime } = col;

        const progress = this.progress / this.time;

        const progressRow = rowTime === 0 ? 1 : Math.min(1, progress / rowTime);
        const progressCol = colTime === 0 ? 1 : Math.min(1, progress / colTime);

        this.ctx.save();
        this.ctx.globalAlpha = (progressRow + progressCol) / 2;
        this.ctx.beginPath();
        this.ctx.arc(colIndex * 28 + 28, rowIndex * 28 + 28, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });
    });

    this.ctx.restore();
  }

  destroy() {
    this.stream.destroy();
    super.destroy();
  }
}
