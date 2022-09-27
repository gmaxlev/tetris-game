export class GameMapCell {
  /**
   * @param {GameMap} gameMap
   * @param {number} row
   * @param {number} col
   */
  constructor(gameMap, row, col) {
    /** @type {GameMap} */
    this.gameMap = gameMap;
    /** @type {number} */
    this.row = row;
    /** @type {number} */
    this.col = col;

    /** @type {GameMapCell} */
    this.top = null;
    /** @type {GameMapCell} */
    this.bottom = null;
    /** @type {GameMapCell} */
    this.right = null;
    /** @type {GameMapCell} */
    this.left = null;

    /** @type {Brick} */
    this.brick = null;
  }

  collision() {
    if (this.top && this.top.brick) {
      this.top.brick.collision();
    }

    if (this.bottom && this.bottom.brick) {
      this.bottom.brick.collision();
    }

    if (this.left && this.left.brick) {
      this.left.brick.collision();
    }

    if (this.right && this.right.brick) {
      this.right.brick.collision();
    }
  }

  /** @param {Brick} brick */
  setBrick(brick) {
    this.brick = brick;
    this.collision();
  }

  removeBrick() {
    this.brick = null;
    this.collision();
  }

  checkTopForFree() {
    if (
      this.top !== null &&
      (this.top.brick === null || (this.top.brick && this.top.brick.figure))
    ) {
      return this.top;
    }
    return false;
  }

  checkBottomForFree() {
    if (
      this.bottom !== null &&
      (this.bottom.brick === null ||
        (this.bottom.brick && this.bottom.brick.figure))
    ) {
      return this.bottom;
    }
    return false;
  }

  checkRightForFree() {
    if (
      this.right !== null &&
      (this.right.brick === null ||
        (this.right.brick && this.right.brick.figure))
    ) {
      return this.right;
    }
    return false;
  }

  checkLeftForFree() {
    if (
      this.left !== null &&
      (this.left.brick === null || (this.left.brick && this.left.brick.figure))
    ) {
      return this.left;
    }
    return false;
  }

  destroy() {}
}
