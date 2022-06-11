import { EventEmitter } from "../../core/EventEmitter";

export const Blackout = {
  EVENTS: {
    LIGHT: Symbol("LIGHT"),
    DARK: Symbol("DARK"),
  },
  events: new EventEmitter(),
  light() {
    this.events.emit(Blackout.EVENTS.LIGHT);
  },
  dark() {
    this.events.emit(Blackout.EVENTS.DARK);
  },
};
