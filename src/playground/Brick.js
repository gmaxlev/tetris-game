import { EventEmitter } from "tiny-game-engine";

export class Brick {
  static EVENTS = {
    MOVE: Symbol("MOVE"),
    COLLISION: Symbol("COLLISION"),
    DESTROY: Symbol("DESTROY"),
    SMOOTH_MOVING_START: Symbol("SMOOTH_MOVING_START"),
    SMOOTH_MOVING_STOP: Symbol("SMOOTH_MOVING_STOP"),
    FALLING_START: Symbol("FALLING"),
    FALLING_STOP: Symbol("FALLING"),
  };

  /**
   * @param {Figure} figure
   * @param {Playground} playground
   * @param {GameMapCell} gameMapCell
   * @param color
   */
  constructor(figure, playground, gameMapCell, color) {
    this.events = new EventEmitter();
    this.figure = figure;
    this.playground = playground;
    this.gameMapCell = gameMapCell;
    this.color = color;
    /** @type {GameMapCell} */
    this.falling = null;
    /** @type {GameMapCell} */
    this.smoothMoving = null;
    this.gameMapCell.setBrick(this);
  }

  /** @param {GameMapCell} gameMapCell */
  fallStart(gameMapCell) {
    this.falling = gameMapCell;
    this.events.emit(Brick.EVENTS.FALLING_START);
  }

  fallStop() {
    this.changeGameMapCell(this.falling);
    this.events.emit(Brick.EVENTS.FALLING_STOP);
    this.falling = null;
  }

  /** @param {GameMapCell} gameMapCell */
  smoothMoveStart(gameMapCell) {
    this.smoothMoving = gameMapCell;
    this.events.emit(Brick.EVENTS.SMOOTH_MOVING_START);
  }

  smoothMoveStop() {
    this.changeGameMapCell(this.smoothMoving);
    this.smoothMoving = null;
    this.events.emit(Brick.EVENTS.SMOOTH_MOVING_STOP);
  }

  /**
   * Changes the current position
   * @param {GameMapCell} gameMapCell
   */
  changeGameMapCell(gameMapCell) {
    if (this.gameMapCell.brick === this) {
      this.gameMapCell.removeBrick();
    }

    this.gameMapCell = gameMapCell;
    this.gameMapCell.setBrick(this);

    this.events.emit(Brick.EVENTS.MOVE);
  }

  /**
   * Called when a neighbour brick changes the position
   */
  collision() {
    this.events.emit(Brick.EVENTS.COLLISION);
  }

  tryMoveRight() {
    const cell = this.gameMapCell.checkRightForFree();
    if (cell) {
      this.changeGameMapCell(cell);
      return true;
    }
    return false;
  }

  tryMoveLeft() {
    const cell = this.gameMapCell.checkLeftForFree();
    if (cell) {
      this.changeGameMapCell(cell);
      return true;
    }
    return false;
  }

  tryMoveBottom() {
    const cell = this.gameMapCell.checkBottomForFree();
    if (cell) {
      this.changeGameMapCell(cell);
      return true;
    }
    return false;
  }

  removeFromFigure() {
    this.figure = null;
  }

  destroy() {
    this.gameMapCell.removeBrick();
    this.events.emit(Brick.EVENTS.DESTROY);
    this.events.clear();
  }
}
