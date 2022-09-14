import { Stream, StreamDelay, EventEmitter, Game } from "tiny-game-engine";
import { GameMap } from "./GameMap";
import { Figure } from "./Figure";
import { KeyMoveController } from "./KeyMoveController";

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
    this.gameMap = new GameMap(this, 20, 10);

    this.isRun = false;

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
    if (this.figure) {
      this.figure.destroy();
      this.figure = null;
    }
    this.figure = new Figure(this, this.gameMap);
    this.stream.child(this.figure.stream);
    this.events.emit(Playground.EVENTS.MADE_FIGURE, this.figure);
  }

  update() {
    if (!this.isRun) {
      return;
    }

    if (!this.figure) {
      this.makeFigure();
      return;
    }

    if (this.figure.isBlockMoving()) {
      this.moveIntervalTime = this.moveInterval;
      return;
    }

    if (this.moveIntervalTime >= this.moveInterval) {
      this.moveIntervalTime = 0;
      if (this.figure.isTheEnd()) {
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
