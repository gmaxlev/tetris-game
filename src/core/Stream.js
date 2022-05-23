import { StreamsQueue } from './StreamsQueue';

export class Stream {
  static processing = false;

  static queue = new StreamsQueue();

  constructor({ fn = null, start = true } = { fn: null, start: true }) {
    this.fn = fn;
    this.children = [];
    this.parent = null;
    this.isStopped = !start;
    this.isDeleted = false;
  }

  child(stream) {
    if (Array.isArray(stream)) {
      stream.forEach((item) => {
        this.child(item);
      });
      return;
    }

    if (stream.parent) {
      return;
    }
    stream.parent = this;
    if (Stream.processing) {
      Stream.queue.child(stream);
      return;
    }
    this.children.push(stream);
    return stream;
  }

  call() {
    if (this.isStopped || this.isDeleted) {
      return;
    }

    if (this.fn) {
      this.fn();
    }

    if (this.isStopped || this.isDeleted) {
      return;
    }

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].call();
    }
  }

  destroyChild(stream) {
    stream.isDeleted = true;
    if (Stream.processing) {
      Stream.queue.destroy(stream);
      return;
    }
    this.children = this.children.filter((item) => item !== stream);
  }

  destroy() {
    if (!this.parent) {
      return;
    }
    this.parent.destroyChild(this);
  }

  stop() {
    this.isStopped = true;
  }

  continue() {
    this.isStopped = false;
  }
}
