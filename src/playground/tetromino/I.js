import { Tetromino } from "./Tetromino";
import { I_WALL_KICK_TESTS } from "./tests";
import states from "./states";

export default [
  new Tetromino(
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    states[0],
    I_WALL_KICK_TESTS
  ),
  new Tetromino(
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    states.R,
    I_WALL_KICK_TESTS
  ),
  new Tetromino(
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    states[2],
    I_WALL_KICK_TESTS
  ),
  new Tetromino(
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    states.L,
    I_WALL_KICK_TESTS
  ),
];
