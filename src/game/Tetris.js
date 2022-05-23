import { Resources } from '../core/Resources/Resources';
import { EventEmitter } from '../core/EventEmitter';
import { Resource } from '../core/Resources/Resource';
import { Stream } from '../core/Stream';

class TetrisGame {
  constructor() {
    this.stream = new Stream();
    this.events = new EventEmitter();
    this.resources = new Resources();
    this.resources.add('test', new Resource('https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg'));
  }
}

export const Tetris = new TetrisGame();
