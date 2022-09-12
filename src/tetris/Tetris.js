import {
  Resources,
  Resource,
  Stream,
  EventEmitter,
  KeyboardListener,
} from "tiny-game-engine";
import { Menu } from "../menu/Menu";
import { Playground } from "../playground/Playground";

export const Tetris = new (class Tetris {
  constructor() {
    this.stream = new Stream({
      name: "Tetris",
    });
    this.events = new EventEmitter();

    this.keyboardListener = new KeyboardListener();
    this.stream.child(this.keyboardListener.stream);
    this.keyboardListener.run();

    this.resourcesMap = {
      m1: new Resource("public/resources/m1.png"),
      m2: new Resource("public/resources/m2.png"),
      m3: new Resource("public/resources/m3.png"),
      m4: new Resource("public/resources/m4.png"),
      m5: new Resource("public/resources/m5.png"),
      m6: new Resource("public/resources/m6.png"),
      sun: new Resource("public/resources/sun.png"),
      playground: new Resource("public/resources/playground.png"),
    };

    this.resources = new Resources();
    this.resources.addMap(this.resourcesMap);

    /** @type {Menu} */
    this.menu = null;

    /** @type {Playground} */
    this.playground = null;
  }

  makeMenu() {
    this.menu = new Menu();
  }

  makePlayground() {
    if (this.menu) {
      this.menu.destroy();
    }
    this.playground = new Playground(this);
  }
})();
