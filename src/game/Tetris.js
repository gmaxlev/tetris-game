import { Resources } from "../core/Resources/Resources";
import { EventEmitter } from "../core/EventEmitter";
import { Resource } from "../core/Resources/Resource";
import { Stream } from "../core/Stream";

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

    // this.resources.add('test', new Resource('https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg'));
  }
})();
