import { GameObjectPure, Stream, toRGBA } from "tiny-game-engine";
import { BRICK_SIZE } from "../BrickGameObject";
import { Tetris } from "../../../Tetris";
import { Playground } from "../../Playground";
import { FlyingAnimationBricksGameObject } from "./FlyingAnimationBricksGameObject";
import { PLAYGROUND_MAP_PADDING } from "../PlaygroundGameObject";
import { RotationAnimationGameObject } from "./RotationAnimationGameObject";
import { ZoomAnimationGameObject } from "./ZoomAnimationGameObject";

export class ExplosionAnimationGameObject extends GameObjectPure {
  constructor(width, height, playgroundGameObject) {
    super();

    this.playgroundGameObject = playgroundGameObject;

    this.stream = new Stream({
      fn: () => this.updateStream(),
      start: false,
    });

    Tetris.playground.stream.child(this.stream);

    Tetris.playground.events.subscribe(
      Playground.EVENTS.BEFORE_CLEARING_ROWS,
      (rows) => this.addAnimation(rows)
    );

    this.flyingAnimationBricksGameObject = new FlyingAnimationBricksGameObject(
      width,
      height
    );
    this.flyingAnimationBricksGameObject.subscribe(this);

    this.rotationAnimationGameObject = new RotationAnimationGameObject();
    this.rotationAnimationGameObject.subscribe(this);

    this.zoomAnimationGameObject = new ZoomAnimationGameObject();
    this.zoomAnimationGameObject.subscribe(this);
  }

  addAnimation(rowsList) {
    const rows = rowsList.map((row) => ({
      row,
      bricks: Tetris.playground.gameMap.getBricksInRow(row),
    }));

    this.zoomAnimationGameObject.add(
      rows.reduce(
        (array, { row, bricks }) =>
          array.concat(
            bricks.map((brick, index) => ({
              row,
              col: index,
              delay: RotationAnimationGameObject.ROTATION_TIME,
              color: brick.color,
            }))
          ),
        []
      )
    );

    this.rotationAnimationGameObject.add(
      rows.map((row) => ({
        row: row.row,
        bricks: row.bricks.map((brick) => ({
          color: brick.color,
        })),
      }))
    );

    const { x: playgroundX, y: playgroundY } =
      this.playgroundGameObject.getPosition();

    this.flyingAnimationBricksGameObject.add(
      rows.reduce(
        (array, { row, bricks }) =>
          array.concat(
            bricks.map((brick, index) => ({
              x: index * BRICK_SIZE + playgroundX + PLAYGROUND_MAP_PADDING,
              y: row * BRICK_SIZE + playgroundY + PLAYGROUND_MAP_PADDING,
              color: toRGBA(brick.color),
              delay: RotationAnimationGameObject.ROTATION_TIME,
            }))
          ),
        []
      )
    );
  }

  render(ctx, offsetX, offsetY) {
    this.draw(ctx, this.zoomAnimationGameObject, offsetX, offsetY);
    this.draw(ctx, this.flyingAnimationBricksGameObject, offsetX, offsetY);
    this.draw(ctx, this.rotationAnimationGameObject, offsetX, offsetY);
  }
}
