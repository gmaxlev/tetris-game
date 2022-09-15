import {
  GameObjectPure,
  Stream,
  Game,
  getRandomInt,
  Color,
  PI_OVER_180,
} from "tiny-game-engine";
import { Figure } from "./Figure";
import { Tetris } from "../tetris/Tetris";
import {
  BRICK_LIGHT_HEIGHT,
  BRICK_SIZE,
  getFallingPosition,
} from "./BrickGameObject";
import { Playground } from "./Playground";

export class FallingAnimationGameObject extends GameObjectPure {
  static DISAPPEAR_GRADIENT_TIME = 400;

  static DOTS_ANIMATION_TIME_FROM = 1000;

  static DOTS_ANIMATION_TIME_TO = 2000;

  constructor() {
    super();

    this.animations = [];

    this.stream = new Stream({
      fn: () => this.updateAnimations(),
      start: false,
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
    const yStartingPosition = figure.falling.from.row * BRICK_SIZE + 20;
    const yFinishPosition = figure.finish.position.y * BRICK_SIZE;

    const bricks = figure.getTopBricks().map((brick) => ({
      brick,
      // Save the starting positions separately
      // because it can be changed during animation
      xStartingPosition: brick.gameMapCell.col * BRICK_SIZE + 20,
      fallingHeight: 0,
    }));

    // Random generating of moving dots
    const dots = [];
    bricks.forEach((brick) => {
      for (let y = yStartingPosition; y <= yFinishPosition; y += BRICK_SIZE) {
        if (Math.random() > 0.8) {
          const size = getRandomInt(5, 8);
          const angleMoving = getRandomInt(60, 120) * PI_OVER_180;
          dots.push({
            x:
              brick.brick.gameMapCell.col * BRICK_SIZE +
              BRICK_SIZE / 2 -
              size / 2 +
              20 +
              getRandomInt(-size, size),
            y: y + BRICK_SIZE / 2 - size / 2 + getRandomInt(-size, size),
            color: Figure.COLORS[getRandomInt(0, Figure.COLORS.length - 1)],
            time: getRandomInt(
              FallingAnimationGameObject.DOTS_ANIMATION_TIME_FROM,
              FallingAnimationGameObject.DOTS_ANIMATION_TIME_TO
            ),
            progress: 0,
            speed: (figure.finish.position.y - figure.falling.from.row) * 2,
            sin: Math.sin(angleMoving),
            cos: Math.cos(angleMoving),
            size,
            brick,
          });
        }
      }
    });

    this.animations.push({
      gradientFadeProgress: 0,
      gradientColors: {
        from: new Color(figure.color).setAlpha(0),
        to: new Color(figure.color),
      },
      figure,
      bricks,
      yStartingPosition,
      dots,
    });
    this.markForUpdate(figure);
    this.stream.continue();
  }

  updateAnimations() {
    // Removing animations when the gradient or the dots have disappeared
    this.animations = this.animations.filter((item) => {
      item.dots = item.dots.filter((dot) => dot.progress / dot.time <= 1);
      const disappearingGradient =
        item.gradientFadeProgress /
          (Figure.FALLING_SPEED +
            FallingAnimationGameObject.DISAPPEAR_GRADIENT_TIME) <=
        1;
      return disappearingGradient || item.dots.length;
    });

    // Stop the stream and the updating the game objects
    // if there is not the animations
    if (this.animations.length === 0) {
      this.clearMarksForUpdate();
      this.stream.stop();
      return;
    }

    this.animations.forEach((item) => {
      item.gradientFadeProgress += Game.dt;
      item.dots.forEach((dot) => {
        dot.progress += Game.dt;
      });
    });
  }

  render(ctx, offsetX, offsetY) {
    this.animations.forEach(
      ({
        figure,
        yStartingPosition,
        gradientFadeProgress,
        bricks,
        dots,
        gradientColors,
      }) => {
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
          (gradientFadeProgress - Figure.FALLING_SPEED) /
            FallingAnimationGameObject.DISAPPEAR_GRADIENT_TIME
        );

        gradient.addColorStop(0, gradientColors.from);
        gradient.addColorStop(
          1,
          gradientColors.to.setAlpha(1 - disappearingGradient)
        );

        bricks.forEach((item) => {
          /** @type {Brick} */
          const brick = item.brick;

          const { y } = getFallingPosition(
            brick.gameMapCell,
            brick.falling,
            figure.falling.progress
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
          // Skip a dot when it is positioned outside the gradient
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
}
