import {
  Resources,
  Resource,
  Stream,
  EventEmitter,
  KeyboardListener,
} from "tiny-game-engine";
import { Playground } from "./playground/Playground";
import { Blackout } from "./Blackout";

export class Tetris {
  constructor() {
    this.stream = new Stream({
      name: "Tetris",
    });
    this.events = new EventEmitter();

    this.blackout = new Blackout();

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
      RubikMonoOne: new Resource("public/resources/RubikMonoOne-Regular.ttf", {
        fontName: "RubikMonoOne",
        fontWeight: "400",
      }),
    };

    this.resources = new Resources();
    this.resources.addMap(this.resourcesMap);

    /** @type {Playground} */
    this.playground = null;
  }

  makePlayground() {
    this.playground = new Playground(this);
  }
}
