export class Tetromino {
  constructor(tetromino, state, tests) {
    this.freeSpaces = this.getFreeSpaces(tetromino);
    this.size = this.getSize(tetromino);
    this.positions = tetromino;
    this.blocksCount = this._getBlocksCount();
    this.state = state;
    this.tests = tests;
    this.pureWidth = this.size - this.freeSpaces.left - this.freeSpaces.right;
    this.pureHeight = this.size - this.freeSpaces.top - this.freeSpaces.bottom;
  }

  getTest(from, to) {
    return this.tests
      .find((test) => test[0][0] === from && test[0][1] === to)
      .filter((item, index) => index !== 0);
  }

  getSize(tetromino) {
    return tetromino.length;
  }

  _getBlocksCount() {
    let count = 0;
    this.positions.forEach((row) => {
      row.forEach((cell) => {
        if (cell === 1) {
          count += 1;
        }
      });
    });
    return count;
  }

  getFreeSpaces(tetromino) {
    const size = tetromino.length;

    let top = 0;
    let bottom = 0;
    let left = 0;
    let right = 0;

    for (let i = 0; i < size; i++) {
      if (tetromino[i].every((cell) => cell === 0)) {
        top += 1;
      } else {
        break;
      }
    }

    for (let i = size - 1; i >= 0; i--) {
      if (tetromino[i].every((cell) => cell === 0)) {
        bottom += 1;
      } else {
        break;
      }
    }

    leftCalculation: for (let i = 0; i < size; i++) {
      for (let y = 0; y < size; y++) {
        if (tetromino[y][i] !== 0) {
          break leftCalculation;
        }
      }
      left += 1;
    }

    rightCalculation: for (let i = size - 1; i >= 0; i--) {
      for (let y = 0; y < size; y++) {
        if (tetromino[y][i] !== 0) {
          break rightCalculation;
        }
      }
      right += 1;
    }

    return {
      top,
      right,
      bottom,
      left,
    };
  }
}
