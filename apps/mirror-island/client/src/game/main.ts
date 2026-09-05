import Phaser from "phaser";
import { WorldScene } from "./scenes/WorldScene.ts";

/** Returns one Phaser canvas that follows the already sized Vue parent without CSS magnification. */
export function startGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: Math.max(1, parent.clientWidth),
    height: Math.max(1, parent.clientHeight),
    backgroundColor: "#0b1714",
    pixelArt: true,
    render: {
      antialias: false,
      roundPixels: true,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.NO_CENTER,
      autoRound: true,
    },
    scene: [WorldScene],
  });
}
