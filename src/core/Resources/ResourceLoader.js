import { EventEmitter } from '../EventEmitter';

class ResourceLoader {
  static EVENTS = {
    LOAD_ERROR_EVENT: 1,
    LOAD_EVENT: 2,
  };

  constructor() {
    this.events = new EventEmitter();
  }

  load() {}

  get() {}
}

export { ResourceLoader };
