import { EventEmitter } from "tiny-game-engine";

export class Blackout {
  static EVENTS = {
    DARK: Symbol("DARK"),
    LIGHT: Symbol("LIGHT"),
  };

  constructor() {
    this.events = new EventEmitter();
  }

  dark() {
    this.events.emit(Blackout.EVENTS.DARK);
  }

  light() {
    this.events.emit(Blackout.EVENTS.LIGHT);
  }
}
