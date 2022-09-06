import { Stream, StreamDelay, EventEmitter, Game } from "tiny-game-engine";
import { GameMap } from "./GameMap";
import { Figure } from "./Figure";
import { KeyMoveController } from "./KeyMoveController";
// import { Brick } from "../brick/Brick";

export class Playground {
  static EVENTS = {
    MADE_FIGURE: Symbol("MADE_FIGURE"),
    TEST: Symbol("TEST"),
  };

  /**
   * @param {Tetris} tetris
   */
  constructor(tetris) {
    this.events = new EventEmitter();
    this.tetris = tetris;
    this.brickSize = 28;
    this.isRun = false;
    this.gameMap = new GameMap(this, 20, 10);

    window.map = this.gameMap;

    this.moveIntervalTime = 0;
    this.moveInterval = 1000;

    /**
     * The current tetromino that is being controlled
     * @type {Figure|null}
     */
    this.figure = null;

    // The main stream of the game
    this.stream = this.tetris.stream.child(
      new Stream({
        fn: () => this.update(),
      })
    );

    // Add a little delay before starting game :)
    this.stream.child(
      new StreamDelay({
        fn: () => {
          this.isRun = true;
        },
        delay: 1000,
      })
    );

    this.rightController = new KeyMoveController(
      this.tetris,
      "ArrowRight",
      () => {
        if (this.figure && !this.leftController.isActive) {
          this.figure.tryMoveRight();
        }
        this.leftController.reset();
      }
    );

    this.leftController = new KeyMoveController(
      this.tetris,
      "ArrowLeft",
      () => {
        if (this.figure && !this.rightController.isActive) {
          this.figure.tryMoveLeft();
        }
        this.rightController.reset();
      }
    );

    this.bottomController = new KeyMoveController(
      this.tetris,
      "ArrowDown",
      () => {
        if (this.figure) {
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
        if (this.figure) {
          this.figure.rotateRight();
        }
      }
    );

    this.rotateController = this.tetris.keyboardListener.subscribeKeyDown(
      "KeyZ",
      () => {
        if (this.figure) {
          this.figure.rotateLeft();
        }
      }
    );

    this.spaceController = this.tetris.keyboardListener.subscribeKeyDown(
      "Space",
      () => {
        if (this.figure) {
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

  makeFigure() {
    this.figure = new Figure(this, this.gameMap);
    this.events.emit(Playground.EVENTS.MADE_FIGURE, this.figure);

    this.events.emit(Playground.EVENTS.TEST, [
      // new Brick(null, this, this.gameMap.getMapCell(0, 19)),
      // new Brick(null, this, this.gameMap.getMapCell(1, 19)),
      // new Brick(null, this, this.gameMap.getMapCell(2, 19)),
      // new Brick(null, this, this.gameMap.getMapCell(3, 19)),
      // new Brick(null, this, this.gameMap.getMapCell(4, 19)),
      // new Brick(null, this, this.gameMap.getMapCell(5, 19)),
      // new Brick(null, this, this.gameMap.getMapCell(6, 19)),
      // new Brick(null, this, this.gameMap.getMapCell(7, 19)),
      // new Brick(null, this, this.gameMap.getMapCell(8, 19)),
      // new Brick(null, this, this.gameMap.getMapCell(0, 18)),
      // new Brick(null, this, this.gameMap.getMapCell(1, 18)),
      // new Brick(null, this, this.gameMap.getMapCell(2, 18)),
      // new Brick(null, this, this.gameMap.getMapCell(3, 18)),
      // new Brick(null, this, this.gameMap.getMapCell(4, 18)),
      // new Brick(null, this, this.gameMap.getMapCell(5, 18)),
      // new Brick(null, this, this.gameMap.getMapCell(6, 18)),
      // new Brick(null, this, this.gameMap.getMapCell(7, 18)),
      // new Brick(null, this, this.gameMap.getMapCell(8, 18)),
      // new Brick(null, this, this.gameMap.getMapCell(0, 17)),
      // new Brick(null, this, this.gameMap.getMapCell(1, 17)),
      // new Brick(null, this, this.gameMap.getMapCell(2, 17)),
      // new Brick(null, this, this.gameMap.getMapCell(3, 17)),
      // new Brick(null, this, this.gameMap.getMapCell(4, 17)),
      // new Brick(null, this, this.gameMap.getMapCell(5, 17)),
      // new Brick(null, this, this.gameMap.getMapCell(6, 17)),
      // new Brick(null, this, this.gameMap.getMapCell(7, 17)),
      // new Brick(null, this, this.gameMap.getMapCell(8, 17)),
      // new Brick(null, this, this.gameMap.getMapCell(0, 16)),
      // new Brick(null, this, this.gameMap.getMapCell(1, 16)),
      // new Brick(null, this, this.gameMap.getMapCell(2, 16)),
      // new Brick(null, this, this.gameMap.getMapCell(3, 16)),
      // new Brick(null, this, this.gameMap.getMapCell(4, 16)),
      // new Brick(null, this, this.gameMap.getMapCell(5, 16)),
      // new Brick(null, this, this.gameMap.getMapCell(6, 16)),
      // new Brick(null, this, this.gameMap.getMapCell(7, 16)),
      // new Brick(null, this, this.gameMap.getMapCell(8, 17)),
    ]);
  }

  update() {
    if (!this.isRun) {
      return;
    }
    if (!this.figure) {
      this.makeFigure();
    } else if (this.moveIntervalTime >= this.moveInterval) {
      this.moveIntervalTime = 0;
      if (this.figure.isTheEnd()) {
        this.figure.destroy();
        this.figure = null;
        this.makeFigure();
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
