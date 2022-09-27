import { GameMapCell } from "./GameMapCell";

export class GameMap {
  /**
   *
   * @param {Playground} playground
   * @param {number} rows
   * @param {number} cols
   */
  constructor(playground, rows, cols) {
    this.playground = playground;
    this.rows = rows;
    this.cols = cols;
    this.map = this.createMap();
  }

  checkForFreePlace(x, y) {
    const row = this.map[y];
    if (!row) {
      return false;
    }
    const gameMapCell = row[x];
    if (!gameMapCell) {
      return false;
    }
    return gameMapCell.brick === null || gameMapCell.brick.figure !== null;
  }

  /**
   * @returns {number[]}
   */
  getFilledLines() {
    const rows = [];

    rowFor: for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.map[row][col].brick === null) {
          continue rowFor;
        }
        if (col === this.cols - 1) {
          rows.push(row);
        }
      }
    }

    return rows;
  }

  /**
   * @param x
   * @param y
   * @returns {GameMapCell}
   */
  getMapCell(x, y) {
    return this.map[y][x];
  }

  /**
   * @param row
   * @returns {Brick[]}
   */
  getBricksInRow(row) {
    return this.map[row]
      .map((gameMapCell) => gameMapCell.brick)
      .filter((brick) => !!brick);
  }

  createMap() {
    const map = [];
    for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
      const row = [];
      map.push(row);

      for (let colIndex = 0; colIndex < this.cols; colIndex++) {
        let top = null;
        let left = null;

        const cell = new GameMapCell(this, rowIndex, colIndex);

        if (rowIndex !== 0) {
          top = map[rowIndex - 1][colIndex];
          top.bottom = cell;
        }

        if (colIndex !== 0) {
          left = map[rowIndex][colIndex - 1];
          left.right = cell;
        }

        cell.top = top;
        cell.left = left;

        row.push(cell);
      }
    }
    return map;
  }

  destroy() {
    this.map.forEach((row) =>
      row.forEach((gameMapCell) => gameMapCell.destroy())
    );
  }
}
