import { Vector2 } from "../core/Vector2";
import { PolyBezier } from "../core/PolyBezier";
import { Bezier } from "../core/Bezier";
import { KeyFrames } from "../core/KeyFrames";
import { EventEmitter } from "../core/EventEmitter";
import { Tetris } from "./Tetris";

export const World = new (class World {
  constructor() {
    this.events = new EventEmitter();
    this.camera = new Vector2();

    this.EVENTS = {
      START_TRANSITION_TO_GAME: Symbol("START_TRANSITION_TO_GAME"),
      END_TRANSITION_TO_GAME: Symbol("END_TRANSITION_TO_GAME"),
    };

    this.toGameCurve = new PolyBezier([
      new Bezier([
        new Vector2(0, 0),
        new Vector2(50, 0),
        new Vector2(100, -2350),
        new Vector2(150, -2350),
      ]),
      new Bezier([
        new Vector2(150, -2350),
        new Vector2(300, -2300),
        new Vector2(1800, -2300),
      ]),
    ]);

    this.keyFrames = new KeyFrames({
      total: 5000,
      exact: true,
      fn: () => {
        this.camera.y = this.toGameCurve.getPoint(this.keyFrames.progress).y;
      },
    });

    this.keyFrames.events.subscribe(KeyFrames.EVENTS.PAUSE, () => {
      this.events.emit(this.EVENTS.END_TRANSITION_TO_GAME);
    });

    Tetris.stream.child(this.keyFrames.stream);
  }

  toGame() {
    if (this.keyFrames.isActive) {
      return;
    }
    this.events.emit(this.EVENTS.START_TRANSITION_TO_GAME);
    this.keyFrames.start();
  }
})();
