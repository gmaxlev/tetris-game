import { Tetromino } from "./Tetromino";
import { JLSTZ_WALL_KICK_TESTS } from "./tests";
import states from "./states";

export default [
  new Tetromino(
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    states[0],
    JLSTZ_WALL_KICK_TESTS
  ),
  new Tetromino(
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    states.R,
    JLSTZ_WALL_KICK_TESTS
  ),
  new Tetromino(
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    states[2],
    JLSTZ_WALL_KICK_TESTS
  ),
  new Tetromino(
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    states.L,
    JLSTZ_WALL_KICK_TESTS
  ),
];
