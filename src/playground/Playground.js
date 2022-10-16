import {
  Stream,
  StreamDelay,
  EventEmitter,
  Game,
  StreamValue,
  createArrayFrom,
} from "tiny-game-engine";
import { GameMap } from "./GameMap";
import { Figure } from "./Figure";
import { KeyMoveController } from "./KeyMoveController";
import { RotationAnimationGameObject } from "./game-objects/animations/RotationAnimationGameObject";

export class Playground {
  static EVENTS = {
    MADE_FIGURE: Symbol("MADE_FIGURE"),
    TEST: Symbol("TEST"),
    BEFORE_CLEARING_ROWS: Symbol("BEFORE_CLEARING_ROWS"),
    UPDATE_LEVEL: Symbol("UPDATE_LEVEL"),
    UPDATE_SCORE: Symbol("UPDATE_SCORE"),
  };

  static FALLING_SPEED = 100;

  /**
   * @param {Tetris} tetris
   */
  constructor(tetris) {
    this.events = new EventEmitter();
    this.tetris = tetris;
    this.gameMap = new GameMap(this, 20, 10);

    this.isRun = false;

    this.moveIntervalTime = 0;
    this.moveInterval = 1000;

    this.queue = createArrayFrom(3).map(() => new Figure(this, this.gameMap));

    this.destroyedRows = 0;

    this.level = 1;

    /**
     * The current tetrominos that is being controlled
     * @type {Figure|null}
     */
    this.figure = null;

    this.falling = {
      isActive: false,
      progress: 0,
    };

    /**
     *
     * @type {Brick[]}
     */
    this.bricks = [];

    // The main stream of the game
    this.stream = this.tetris.stream.child(
      new Stream({
        fn: () => this.update(),
        name: "Playground Root",
      })
    );

    // Add a little delay before starting game :)
    this.stream.child(
      new StreamDelay({
        fn: (stream) => {
          this.isRun = true;
          stream.destroy();
        },
        delay: 1000,
        name: "Playground Delay",
      })
    );

    this.rightController = new KeyMoveController(
      this.tetris,
      "ArrowRight",
      () => {
        if (
          this.figure &&
          !this.leftController.isActive &&
          !this.isBlockMoving()
        ) {
          this.figure.tryMoveRight();
        }
        this.leftController.reset();
      }
    );

    this.leftController = new KeyMoveController(
      this.tetris,
      "ArrowLeft",
      () => {
        if (
          this.figure &&
          !this.rightController.isActive &&
          !this.isBlockMoving()
        ) {
          this.figure.tryMoveLeft();
        }
        this.rightController.reset();
      }
    );

    this.bottomController = new KeyMoveController(
      this.tetris,
      "ArrowDown",
      () => {
        if (this.figure && !this.isBlockMoving()) {
          this.figure.tryMoveBottom();
          if (!this.figure.isTheEnd()) {
            this.moveIntervalTime = 0;
          }
        }
      }
    );

    this.rotateController = this.tetris.keyboardListener.subscribeKeyDown(
      "ArrowUp",
      () => {
        if (this.figure && !this.isBlockMoving()) {
          this.figure.rotateRight();
        }
      }
    );

    this.rotateController = this.tetris.keyboardListener.subscribeKeyDown(
      "KeyZ",
      () => {
        if (this.figure && !this.isBlockMoving()) {
          this.figure.rotateLeft();
        }
      }
    );

    this.spaceController = this.tetris.keyboardListener.subscribeKeyDown(
      "Space",
      () => {
        if (this.figure && !this.isBlockMoving()) {
          this.figure.fall();
        }
      }
    );

    this.stream.child([
      this.rightController.stream,
      this.leftController.stream,
      this.bottomController.stream,
    ]);
  }

  isBlockMoving() {
    return this.falling.isActive;
  }

  makeFigure() {
    if (this.figure) {
      this.figure.destroy();
      this.figure = null;
    }
    this.figure = this.queue.shift();
    this.figure.activate();
    this.bricks = this.bricks.concat(this.figure.getAllBricks());
    this.stream.child(this.figure.stream);

    this.figure.events.subscribeOnce(Figure.EVENTS.FALLING_STOP, () => {
      const filledRows = this.gameMap.getFilledLines();
      if (filledRows.length) {
        this.clearRows(filledRows);
      } else {
        this.makeFigure();
      }
    });

    this.queue.push(new Figure(this, this.gameMap));

    this.events.emit(Playground.EVENTS.MADE_FIGURE, this.figure);
  }

  updateLevel() {
    const level = 1 + Math.floor(this.destroyedRows / 10);
    if (level !== this.level) {
      this.moveInterval = Math.max(0, 1000 - 50 * this.level);
      this.level = level;
      this.events.emit(Playground.EVENTS.UPDATE_LEVEL, this.level);
    }
  }

  /**
   *
   * @param {number[]} lines
   */
  calculateScores(lines) {
    const bricks = lines.reduce(
      (previousValue, currentValue) =>
        previousValue.concat(this.gameMap.getBricksInRow(currentValue)),
      []
    );

    const brickToCollectionMap = new Map();

    let collections = [];

    const check = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];

    for (let i = 0; i < bricks.length; i++) {
      /** @type {Brick} */
      const brick = bricks[i];

      const { row, col } = brick.gameMapCell;

      let existCollections = [];

      for (let iCheck = 0; iCheck < check.length; iCheck++) {
        const [colOffset, rowOffset] = check[iCheck];

        const checkBrick = this.gameMap.getMapCell(
          col + colOffset,
          row + rowOffset
        )?.brick;

        if (!checkBrick || checkBrick.color !== brick.color) {
          continue;
        }

        const collection = brickToCollectionMap.get(checkBrick);

        if (collection) {
          existCollections.push(collection);
        }
      }

      existCollections = [...new Set(existCollections)];

      if (existCollections.length) {
        // eslint-disable-next-line no-loop-func
        existCollections.forEach((collection) => {
          collections = collections.filter((item) => item !== collection);
        });

        const joinedCollection = existCollections.reduce(
          (newCollection, currentCollection) =>
            newCollection.concat(currentCollection),
          [brick]
        );

        joinedCollection.forEach((item) => {
          brickToCollectionMap.set(item, joinedCollection);
        });

        collections.push(joinedCollection);
      } else {
        const newCollection = [brick];
        brickToCollectionMap.set(brick, newCollection);
        collections.push(newCollection);
      }
    }

    let scores = 0;

    collections = collections.map((collection) => {
      const rows = [];
      const cols = [];

      collection.forEach((brick) => {
        rows.push(brick.gameMapCell.row);
        cols.push(brick.gameMapCell.col);
      });
      scores += collection.length * 5;

      return {
        width: Math.max(...cols) - Math.min(...cols) + 1,
        height: Math.max(...rows) - Math.min(...rows) + 1,
        x: Math.min(...cols),
        y: Math.min(...rows),
        scores: collection.length * 5,
        color: collection[0].color,
      };
    });

    return {
      scores,
      collections,
    };
  }

  /**
   * @param {number[]} lines
   * @returns {boolean}
   */
  clearRows(lines) {
    const scores = this.calculateScores(lines);

    this.events.emit(Playground.EVENTS.BEFORE_CLEARING_ROWS, lines);

    this.destroyedRows += lines.length;

    this.figure.destroy();
    this.figure = null;

    this.stream.child(
      new StreamDelay({
        fn: (stream) => {
          this.events.emit(Playground.EVENTS.UPDATE_SCORE, scores);
          stream.destroy();
        },
        delay: RotationAnimationGameObject.ROTATION_TIME,
      })
    );

    lines
      .reduce(
        (prev, value) => prev.concat(this.gameMap.getBricksInRow(value)),
        []
      )
      .forEach((brick) => {
        this.bricks = this.bricks.filter((item) => item !== brick);
        brick.destroy();
      });

    /** @type {Brick[]} */
    const animatedBricks = [];
    for (let row = this.gameMap.rows - 1, offset = 0; row >= 0; row--) {
      const lineIndex = lines.indexOf(row);
      if (lineIndex !== -1) {
        offset += 1;
        continue;
      }
      if (offset === 0) {
        continue;
      }
      this.gameMap.getBricksInRow(row).forEach((brick) => {
        brick.smoothMoveStart(
          this.gameMap.getMapCell(
            brick.gameMapCell.col,
            brick.gameMapCell.row + offset
          )
        );
        animatedBricks.push(brick);
      });
    }

    this.updateLevel();

    this.falling.isActive = true;
    this.falling.progress = false;

    this.stream.child(
      new StreamValue({
        fn: (value, stream) => {
          this.falling.progress = Math.max(
            0,
            Math.min(
              1,
              (value - RotationAnimationGameObject.ROTATION_TIME) /
                Playground.FALLING_SPEED
            )
          );
          if (this.falling.progress === 1) {
            this.falling.isActive = false;
            this.falling.progress = 0;
            animatedBricks.forEach((brick) => brick.smoothMoveStop());
            stream.destroy();
          }
          return value + Game.dt;
        },
        initialValue: 0,
        name: "FallingStream",
      })
    );
  }

  update() {
    if (!this.isRun) {
      return;
    }

    if (this.falling.isActive) {
      return;
    }

    if (!this.figure) {
      this.makeFigure();
    }

    if (this.figure.isBlockMoving()) {
      this.moveIntervalTime = this.moveInterval;
      return;
    }

    if (this.moveIntervalTime >= this.moveInterval) {
      this.moveIntervalTime = 0;
      if (this.figure.isTheEnd()) {
        const filledRows = this.gameMap.getFilledLines();
        if (filledRows.length) {
          this.clearRows(filledRows);
        } else {
          this.makeFigure();
        }
      } else {
        this.figure.tryMoveBottom();
      }
    } else {
      this.moveIntervalTime += Game.dt;
    }
  }

  destroy() {
    this.stream.destroy();
    this.gameMap.destroy();
    this.events.clear();
    this.leftController.destroy();
    this.rightController.destroy();
    this.bottomController.destroy();
    if (this.figure) {
      this.figure.destroy();
    }
  }
}
