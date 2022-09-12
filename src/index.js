import { Game } from "tiny-game-engine";
import { Tetris } from "./tetris/Tetris";
import { RootGameObject } from "./root/RootGameObject";
// import { One } from "./test";

const rootGameObject = new RootGameObject();

// rootGameObject.canvas.style.margin = "0 auto";
// rootGameObject.canvas.style.borderRadius = "10px";
document.body.style.margin = "0px";
document.body.style.height = "100vh";
document.body.style.display = "flex";
document.body.style.alignItems = "center";
document.body.style.justifyContent = "center";
document.body.style.backgroundColor = "black";

console.log(Game.stream);

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

Game.stream.child(Tetris.stream);
game.run();
Tetris.resources.load();
