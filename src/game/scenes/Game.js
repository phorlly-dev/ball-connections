import Instances from "../consts";
import Controllers from "../utils/controller";
import Payloads from "../utils/payload";

class GameEngine extends Phaser.Scene {
    constructor() {
        super("GameEngine");

        // Declare properties
        this.balls = [];
        this.paths = [];
        this.currentPath = null;
        this.isDragging = false;
        this.ballRadius = 25;
        this.currentLevel = 1;
        this.currentScore = 0;

        this.lineGraphics = null;

        this.onBtn = null;
        this.offBtn = null;
        this.resetBtn = null;
        this.hintBtn = null;
    }

    init() {
        Payloads.toggleUI();

        // Reset state each time scene starts
        this.balls = [];
        this.paths = [];
        this.currentPath = null;
        this.isDragging = false;
        this.ballRadius = 25;
        this.currentLevel = 1;
        this.currentScore = 0;
    }

    create() {
        // --- Graphics object for lines ---
        this.lineGraphics = this.add.graphics();

        // --- Setup game level ---
        Payloads.initLevel(this, this.currentLevel);

        // --- Controllers / UI ---
        Controllers.buttons(this);
        Controllers.toggleMute?.(this); // safer check if function exists

        // --- Audio ---
        this.sound.play(Instances.audio.key.bg, { loop: true, volume: 0.5 });

        // --- Input listeners (once, not per frame) ---
        this.input.on("pointerdown", this.handlePointerDown, this);
        this.input.on("pointermove", this.handlePointerMove, this);
        this.input.on("pointerup", this.handlePointerUp, this);
    }

    // --- INPUT HANDLING ---
    handlePointerDown(pointer) {
        Controllers.handlePointerDown(this, pointer);
    }

    handlePointerMove(pointer) {
        Controllers.handlePointerMove(this, pointer);
    }

    handlePointerUp(pointer) {
        Controllers.handlePointerUp(this, pointer);
    }

    // --- Cleanup when scene stops ---
    shutdown() {
        this.input.removeAllListeners();
        this.sound.stopAll();
        if (this.lineGraphics) this.lineGraphics.clear();
    }
}

export default GameEngine;
