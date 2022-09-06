import { Stream, Game } from "tiny-game-engine";

export class KeyMoveController {
  /**
   *
   * @param {Tetris} tetris
   * @param {string} keyCode
   * @param {Function} fn
   */
  constructor(tetris, keyCode, fn) {
    this.tetris = tetris;
    this.keyCode = keyCode;
    this.fn = fn;

    this.times = 0;
    this.passed = 0;

    this.isActive = false;

    this.stream = new Stream({
      fn: () => this.update(),
    });
  }

  update() {
    if (this.tetris.keyboardListener.check(this.keyCode)) {
      this.isActive = true;
      if (!this.times || this.passed >= 80 - 13 * this.times) {
        this.fn();
        this.times += 1;
        this.passed = 0;
        return;
      }
      this.passed += Game.dt;
    } else {
      this.reset();
      this.isActive = false;
    }
  }

  reset() {
    this.passed = 0;
    this.times = 0;
  }

  destroy() {
    this.stream.destroy();
  }
}
