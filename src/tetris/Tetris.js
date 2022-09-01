import { Resources, Resource, Stream, EventEmitter } from "tiny-game-engine";
import { Menu } from "../menu/Menu";

export const Tetris = new (class TetrisGame {
  constructor() {
    this.stream = new Stream();
    this.events = new EventEmitter();

    this.resourcesMap = {
      m1: new Resource("public/resources/m1.png"),
      m2: new Resource("public/resources/m2.png"),
      m3: new Resource("public/resources/m3.png"),
      m4: new Resource("public/resources/m4.png"),
      m5: new Resource("public/resources/m5.png"),
      m6: new Resource("public/resources/m6.png"),
      sun: new Resource("public/resources/sun.png"),
    };

    this.resources = new Resources();
    this.resources.addMap(this.resourcesMap);

    /** @type {Menu} */
    this.menu = null;
  }

  makeMenu() {
    this.menu = new Menu();
  }
})();