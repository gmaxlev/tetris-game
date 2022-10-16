import { GameObjectCanvas } from "tiny-game-engine";
import { BRICK_SIZE } from "./BrickGameObject";

export class PlaygroundBackgroundGameObject extends GameObjectCanvas {
  /**
   * @param {Playground} playground
   */
  constructor(playground) {
    super({ width: 320, height: 600 });

    this.playground = playground;
    this.markForUpdate(GameObjectCanvas.MARKS.SINGLE, 1);
  }

  render() {
    const padding = 19;

    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.size.height);
    bgGradient.addColorStop(0, "rgba(255,255,255,0)");
    bgGradient.addColorStop(1, "rgba(255,255,255,0.3)");

    const dotsGradient = this.ctx.createLinearGradient(
      0,
      0,
      0,
      this.size.height
    );
    dotsGradient.addColorStop(0, "rgba(0,0,0,0)");
    dotsGradient.addColorStop(0.1, "rgba(0,0,0,0.1)");
    dotsGradient.addColorStop(1, "rgba(0,0,0,0.01)");

    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(
      padding / 1.2,
      padding / 1.4,
      this.size.width - (padding / 1.2) * 2,
      this.size.height - (padding / 1.4) * 2
    );

    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(
      padding,
      padding,
      this.size.width - padding * 2,
      this.size.height - padding * 2
    );

    this.ctx.save();
    this.ctx.strokeStyle = dotsGradient;
    for (let row = 1; row < this.playground.gameMap.rows; row++) {
      this.ctx.beginPath();
      this.ctx.moveTo(padding, padding + row * BRICK_SIZE);
      this.ctx.lineTo(this.size.width - padding, padding + BRICK_SIZE * row);
      this.ctx.stroke();
    }

    for (let col = 1; col < this.playground.gameMap.cols; col++) {
      this.ctx.beginPath();
      this.ctx.moveTo(padding + col * BRICK_SIZE, padding);
      this.ctx.lineTo(padding + col * BRICK_SIZE, this.size.height - padding);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  destroy() {
    super.destroy();
  }
}
