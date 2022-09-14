import { Game, GameObjectCanvas, Jobs, StreamValue } from "tiny-game-engine";
import { BRICK_SIZE } from "./BrickGameObject";
import { Figure } from "./Figure";
import { Tetris } from "../tetris/Tetris";

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
    this.ctx.globalAlpha = 0.4 * this.opacity;
    this.ctx.fillStyle = "rgba(255,255,255)";
    this.figure.activeTetromino.positions.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col === 1) {
          this.ctx.fillRect(
            BRICK_SIZE * colIndex,
            BRICK_SIZE * rowIndex,
            BRICK_SIZE,
            BRICK_SIZE
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
