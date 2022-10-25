import { GameObjectPure, Stream, Jobs } from "tiny-game-engine";
import { Playground } from "../../Playground";
import { FlyingAnimationBricksGameObject } from "./FlyingAnimationBricksGameObject";
import { RotationAnimationGameObject } from "./RotationAnimationGameObject";
import { ZoomAnimationGameObject } from "./ZoomAnimationGameObject";
import { BRICK_LIGHT_HEIGHT, BRICK_SIZE } from "../BrickGameObject";

export class ExplosionAnimationGameObject extends GameObjectPure {
  /**
   * @param {Playground} playground
   * @param width
   * @param height
   * @param playgroundGameObject
   */
  constructor(playground, width, height, playgroundGameObject) {
    super();

    this.playground = playground;

    this.playgroundGameObject = playgroundGameObject;

    this.stream = new Stream({
      fn: () => this.updateStream(),
      start: false,
    });

    this.playground.stream.child(this.stream);

    this.destroyJobs = new Jobs();
    this.destroyJobs.add([
      this.playground.events.subscribe(
        Playground.EVENTS.BEFORE_CLEARING_ROWS,
        (rows) => this.addAnimation(rows)
      ),
    ]);

    this.flyingAnimationBricksGameObject = new FlyingAnimationBricksGameObject(
      this.playground,
      width,
      height
    );
    this.flyingAnimationBricksGameObject.subscribe(this);

    this.rotationAnimationGameObject = new RotationAnimationGameObject(
      this.playground
    );
    this.rotationAnimationGameObject.subscribe(this);

    this.zoomAnimationGameObject = new ZoomAnimationGameObject(this.playground);
    this.zoomAnimationGameObject.subscribe(this);
  }

  /**
   * Adds animations
   * @param {number[]} rowsList
   */
  addAnimation(rowsList) {
    const bricks = rowsList.reduce(
      (previousValue, currentValue) =>
        previousValue.concat(
          this.playground.gameMap.getBricksInRow(currentValue)
        ),
      []
    );

    this.rotationAnimationGameObject.add(
      bricks.map((brick) => {
        const { x, y } = brick.gameObject.getAbsolutePosition();
        return {
          x: x + BRICK_SIZE / 2,
          y: y + BRICK_SIZE / 2 + BRICK_LIGHT_HEIGHT,
          color: brick.color,
        };
      })
    );

    this.zoomAnimationGameObject.add(
      bricks.map((brick) => {
        const { x, y } = brick.gameObject.getAbsolutePosition();
        return {
          x: x + BRICK_SIZE / 2,
          y: y + BRICK_SIZE / 2 + BRICK_LIGHT_HEIGHT,
          delay: RotationAnimationGameObject.ROTATION_TIME,
          color: brick.color,
        };
      })
    );

    this.flyingAnimationBricksGameObject.add(
      bricks.map((brick) => {
        const { x, y } = brick.gameObject.getAbsolutePosition();
        return {
          x: x + BRICK_SIZE / 2,
          y: y + BRICK_SIZE / 2 + BRICK_LIGHT_HEIGHT,
          delay: RotationAnimationGameObject.ROTATION_TIME,
          color: brick.color,
        };
      })
    );
  }

  render(ctx, offsetX, offsetY) {
    this.draw(ctx, this.zoomAnimationGameObject, offsetX, offsetY);
    this.draw(ctx, this.flyingAnimationBricksGameObject, offsetX, offsetY);
    this.draw(ctx, this.rotationAnimationGameObject, offsetX, offsetY);
  }

  destroy() {
    this.destroyJobs.run();
    this.stream.destroy();
    this.flyingAnimationBricksGameObject.destroy();
    this.zoomAnimationGameObject.destroy();
    this.rotationAnimationGameObject.destroy();
    super.destroy();
  }
}
