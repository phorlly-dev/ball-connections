import Instances from "../consts";
import Payloads from "../utils/payload";

class Preload extends Phaser.Scene {
    constructor() {
        super("Preload");

        // Declare props
        this.fakeProgress = 0;
        this.targetProgress = 0;
        this.progressBar = null;
        this.progressText = null;
        this.bg = null;
        this.progressBox = null;
    }

    init() {
        // Reset state when scene restarts
        this.fakeProgress = 0;
        this.targetProgress = 0;
    }

    preload() {
        const { width, height } = this.scale;
        Payloads.toggleUI(false);

        // --- Background ---
        this.bg = this.add.image(width / 2, height / 2, Instances.image.key.bg).setAlpha(0.4);

        // --- Sizes (responsive bar width = 40% of screen) ---
        const barWidth = Math.min(300, width * 0.4);
        const barHeight = 28;
        const radius = 12;
        const x = width / 2 - barWidth / 2;
        const y = height / 2 - barHeight / 2;

        // --- Progress outline ---
        this.progressBox = this.add.graphics();
        this.progressBox.lineStyle(2, 0xffffff, 1);
        this.progressBox.strokeRoundedRect(x, y, barWidth, barHeight, radius);

        // --- Progress bar ---
        this.progressBar = this.add.graphics();

        // --- Text ---
        this.progressText = this.add
            .text(width / 2, y + barHeight + 40, "Loading: 0%", {
                fontSize: "18px",
                fill: "#c7a7a7ff",
            })
            .setOrigin(0.5);

        // --- Loader events ---
        this.load.on("progress", (p) => {
            this.targetProgress = p;
        });

        this.load.once("complete", () => {
            this.targetProgress = 1;

            // ✅ unlock audio context (important for mobile)
            if (this.sound.context.state === "suspended") {
                this.sound.context.resume();
            }

            // Fade out everything nicely
            this.tweens.add({
                targets: [this.bg, this.progressBox, this.progressBar, this.progressText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.scene.start("GameEngine");
                },
            });
        });

        // --- Example assets ---
        const { key, value } = Instances.audio;
        this.load.setPath("assets");
        this.load.audio(key.bg, value.bg);
        this.load.audio(key.cancel, value.cancel);
        this.load.audio(key.click, value.click);
        this.load.audio(key.connect, value.connect);
        this.load.audio(key.empty, value.empty);
        this.load.audio(key.win, value.win);
        this.load.audio(key.wrong, value.wrong);
    }

    update() {
        // Smooth LERP update
        this.fakeProgress = Phaser.Math.Linear(this.fakeProgress, this.targetProgress, 0.1);

        const { width, height } = this.scale;
        const barWidth = Math.min(300, width * 0.4);
        const barHeight = 28;
        const radius = 12;
        const x = width / 2 - barWidth / 2;
        const y = height / 2 - barHeight / 2;

        this.progressBar.clear();
        this.progressBar.fillStyle(0xe67e22, 1);
        this.progressBar.fillRoundedRect(x, y, barWidth * this.fakeProgress, barHeight, radius);

        this.progressText.setText(`Loading: ${Math.round(this.fakeProgress * 100)}%`);
    }

    shutdown() {
        this.load.removeAllListeners();
    }
}

export default Preload;
