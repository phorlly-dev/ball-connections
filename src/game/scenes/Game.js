import { audio, start } from "../consts";
import { makebuttons, pointerDown, pointerMove, pointerUp, toggleMute } from "../utils/controller";
import { initLevel, toggleUI } from "../utils/payload";

class GameEngine extends Phaser.Scene {
    constructor() {
        super(start);

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
        toggleUI();

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
        initLevel(this, this.currentLevel);

        // --- Controllers / UI ---
        makebuttons(this);
        toggleMute?.(this); // safer check if function exists

        // --- Audio ---
        this.sound.play(audio.key.bg, { loop: true, volume: 0.5 });

        // --- Input listeners (once, not per frame) ---
        this.input.on("pointerdown", this.handlePointerDown, this);
        this.input.on("pointermove", this.handlePointerMove, this);
        this.input.on("pointerup", this.handlePointerUp, this);
    }

    // --- INPUT HANDLING ---
    handlePointerDown(pointer) {
        pointerDown(this, pointer);
    }

    handlePointerMove(pointer) {
        pointerMove(this, pointer);
    }

    handlePointerUp(pointer) {
        pointerUp(this, pointer);
    }

    // --- Cleanup when scene stops ---
    shutdown() {
        this.input.removeAllListeners();
        this.sound.stopAll();
        if (this.lineGraphics) this.lineGraphics.clear();
    }
}

export default GameEngine;
