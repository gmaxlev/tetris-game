import {
  getRandomInt,
  Vector2,
  Stream,
  StreamValue,
  Game,
  EventEmitter,
} from "tiny-game-engine";
import { Brick } from "./Brick";
import { tetrominos } from "./tetromino";

export class Figure {
  static COLORS = [
    "#0087A0",
    "#F2CC03",
    "#D22757",
    "#6333B7",
    "#2E62AB",
    "#F98B20",
    "#019585",
  ];

  static EVENTS = {
    DESTROY: Symbol("DESTROY"),
  };

  /**
   * @param {Playground} playground
   * @param {GameMap} gameMap
   */
  constructor(playground, gameMap) {
    this.playground = playground;
    this.gameMap = gameMap;

    this.events = new EventEmitter();

    this.tetrominos = tetrominos[getRandomInt(0, tetrominos.length - 1)];

    this.color = Figure.COLORS[getRandomInt(0, Figure.COLORS.length - 1)];

    this.activeTetrominoIndex = getRandomInt(0, this.tetrominos.length - 1);
    this.activeTetromino = this.tetrominos[this.activeTetrominoIndex];

    const { x, y } = this.genInitialPosition();
    this.position = new Vector2(x, y);

    /** @type {Brick[]} */
    this.bricks = [];

    this.createTetrominoPositions(
      this.activeTetromino,
      this.position.x,
      this.position.y
    ).forEach(([pX, pY]) => {
      this.bricks.push(
        new Brick(this, playground, this.gameMap.getMapCell(pX, pY), this.color)
      );
    });

    this.isFalling = false;

    this.stream = new Stream({
      name: "Figure",
    });
  }

  /**
   * Returns true if the figure cannot be moved
   * @returns {boolean}
   */
  isBlockMoving() {
    return this.isFalling;
  }

  createTetrominoPositions(tetrimino, x, y) {
    const positions = [];
    tetrimino.positions.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col === 1) {
          positions.push([x + colIndex, y + rowIndex]);
        }
      });
    });
    return positions;
  }

  genInitialPosition() {
    return {
      x: getRandomInt(
        -this.activeTetromino.freeSpaces.left,
        this.gameMap.cols -
          this.activeTetromino.size +
          this.activeTetromino.freeSpaces.right
      ),
      y: -this.activeTetromino.freeSpaces.top,
    };
  }

  changePosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  fall() {
    if (this.isBlockMoving()) {
      return;
    }

    const { x, y } = this.getFinishPosition();
    if (y !== this.position.y) {
      this.isFalling = true;
      const positions = this.createTetrominoPositions(
        this.activeTetromino,
        x,
        y
      );

      const fallingStream = new StreamValue({
        fn: (value) => {
          this.bricks.forEach((brick, index) => {
            brick.fall(
              this.gameMap.getMapCell(positions[index][0], positions[index][1]),
              Math.min(100, value) / 100
            );
          });

          if (value >= 100) {
            this.changePosition(x, y);
            this.isFalling = false;
            fallingStream.destroy();
            return;
          }
          return value + Game.dt;
        },
        initialValue: 0,
        name: "Falling Figure",
      });

      this.stream.child(fallingStream);
    }
  }

  getFinishPosition() {
    let yPosition = null;
    for (let y = this.position.y; yPosition === null; y++) {
      if (
        !this.checkTetrominoForFreePlace(
          this.activeTetromino,
          this.position.x,
          y
        )
      ) {
        yPosition = y - 1;
      }
    }
    return {
      x: this.position.x,
      y: yPosition,
    };
  }

  rotateRight() {
    if (this.isBlockMoving()) {
      return;
    }
    if (!this.activeTetromino.tests) {
      return;
    }

    const nextIndex =
      this.activeTetrominoIndex === this.tetrominos.length - 1
        ? 0
        : this.activeTetrominoIndex + 1;

    this.tryChangeTetromino(nextIndex);
  }

  rotateLeft() {
    if (this.isBlockMoving()) {
      return;
    }
    if (!this.activeTetromino.tests) {
      return;
    }

    const nextIndex =
      this.activeTetrominoIndex === 0
        ? this.tetrominos.length - 1
        : this.activeTetrominoIndex - 1;

    this.tryChangeTetromino(nextIndex);
  }

  checkTetrominoForFreePlace(tetromino, x, y) {
    for (let rowIndex = 0; rowIndex < tetromino.positions.length; rowIndex++) {
      const row = tetromino.positions[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        if (row[colIndex] === 0) {
          continue;
        }

        if (!this.gameMap.checkForFreePlace(x + colIndex, y + rowIndex)) {
          return false;
        }
      }
    }
    return true;
  }

  tryChangeTetromino(index) {
    const tetromino = this.tetrominos[index];

    const tests = this.activeTetromino.getTest(
      this.activeTetromino.state,
      tetromino.state
    );

    const x = this.position.x;
    const y = this.position.y;

    let position = null;
    for (let i = 0; i < tests.length; i++) {
      const [xOffset, yOffset] = tests[i];
      const forCheck = [x + xOffset, y + yOffset];
      if (
        this.checkTetrominoForFreePlace(tetromino, forCheck[0], forCheck[1])
      ) {
        position = forCheck;
        break;
      }
    }
    if (!position) {
      return;
    }
    this.replaceTetromino(index, position[0], position[1]);
  }

  replaceTetromino(index, x, y) {
    const tetromino = this.tetrominos[index];

    this.createTetrominoPositions(tetromino, x, y).forEach(
      ([pX, pY], brickIndex) => {
        this.bricks[brickIndex].changeGameMapCell(
          this.gameMap.getMapCell(pX, pY)
        );
      }
    );

    this.activeTetrominoIndex = index;
    this.activeTetromino = tetromino;
    this.changePosition(x, y);
  }

  tryMoveRight() {
    if (this.isBlockMoving()) {
      return;
    }
    for (let i = 0; i < this.bricks.length; i++) {
      if (!this.bricks[i].gameMapCell.checkRightForFree()) {
        return;
      }
    }
    this.bricks.forEach((brick) => brick.tryMoveRight());
    this.changePosition(this.position.x + 1, this.position.y);
  }

  tryMoveLeft() {
    if (this.isBlockMoving()) {
      return;
    }
    for (let i = 0; i < this.bricks.length; i++) {
      if (!this.bricks[i].gameMapCell.checkLeftForFree()) {
        return;
      }
    }
    this.bricks.forEach((brick) => brick.tryMoveLeft());
    this.changePosition(this.position.x - 1, this.position.y);
  }

  tryMoveBottom() {
    if (this.isBlockMoving()) {
      return;
    }
    for (let i = 0; i < this.bricks.length; i++) {
      if (!this.bricks[i].gameMapCell.checkBottomForFree()) {
        return;
      }
    }
    this.bricks.forEach((brick) => brick.tryMoveBottom());
    this.changePosition(this.position.x, this.position.y + 1);
  }

  getAllBricks() {
    return this.bricks;
  }

  isTheEnd() {
    for (let i = 0; i < this.bricks.length; i++) {
      if (!this.bricks[i].gameMapCell.checkBottomForFree()) {
        return true;
      }
    }
    return false;
  }

  destroy() {
    this.stream.destroy();
    this.bricks.forEach((brick) => brick.removeFromFigure());
    this.events.emit(Figure.EVENTS.DESTROY);
    this.events.clear();
  }
}
