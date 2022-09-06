import { GameObjectNode, Stream, Game } from "tiny-game-engine";
import { Tetris } from "../tetris/Tetris";

export class PlaygroundBackgroundGameObject extends GameObjectNode {
  static MARKS = {
    MARK: Symbol("MARK"),
  };

  constructor() {
    super({ width: 280, height: 560 });

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

    this.stream = Tetris.playground.stream.child(
      new Stream({
        fn: () => {
          this.progress = Math.min(this.time, this.progress + Game.dt);
          if (this.progress === this.time) {
            this.stream.stop();
            this.unmarkForUpdate(PlaygroundBackgroundGameObject.MARKS.MARK);
          }
        },
      })
    );

    this.markForUpdate(PlaygroundBackgroundGameObject.MARKS.MARK);
  }

  draw() {
    if (this.progress === 0) {
      return;
    }

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
  }
}
