import { Game } from "tiny-game-engine";
import { Tetris } from "./Tetris";
import { RootGameObject } from "./game-objects/RootGameObject";
// import { One } from "./test";

const tetris = new Tetris();

const rootGameObject = new RootGameObject(tetris);

rootGameObject.canvas.style.margin = "0 auto";
rootGameObject.canvas.style.borderRadius = "10px";
document.body.style.margin = "0px";
document.body.style.height = "100vh";
document.body.style.display = "flex";
document.body.style.alignItems = "center";
document.body.style.justifyContent = "center";
document.body.style.backgroundColor = "black";

const game = new Game({
  canvas: rootGameObject.canvas,
  update() {
    if (rootGameObject.update()) {
      rootGameObject.clear();
      rootGameObject.render();
    }
  },
});

window.g = rootGameObject;

// const interactiveDisplay = new InteractiveDisplay({
//   htmlEl: rootGameObject.canvas,
// });
// Game.stream.child(interactiveDisplay.stream);
// interactiveDisplay.run();

Game.stream.child(tetris.stream);
game.run();
tetris.resources.load();
