import {
  GameObjectNode,
  Stream,
  Game,
  KeyFrames,
  Bezier,
} from "tiny-game-engine";
import { Tetris } from "../tetris/Tetris";

const INDICATOR_WIDTH = 400;
const INDICATOR_HEIGHT = 20;
const BORDER_PADDING = 10;

export class LoadingGameObject extends GameObjectNode {
  static MARKS = {
    INFINITY: Symbol(Infinity),
  };

  constructor(width, height) {
    super({ width, height });

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
    });

    this.decreaseWidthKeyFrames.events.subscribeOnce(
      KeyFrames.EVENTS.PAUSE,
      () => {
        this.destroy();
      }
    );

    Game.stream.child([
      this.decreaseHeightKeyFrames.stream,
      this.decreaseWidthKeyFrames.stream,
      this.stream,
    ]);

    this.destroyingJobs.add([
      () => this.decreaseHeightKeyFrames.destroy(),
      () => this.decreaseWidthKeyFrames.destroy(),
      () => this.stream.destroy(),
    ]);

    this.markForUpdate(LoadingGameObject.MARKS.INFINITY);
  }

  draw() {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.size.width, this.size.height);

    this.ctx.save();

    this.ctx.translate(this.size.width / 2, this.size.height / 2);

    this.ctx.scale(
      1 - this.decreaseWidthKeyFrames.progress,
      1 - this.decreaseHeightKeyFrames.progress
    );

    this.ctx.globalAlpha = 1 - 0.8 * this.decreaseWidthKeyFrames.progress;

    const borderWidth = INDICATOR_WIDTH + BORDER_PADDING;
    const borderHeight = INDICATOR_HEIGHT + BORDER_PADDING;

    this.ctx.strokeStyle = "#fff";
    this.ctx.strokeRect(
      (borderWidth / 2) * -1,
      (borderHeight / 2) * -1,
      borderWidth,
      borderHeight
    );

    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(
      (INDICATOR_WIDTH / 2) * -1,
      (INDICATOR_HEIGHT / 2) * -1,
      this.indicatorWidth,
      INDICATOR_HEIGHT
    );

    this.ctx.restore();
  }
}
