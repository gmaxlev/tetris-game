import { Stream } from "tiny-game-engine";
import { Tetris } from "../tetris/Tetris";

export class Menu {
  constructor() {
    this.stream = new Stream({
      name: "Menu",
    });
    Tetris.stream.child(this.stream);
  }

  destroy() {
    this.stream.destroy();
  }
}
