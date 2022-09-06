import { EventEmitter } from "tiny-game-engine";

export class Brick {
  static EVENTS = {
    MOVE: Symbol("move"),
  };

  /**
   *
   * @param {Figure} figure
   * @param {Playground} playground
   * @param {GameMapCell} gameMapCell
   */
  constructor(figure, playground, gameMapCell) {
    this.figure = figure;
    this.playground = playground;
    this.gameMapCell = gameMapCell;
    this.gameMapCell.setBrick(this);
    this.events = new EventEmitter();
  }

  fall(x, y) {
    console.log("fall", x, y);
  }

  changeGameMapCell(gameMapCell) {
    if (this.gameMapCell.brick === this) {
      this.gameMapCell.removeBrick();
    }

    this.gameMapCell = gameMapCell;
    this.gameMapCell.setBrick(this);
    this.events.emit(Brick.EVENTS.MOVE);
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
