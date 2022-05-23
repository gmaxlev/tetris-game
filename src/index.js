import { Game } from './core/Game';
import { RootGameObject } from './game/RootGameObject';
import { Tetris } from './game/Tetris';

const rootGameObject = new RootGameObject();

rootGameObject.canvas.style.margin = '0 auto';

const game = new Game({
  canvas: rootGameObject.canvas,
  update() {
    rootGameObject.update();
  },
});

window.a = rootGameObject;
window.g = Game;

Game.stream.child(Tetris.stream);
game.run();
Tetris.resources.load();

document.body.style.backgroundColor = 'black';
