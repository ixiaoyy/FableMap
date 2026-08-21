import Phaser from "phaser";
import { WorldScene } from "./scenes/WorldScene.ts";

/** Creates one Phaser 4 canvas instance owned by the provided Vue container element. */
export function startGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 512,
    height: 512,
    backgroundColor: "#0b1714",
    pixelArt: true,
    render: {
      antialias: false,
      roundPixels: true,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [WorldScene],
  });
}
