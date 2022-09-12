import {
  GameObjectPure,
  Stream,
  Game,
  KeyFrames,
  Bezier,
} from "tiny-game-engine";
import { Tetris } from "../tetris/Tetris";

const INDICATOR_WIDTH = 400;
const INDICATOR_HEIGHT = 20;
const BORDER_PADDING = 10;

export class LoadingGameObject extends GameObjectPure {
  static EVENTS = {
    DONE: Symbol("DONE"),
  };

  constructor() {
    super();

    this.indicatorWidth = 0;

    this.decreaseHeightCurve = new Bezier([0, 0.9, 0.9, 0.9]);
    this.decreaseWidthCurve = new Bezier([0, 1, 1, 1]);

    this.decreaseHeightKeyFrames = new KeyFrames({
      total: 300,
      exact: true,
      interceptor: this.decreaseHeightCurve.getPoint,
    });
    this.decreaseWidthKeyFrames = new KeyFrames({
      total: 200,
      exact: true,
      interceptor: this.decreaseWidthCurve.getPoint,
    });

    this.stream = new Stream({
      start: true,
      fn: () => {
        if (this.indicatorWidth !== INDICATOR_WIDTH) {
          const add = Game.dt * (300 / 1000);
          this.indicatorWidth = Math.min(
            INDICATOR_WIDTH * Tetris.resources.loadingProgress,
            this.indicatorWidth + add
          );
        } else if (!this.decreaseHeightKeyFrames.isActive) {
          this.decreaseHeightKeyFrames.start();
        }
        if (
          this.decreaseHeightKeyFrames.progress >= 0.9 &&
          !this.decreaseWidthKeyFrames.isActive
        ) {
          this.decreaseWidthKeyFrames.start();
        }
      },
      name: "LoadingGameObject",
    });

    this.decreaseWidthKeyFrames.events.subscribeOnce(
      KeyFrames.EVENTS.PAUSE,
      () => {
        this.events.emit(LoadingGameObject.EVENTS.DONE);
      }
    );

    this.stream.child([
      this.decreaseHeightKeyFrames.stream,
      this.decreaseWidthKeyFrames.stream,
    ]);

    Game.stream.child([this.stream]);

    this.markForUpdate(GameObjectPure.MARKS.SINGLE);
  }

  /**
   * @param ctx
   */
  render(ctx) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();

    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

    ctx.scale(
      1 - this.decreaseWidthKeyFrames.progress,
      1 - this.decreaseHeightKeyFrames.progress
    );

    ctx.globalAlpha = 1 - 0.8 * this.decreaseWidthKeyFrames.progress;

    const borderWidth = INDICATOR_WIDTH + BORDER_PADDING;
    const borderHeight = INDICATOR_HEIGHT + BORDER_PADDING;

    ctx.strokeStyle = "#fff";
    ctx.strokeRect(
      (borderWidth / 2) * -1,
      (borderHeight / 2) * -1,
      borderWidth,
      borderHeight
    );

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      (INDICATOR_WIDTH / 2) * -1,
      (INDICATOR_HEIGHT / 2) * -1,
      this.indicatorWidth,
      INDICATOR_HEIGHT
    );

    ctx.restore();
  }

  destroy() {
    this.decreaseHeightKeyFrames.destroy();
    this.decreaseWidthKeyFrames.destroy();
    this.stream.destroy();
    super.destroy();
  }
}
