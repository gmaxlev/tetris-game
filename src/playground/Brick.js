import { EventEmitter } from "tiny-game-engine";

export class Brick {
  static EVENTS = {
    MOVE: Symbol("MOVE"),
    FALLING_START: Symbol("FALLING_START"),
    FALLING_END: Symbol("FALLING_END"),
    COLLISION: Symbol("COLLISION"),
  };

  /**
   * @param {Figure} figure
   * @param {Playground} playground
   * @param {GameMapCell} gameMapCell
   * @param {string} color
   */
  constructor(figure, playground, gameMapCell, color) {
    this.figure = figure;
    this.playground = playground;
    this.gameMapCell = gameMapCell;
    this.color = color;
    this.events = new EventEmitter();
    this.falling = {
      isActive: false,
      from: null,
      to: null,
      progress: 0,
    };
    this.gameMapCell.setBrick(this);
  }

  /**
   * Called while falling
   * @param {GameMapCell} gameMapCell
   * @param {number} progress
   */
  fall(gameMapCell, progress) {
    if (progress === 0) {
      this.falling.isActive = true;
      this.falling.from = this.gameMapCell;
      this.falling.to = gameMapCell;
      this.events.emit(Brick.EVENTS.FALLING_START);
    } else if (progress === 1) {
      this.falling.isActive = false;
      this.events.emit(Brick.EVENTS.FALLING_END);
      this.changeGameMapCell(gameMapCell);
    }
    this.falling.progress = progress;
  }

  /**
   * Changes the current map position
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
    }
  }

  tryMoveLeft() {
    const cell = this.gameMapCell.checkLeftForFree();
    if (cell) {
      this.changeGameMapCell(cell);
    }
  }

  tryMoveBottom() {
    const cell = this.gameMapCell.checkBottomForFree();
    if (cell) {
      this.changeGameMapCell(cell);
    }
  }

  removeFromFigure() {
    this.figure = null;
  }

  destroy() {
    this.events.clear();
  }
}
