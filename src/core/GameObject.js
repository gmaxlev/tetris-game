import { EventEmitter } from './EventEmitter';
import { Rectangle } from './Rectangle';

import { Unsubscribes } from './Unsubscribes';
import { Destroyings } from './Destroyings';

export class GameObject {
  static EVENTS = {
    MARK_FOR_UPDATE: 0,
    UNMARK_FOR_UPDATE: 1,
    BEFORE_DESTROYING: 2,
  };

  constructor({
    width = 300, height = 300,
  }) {
    this.events = new EventEmitter();
    this.unsubscribes = new Unsubscribes();
    this.destroyings = new Destroyings();
    this.size = new Rectangle(width, height);
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this._marksForUpdate = 0;
    this._marksFramesForUpdate = 0;
    this._connected = 0;
    this._connectedMap = new WeakMap();
    this._destroyed = false;
  }

  /** @param {GameObject} gameObject */
  connect(gameObject) {
    gameObject._connected += 1;

    const unsubscribes = new Unsubscribes();

    this._connectedMap.set(gameObject, unsubscribes);

    unsubscribes.add([
      gameObject.events.subscribe(GameObject.EVENTS.MARK_FOR_UPDATE, (count) => {
        this.markForUpdate(count);
      }),
      gameObject.events.subscribe(GameObject.EVENTS.UNMARK_FOR_UPDATE, (count) => {
        this.unmarkForUpdate(count);
      }),

      gameObject.events.subscribe(GameObject.EVENTS.BEFORE_DESTROYING, () => {
        this.disconnect(gameObject);
      }),

      this.events.subscribe(GameObject.EVENTS.BEFORE_DESTROYING, () => {
        this.disconnect(gameObject);
        gameObject.destroy(true);
      }),
    ]);

    if (gameObject._marksForUpdate) {
      this.markForUpdate(gameObject._marksForUpdate);
    }

    gameObject._connected = true;
  }

  disconnect(gameObject) {
    const unsubscribes = this._connectedMap.get(gameObject);
    unsubscribes.call();
    gameObject._connected -= 0;

    if (gameObject._marksForUpdate) {
      this.unmarkForUpdate(gameObject._marksForUpdate);
    }

    return this._connectedMap.delete(gameObject);
  }

  markForUpdate(count = 1) {
    this._marksForUpdate += count;
    this.events.emit(GameObject.EVENTS.MARK_FOR_UPDATE, count);
  }

  unmarkForUpdate(count = 1) {
    if (this._marksForUpdate === 0) {
      console.warn('Can not call unmarkForUpdate() with 0 _marksForUpdate');
      return;
    }
    this._marksForUpdate -= count;
    this.events.emit(GameObject.EVENTS.UNMARK_FOR_UPDATE, count);
  }

  markFramesForUpdate(count = 1) {
    if (count > this._marksFramesForUpdate) {
      if (this._marksFramesForUpdate === 0) {
        this.markForUpdate();
      }
      this._marksFramesForUpdate = count;
    }
  }

  update() {
    if (this._marksForUpdate) {
      this.clear();
      this.draw();
      if (this._marksFramesForUpdate > 0) {
        this._marksFramesForUpdate -= 1;
        if (this._marksFramesForUpdate === 0) {
          this.unmarkForUpdate();
        }
      }
    }
    return this.canvas;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.size.width, this.size.height);
  }

  destroy(isConnected) {
    if ((isConnected && this._connected > 1) || this._destroyed) {
      return;
    }

    this.events.emit(GameObject.EVENTS.BEFORE_DESTROYING);
    this.unsubscribes.call();
    this.destroyings.call();
    this.events.clear();
    if (!isConnected && this._marksForUpdate > 0) {
      this.unmarkForUpdate(this._marksForUpdate);
    }
    this._destroyed = true;
  }
}
