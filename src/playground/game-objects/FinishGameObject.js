import {
  Game,
  GameObjectCanvas,
  Jobs,
  StreamValue,
  alpha,
  toRGBA,
} from "tiny-game-engine";
import { BRICK_SIZE } from "./BrickGameObject";
import { Figure } from "../Figure";
import { Tetris } from "../../Tetris";

export class FinishGameObject extends GameObjectCanvas {
  static MARKS = {
    APPEARING: Symbol("APPEARING"),
    MOVE: Symbol("MOVE"),
  };

  constructor(figure) {
    super({
      width: figure.activeTetromino.size * BRICK_SIZE,
      height: figure.activeTetromino.size * BRICK_SIZE,
    });
    this.figure = figure;

    this.destrotingJobs = new Jobs();
    this.destrotingJobs.addOnce(
      this.figure.events.subscribe(Figure.EVENTS.MOVE, () => {
        this.markForUpdate(FinishGameObject.MARKS.MOVE, 1);
      })
    );

    this.opacity = 0;

    Tetris.playground.stream.child(
      new StreamValue({
        fn: (value, stream) => {
          this.opacity = Math.min(1, value / 200);
          if (this.opacity >= 1) {
            Game.jobs.afterUpdate.addOnce(() => {
              this.unmarkForUpdate(FinishGameObject.MARKS.APPEARING);
            });
            stream.destroy();
            return;
          }
          return value + Game.dt;
        },
        initialValue: 0,
        name: "Appearing BrickGameObject",
      })
    );

    this.markForUpdate(FinishGameObject.MARKS.APPEARING);
  }

  getPosition() {
    return {
      x: this.figure.finish.position.x * BRICK_SIZE + 20,
      y: this.figure.finish.position.y * BRICK_SIZE + 20,
    };
  }

  render() {
    this.ctx.save();
    this.ctx.globalAlpha = 1 * this.opacity;
    const padding = 0.5;
    this.figure.activeTetromino.positions.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col === 1) {
          const rowPosition =
            this.figure.finish.position.y +
            this.figure.activeTetromino.freeSpaces.top +
            rowIndex;
          // Opacity depends on row height
          this.ctx.fillStyle = toRGBA(
            alpha("rgba(255,255,255)", 1 - 0.5 * (rowPosition / 19))
          );
          this.ctx.fillRect(
            BRICK_SIZE * colIndex + padding - 1,
            BRICK_SIZE * rowIndex + padding - 1,
            BRICK_SIZE - padding * 2,
            BRICK_SIZE - padding * 2
          );
        }
      });
    });
    this.ctx.restore();
  }

  destroy() {
    this.destrotingJobs.run();
    super.destroy();
  }
}
