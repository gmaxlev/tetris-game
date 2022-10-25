import {
  GameObjectCanvas,
  Jobs,
  createArrayFrom,
  Stream,
  shuffleArray,
  Game,
  buildCanvasFont,
  Bezier,
  toRGBA,
  lighten,
  resolveColor,
} from "tiny-game-engine";
import { Playground } from "../Playground";

export class QueueGameObject extends GameObjectCanvas {
  static APPEAR_TIME = 50;

  static PADDING = 40;

  static BRICK_SIZE = 18;

  /**
   * @param {Playground} playground
   */
  constructor(playground) {
    super({
      width: 100,
      height:
        QueueGameObject.PADDING * 2 +
        4 * QueueGameObject.BRICK_SIZE * 3 +
        3 * QueueGameObject.BRICK_SIZE +
        20,
    });

    this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.size.height);
    this.gradient.addColorStop(0, "rgba(255,255,255,0)");
    this.gradient.addColorStop(0.8, "rgba(255,255,255,0.3)");

    this.whiteColor = resolveColor("rgba(255,255,255)");

    this.curve = new Bezier([0, 2, 1]);

    this.queue = playground.queue.map((figure) =>
      this.createFigureState(figure)
    );

    // Used to center figures
    this.topOffset = (this.size.height - this.getHeight(this.queue)) / 2;

    this.destroyingJobs = new Jobs();
    this.destroyingJobs.add([
      playground.events.subscribe(Playground.EVENTS.MADE_FIGURE, () => {
        this.queue.shift();
        this.queue.push(
          this.createFigureState(playground.queue[playground.queue.length - 1])
        );
        this.topOffset = (this.size.height - this.getHeight(this.queue)) / 2;
        this.markForUpdate(GameObjectCanvas.MARKS.SINGLE);
        this.stream.continue();
      }),
    ]);

    this.stream = new Stream({
      fn: () => this.updateStream(),
    });

    playground.stream.child(this.stream);

    this.markForUpdate(GameObjectCanvas.MARKS.SINGLE);
  }

  updateStream() {
    let stop = true;
    this.queue.forEach((item) => {
      item.progress = item.progress.map(({ time, offset }) => {
        if (time !== QueueGameObject.APPEAR_TIME + offset) {
          stop = false;
        }
        return {
          time: Math.min(QueueGameObject.APPEAR_TIME + offset, time + Game.dt),
          offset,
        };
      });
    });
    if (stop) {
      this.unmarkForUpdate(GameObjectCanvas.MARKS.SINGLE);
      this.stream.stop();
    }
  }

  getHeight(queue) {
    return queue.reduce(
      (prev, current) =>
        prev +
        current.figure.activeTetromino.pureHeight * QueueGameObject.BRICK_SIZE +
        QueueGameObject.BRICK_SIZE,
      -QueueGameObject.BRICK_SIZE
    );
  }

  createFigureState(figure) {
    const delay = shuffleArray(
      createArrayFrom(figure.activeTetromino.blocksCount).map(
        (item, index) => QueueGameObject.APPEAR_TIME * index
      )
    );

    return {
      figure,
      progress: createArrayFrom(figure.activeTetromino.blocksCount).map(
        (item, index) => ({
          time: 0,
          offset: delay[index],
        })
      ),
    };
  }

  getPosition() {
    return {
      x: 470,
      y: 100,
    };
  }

  render() {
    this.ctx.fillStyle = this.gradient;
    this.ctx.fillRect(0, 0, this.size.width, this.size.height);

    {
      const padding = 2;
      const height = 5;
      this.ctx.fillRect(
        padding,
        this.size.height - height - padding,
        this.size.width - padding * 2,
        height
      );
    }

    this.ctx.font = buildCanvasFont({
      fontSize: "20px",
      fontFamily: "RubikMonoOne",
    });
    this.ctx.fillStyle = "#fff";

    const { width } = this.ctx.measureText("NEXT");

    this.ctx.fillText("NEXT", (this.size.width - width) / 2, 40);

    this.ctx.fillStyle = "#fff";

    let eachOffset = 20;
    this.queue.forEach(({ figure, progress }) => {
      let index = 0;
      figure.activeTetromino.positions.forEach((row, rowIndex) => {
        const offsetY =
          figure.activeTetromino.freeSpaces.top * QueueGameObject.BRICK_SIZE;
        const offsetX =
          figure.activeTetromino.freeSpaces.left * QueueGameObject.BRICK_SIZE -
          (this.size.width -
            figure.activeTetromino.pureWidth * QueueGameObject.BRICK_SIZE) /
            2;

        row.forEach((col, colIndex) => {
          if (col === 1) {
            this.ctx.save();

            const appearProgress = this.curve.getPoint(
              Math.max(0, progress[index].time - progress[index].offset) /
                QueueGameObject.APPEAR_TIME
            );

            this.ctx.fillStyle = toRGBA(
              lighten(figure.color, 0.2 * (index / 4))
            );

            this.ctx.globalAlpha = Math.min(1, appearProgress);

            const x = Math.floor(
              colIndex * QueueGameObject.BRICK_SIZE - offsetX
            );
            const y = Math.floor(
              rowIndex * QueueGameObject.BRICK_SIZE -
                offsetY +
                eachOffset +
                this.topOffset
            );

            this.ctx.translate(
              x + QueueGameObject.BRICK_SIZE / 2,
              y + QueueGameObject.BRICK_SIZE / 2
            );

            this.ctx.scale(appearProgress, appearProgress);

            this.ctx.fillRect(
              -QueueGameObject.BRICK_SIZE / 2,
              -QueueGameObject.BRICK_SIZE / 2,
              QueueGameObject.BRICK_SIZE,
              QueueGameObject.BRICK_SIZE
            );

            this.ctx.restore();

            index += 1;
          }
        });
      });
      eachOffset +=
        figure.activeTetromino.pureHeight * QueueGameObject.BRICK_SIZE +
        QueueGameObject.BRICK_SIZE;
    });
  }

  destroy() {
    this.destroyingJobs.run();
    return super.destroy();
  }
}
