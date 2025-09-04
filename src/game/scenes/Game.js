import Instances from "../consts";
import Controllers from "../utils/controller";
import Payloads from "../utils/payload";

class GameEngine extends Phaser.Scene {
    constructor() {
        super("GameEngine");
    }

    init() {
        Payloads.toggleUI();
        this.balls = [];
        this.paths = [];
        this.currentPath = null;
        this.isDragging = false;
        this.ballRadius = 25;
        this.currentLevel = 1;
        this.currentScore = 0;
    }

    create() {
        // Graphics object for drawing all lines
        this.lineGraphics = this.add.graphics();
        Payloads.initLevel(this, this.currentLevel);
        Controllers.buttons(this);
        Controllers.toggleMote(this);
        this.sound.play(Instances.audio.key.bg, { loop: true, volume: 0.5 });
    }
    update() {
        this.setupInputListeners();
    }

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
