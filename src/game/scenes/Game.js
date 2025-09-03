import Controllers from "../utils/controller";
import Payloads from "../utils/payload";

class GameEngine extends Phaser.Scene {
    constructor() {
        super("GameEngine");
    }

    init() {
        this.balls = [];
        this.paths = [];
        this.currentPath = null;
        this.isDragging = false;
        this.ballRadius = 25;
        this.currentLevel = 1;
    }

    create() {
        // Graphics object for drawing all lines
        this.lineGraphics = this.add.graphics();
        Payloads.initLevel(this, this.currentLevel);
        Controllers.buttons(this);
    }
    update() {
        this.setupInputListeners();
    }

    // --- LEVEL GENERATION AND INITIALIZATION ---
    // generateLevelConfig(level) {
    //     const gameWidth = this.sys.game.config.width;
    //     const gameHeight = this.sys.game.config.height;

    //     // Increase difficulty by adding more colors over time
    //     const numColors = Math.min(2 + Math.floor(level / 4), COLORS.length);
    //     const totalBalls = numColors * 2;
    //     const minDistance = this.ballRadius * 3.5;
    //     const margin = this.ballRadius * 1.5;

    //     const positions = [];
    //     let attempts = 0;

    //     while (positions.length < totalBalls && attempts < 2000) {
    //         const x = Phaser.Math.Between(margin, gameWidth - margin);
    //         const y = Phaser.Math.Between(margin, gameHeight - margin);

    //         let isValid = true;
    //         for (const pos of positions) {
    //             if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < minDistance) {
    //                 isValid = false;
    //                 break;
    //             }
    //         }

    //         if (isValid) {
    //             positions.push({ x, y });
    //         }
    //         attempts++;
    //     }

    //     // Create ball configuration from the valid positions
    //     const ballConfig = [];
    //     const availableColors = [...COLORS];
    //     Phaser.Utils.Array.Shuffle(positions); // Randomize pairings

    //     for (let i = 0; i < numColors; i++) {
    //         const color = availableColors[i];
    //         ballConfig.push({ x: positions[i * 2].x, y: positions[i * 2].y, color: color.key, id: `${color.key}1` });
    //         ballConfig.push({
    //             x: positions[i * 2 + 1].x,
    //             y: positions[i * 2 + 1].y,
    //             color: color.key,
    //             id: `${color.key}2`,
    //         });
    //     }

    //     return { balls: ballConfig };
    // }

    // initLevel(level) {
    //     this.currentLevel = level;
    //     levelTitleEl.textContent = `Level ${level}`;

    //     this.balls.forEach((ball) => ball.destroy());
    //     this.balls = [];
    //     this.paths = [];
    //     this.isDragging = false;
    //     this.currentPath = null;
    //     this.lineGraphics.clear();

    //     const levelConfig = this.generateLevelConfig(level);

    //     levelConfig.balls.forEach((config) => {
    //         const colorInfo = COLORS.find((c) => c.key === config.color);
    //         const ballContainer = this.add
    //             .container(config.x, config.y)
    //             .setSize(this.ballRadius * 2, this.ballRadius * 2)
    //             .setInteractive();

    //         const mainCircle = this.add.circle(0, 0, this.ballRadius, colorInfo.hex).setStrokeStyle(3, 0xbdc3c7);
    //         const highlight = this.add.circle(-8, -8, 8, 0xffffff, 0.7);
    //         ballContainer.add([mainCircle, highlight]);

    //         ballContainer.id = config.id;
    //         ballContainer.colorKey = config.color;
    //         ballContainer.colorHex = colorInfo.hex;
    //         ballContainer.connected = false;
    //         ballContainer.connectedTo = null;
    //         ballContainer.mainCircle = mainCircle;

    //         this.balls.push(ballContainer);
    //     });

    //     updateStatus("Connect the matching colors!", "status");
    // }

    // --- INPUT HANDLING ---
    setupInputListeners() {
        this.input.on("pointerdown", this.handlePointerDown, this);
        this.input.on("pointermove", this.handlePointerMove, this);
        this.input.on("pointerup", this.handlePointerUp, this);
    }

    handlePointerDown(pointer) {
        Controllers.handlePointerDown(this, pointer);
    }

    handlePointerMove(pointer) {
        Controllers.handlePointerMove(this, pointer);
    }

    handlePointerUp(pointer) {
        Controllers.handlePointerUp(this, pointer);
    }
}

export default GameEngine;
