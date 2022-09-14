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
import { BRICK_SIZE, getFallingPosition } from "./BrickGameObject";

export class FallingAnimationGameObject extends GameObjectPure {
  static DISAPPEAR_GRADIENT_TIME = 400;

  static DOTS_ANIMATION_TIME_FROM = 1000;

  static DOTS_ANIMATION_TIME_TO = 4000;

  constructor() {
    super();

    this.animations = [];

    this.stream = new Stream({
      fn: () => this.updateAnimations(),
      start: false,
    });

    Tetris.playground.stream.child(this.stream);
  }

  /**
   * Subscribes on FALLING_START event
   * Adds the animation when the event is emitted
   * @param {Figure} figure
   */
  listenFigure(figure) {
    figure.events.subscribe(Figure.EVENTS.FALLING_START, () => {
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
            const size = getRandomInt(4, 8);
            const angleMoving = getRandomInt(70, 110) * PI_OVER_180;
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
              speed: (figure.finish.position.y - figure.falling.from.row) * 1.6,
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
    });
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

  render(ctx) {
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
          yStartingPosition,
          0,
          yStartingPosition +
            Math.min(...bricks.map((item) => item.fallingHeight))
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
            item.xStartingPosition,
            yStartingPosition,
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
              dot.x - offset * dot.cos,
              dot.y - offset * dot.sin,
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
