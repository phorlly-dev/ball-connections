import * as Phaser from "phaser";
import GameEngine from "./scenes/Game";
import Instances from "./consts";
import Boot from "./scenes/Boot";
import Preload from "./scenes/Preload";

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: Phaser.AUTO,
    width: Instances.game.width,
    height: Instances.game.height,
    backgroundColor: Instances.game.bg,
    scale: {
        // mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: Instances.game.width,
        height: Instances.game.height,
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
        },
    },
    render: {
        pixelArt: false, // smooth scaling
        antialias: true, // prevent blurry text edges
    },
    scene: [Boot, Preload, GameEngine],
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;
