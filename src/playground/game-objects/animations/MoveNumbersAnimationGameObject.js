import {
  GameObjectPure,
  Bezier,
  Stream,
  Game,
  getRandomFloat,
  buildCanvasFont,
  toRGBA,
  resolveColor,
} from "tiny-game-engine";
import { Playground } from "../../Playground";
import { BRICK_SIZE } from "../BrickGameObject";
import { PLAYGROUND_MAP_PADDING } from "../PlaygroundGameObject";
import { RootGameObject } from "../../../game-objects/RootGameObject";

export class MoveNumbersAnimationGameObject extends GameObjectPure {
  /**
   * @param {Playground} playground
   * @param {ScoreGameObject} scoreGameObject
   */
  constructor(playground, scoreGameObject) {
    super();
    this.scoreGameObject = scoreGameObject;

    this.numbers = [];

    this.speedCurve = new Bezier([0, 0.7, 1]);
    this.sizeCurve = new Bezier([0, 1, 0]);

    this.stream = new Stream({
      fn: () => this.updateStream(),
      start: false,
    });

    playground.stream.child(this.stream);

    playground.events.subscribe(Playground.EVENTS.UPDATE_SCORE, (data) => {
      data.collections.forEach(({ x, y, width, height, color, scores }) => {
        const xPos = 140 + x * BRICK_SIZE + PLAYGROUND_MAP_PADDING;
        const yPos = 100 + y * BRICK_SIZE + PLAYGROUND_MAP_PADDING;

        this.add(
          xPos,
          yPos,
          width * BRICK_SIZE,
          height * BRICK_SIZE,
          resolveColor(color),
          scores
        );
      });
      this.markForUpdate(GameObjectPure.MARKS.SINGLE);
      this.stream.continue();
    });
  }

  updateStream() {
    this.numbers = this.numbers.filter((item) => {
      const next = item.progress <= item.time;

      if (!next) {
        this.scoreGameObject.add(item.number, item.color);
      }

      return next;
    });

    if (!this.numbers.length) {
      this.unmarkForUpdate(GameObjectPure.MARKS.SINGLE);
      this.stream.stop();
      return;
    }

    this.numbers.forEach((item) => {
      item.progress += Game.dt;
    });
  }

  add(x, y, width, height, color, scores) {
    const middleX = x + (RootGameObject.WIDTH - x) * getRandomFloat(0, 1);
    const middleY = y + (RootGameObject.HEIGHT - y) * getRandomFloat(-1, 1);

    const { x: destinyX, y: destinyY } =
      this.scoreGameObject.getCenterAbsolutePosition();

    const curve = new Bezier([
      { x, y },
      { x: middleX, y: middleY },
      { x: destinyX, y: destinyY },
    ]);

    const length = curve.getLength();

    this.numbers.push({
      number: scores,
      curve,
      progress: 0,
      time: 2.5 * length + 10 * scores,
      color: toRGBA(color),
      size: Math.min(200, 50 + 2 * scores),
      width,
      height,
      measureText: null,
    });
  }

  render(ctx) {
    this.numbers.forEach(({ number, curve, progress, time, color, size }) => {
      const t = Math.min(time, progress) / time;

      const { x, y } = curve.getPoint(this.speedCurve.getPoint(t));

      const fontSize = size * this.sizeCurve.getPoint(t);

      ctx.save();
      ctx.font = buildCanvasFont({
        fontSize: `${fontSize}px`,
        fontFamily: "RubikMonoOne",
      });
      ctx.fillStyle = color;

      ctx.fillText(number, x, y);
      ctx.restore();
    });
  }

  destroy() {
    super.destroy();
  }
}
