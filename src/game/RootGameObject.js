import { GameObject } from '../core/GameObject';
import { LoadingGameObject } from './LoadingGameObject';

export class RootGameObject extends GameObject {
  constructor() {
    super({ width: 600, height: 800 });

    this.loadingGameObject = new LoadingGameObject(this.size.width, this.size.height);
    this.loadingGameObject.events.subscribeOnce(GameObject.EVENTS.BEFORE_DESTROYING, () => {
      this.loadingGameObject = null;
      this.markFramesForUpdate(1);
    });

    this.connect(this.loadingGameObject);
  }

  draw() {
    if (this.loadingGameObject) {
      this.ctx.drawImage(this.loadingGameObject.update(), 0, 0);
    }
  }
}
