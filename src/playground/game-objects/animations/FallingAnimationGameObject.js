import {
  GameObjectPure,
  Stream,
  Game,
  getRandomInt,
  PI_OVER_180,
  toRGBA,
  alpha,
  getRandomElement,
} from "tiny-game-engine";
import { Figure } from "../../Figure";
import { Tetris } from "../../../Tetris";
import {
  BRICK_LIGHT_HEIGHT,
  BRICK_SIZE,
  BrickGameObject,
} from "../BrickGameObject";
import { Playground } from "../../Playground";
import { PLAYGROUND_MAP_PADDING } from "../PlaygroundGameObject";
import { BRICKS_COLORS } from "../../../constants";

/**
 * Falling Animation
 * Shows when bricks are falling
 */
export class FallingAnimationGameObject extends GameObjectPure {
  static DISAPPEAR_GRADIENT_TIME = 400;

  static DOTS_ANIMATION_TIME_FROM = 500;

  static DOTS_ANIMATION_TIME_TO = 1500;

  static PROBABILITY_DOTS_APPEARING = 0.15;

  static DOT_SIZE_FROM = 5;

  static DOT_SIZE_TO = 8;

  static DOT_ANGLE_MOVING_FROM = 60;

  static DOT_ANGLE_MOVING_TO = 120;

  constructor() {
    super();

    this.animations = [];

    this.stream = new Stream({
      fn: () => this.updateAnimations(),
      start: false,
      name: "FallingAnimationGameObject",
    });

    Tetris.playground.events.subscribe(
      Playground.EVENTS.MADE_FIGURE,
      (figure) => {
        figure.events.subscribeOnce(Figure.EVENTS.FALLING_START, () => {
          this.addAnimation(figure);
        });
      }
    );

    Tetris.playground.stream.child(this.stream);
  }

  /**
   * Subscribes on FALLING_START event
   * Adds the animation when the event is emitted
   * @param {Figure} figure
   */
  addAnimation(figure) {
    const yStartingPosition =
      figure.falling.from.y * BRICK_SIZE + PLAYGROUND_MAP_PADDING;
    const yFinishPosition =
      figure.finish.position.y * BRICK_SIZE + PLAYGROUND_MAP_PADDING;

    // Get positions of the uppermost bricks into array
    const bricks = figure.getTopBricks().map((brick) => ({
      xStartingPosition:
        brick.gameMapCell.col * BRICK_SIZE + PLAYGROUND_MAP_PADDING,
      fallingHeight: 0,
      initialGameMapCell: brick.gameMapCell,
      finishGameMapCell: brick.falling,
    }));

    // Random generating of moving dots
    const dots = [];
    bricks.forEach((brick) => {
      for (let y = yStartingPosition; y <= yFinishPosition; y += BRICK_SIZE) {
        if (
          Math.random() <
          1 - FallingAnimationGameObject.PROBABILITY_DOTS_APPEARING
        ) {
          continue;
        }
        const size = getRandomInt(
          FallingAnimationGameObject.DOT_SIZE_FROM,
          FallingAnimationGameObject.DOT_SIZE_TO
        );
        const angleMoving =
          getRandomInt(
            FallingAnimationGameObject.DOT_ANGLE_MOVING_FROM,
            FallingAnimationGameObject.DOT_ANGLE_MOVING_TO
          ) * PI_OVER_180;

        dots.push({
          x:
            brick.xStartingPosition +
            (BRICK_SIZE - size) / 2 +
            getRandomInt(-size, size),
          y: y + (BRICK_SIZE - size) / 2 + getRandomInt(-size, size),
          color: toRGBA(getRandomElement(BRICKS_COLORS)),
          time: getRandomInt(
            FallingAnimationGameObject.DOTS_ANIMATION_TIME_FROM,
            FallingAnimationGameObject.DOTS_ANIMATION_TIME_TO
          ),
          speed: (figure.finish.position.y - figure.falling.from.y) * 2,
          sin: Math.sin(angleMoving),
          cos: Math.cos(angleMoving),
          progress: 0,
          size,
          brick,
        });
      }
    });

    this.animations.push({
      gradientColors: {
        from: toRGBA(alpha(figure.color, 0)),
        to: figure.color,
      },
      progress: 0,
      bricks,
      yStartingPosition,
      dots,
    });
    this.markForUpdate(GameObjectPure.MARKS.SINGLE);
    this.stream.continue();
  }

  updateAnimations() {
    this.animations = this.animations.filter((item) => {
      item.dots = item.dots.filter((dot) => dot.progress / dot.time <= 1);
      const progress =
        item.progress /
          (Figure.FALLING_SPEED +
            FallingAnimationGameObject.DISAPPEAR_GRADIENT_TIME) <=
        1;
      return item.dots.length || progress;
    });

    if (this.animations.length === 0) {
      this.stream.stop();
      Game.jobs.afterUpdate.addOnce(() => {
        this.clearMarksForUpdate();
      });
      return;
    }

    this.animations.forEach((item) => {
      item.progress += Game.dt;
      item.dots.forEach((dot) => {
        dot.progress += Game.dt;
      });
    });
  }

  render(ctx, offsetX, offsetY) {
    this.animations.forEach(
      ({ yStartingPosition, bricks, dots, gradientColors, progress }) => {
        ctx.save();

        // Make the gradient from the starting position
        // to the nearest top bricks
        const gradient = ctx.createLinearGradient(
          0,
          yStartingPosition + offsetY,
          0,
          yStartingPosition +
            Math.min(...bricks.map((item) => item.fallingHeight)) +
            offsetY -
            BRICK_LIGHT_HEIGHT
        );

        // The progress of disappearing gradient
        const disappearingGradient = Math.max(
          0,
          (progress - Figure.FALLING_SPEED) /
            FallingAnimationGameObject.DISAPPEAR_GRADIENT_TIME
        );

        gradient.addColorStop(0, gradientColors.from);
        gradient.addColorStop(
          1,
          toRGBA(alpha(gradientColors.to, 1 - disappearingGradient))
        );

        const fallingProgress = Math.min(1, progress / Figure.FALLING_SPEED);

        bricks.forEach((item) => {
          const { y } = BrickGameObject.lerpBricksPosition(
            item.initialGameMapCell,
            item.finishGameMapCell,
            fallingProgress
          );

          item.fallingHeight = y - yStartingPosition + 20;

          ctx.fillStyle = gradient;

          ctx.fillRect(
            item.xStartingPosition + offsetX,
            yStartingPosition + offsetY,
            BRICK_SIZE,
            item.fallingHeight
          );
        });

        dots.forEach((dot) => {
          // Skip a dot if it is positioned outside the gradient
          if (dot.y <= yStartingPosition + dot.brick.fallingHeight - dot.size) {
            ctx.save();
            ctx.fillStyle = dot.color;
            ctx.globalAlpha = 1 - Math.min(1, dot.progress / dot.time);
            const offset = dot.progress * (dot.speed / 1000);
            ctx.fillRect(
              dot.x - offset * dot.cos + offsetX,
              dot.y - offset * dot.sin + offsetY,
              dot.size,
              dot.size
            );
            ctx.restore();
          }
        });

        ctx.restore();
      }
    );
  }

  destroy() {
    this.stream.destroy();
    super.destroy();
  }
}
