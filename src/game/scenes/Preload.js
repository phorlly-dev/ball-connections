import Instances from "../consts";
import Payloads from "../utils/payload";

class Preload extends Phaser.Scene {
    constructor() {
        super("Preload");
    }

    preload() {
        // background image (optional)
        const bg = this.add
            .image(Instances.game.width / 2, Instances.game.height / 2, Instances.image.key.bg)
            .setAlpha(0.6);
        Payloads.toggleUI(false);

        // sizes
        const barWidth = 240;
        const barHeight = 28;
        const radius = 12;
        const barX = Instances.game.width / 2 - barWidth / 2;
        const barY = Instances.game.height / 2;

        // progress container (outline)
        const progressBox = this.add.graphics();
        progressBox.lineStyle(2, 0xffffff, 1);
        progressBox.strokeRoundedRect(barX, barY, barWidth, barHeight, radius);

        // progress bar (filled rect)
        const progressBar = this.add.graphics();

        // loading text
        const progressText = this.add
            .text(Instances.game.width / 2, barY + 50, "Loading: 0%", {
                fontSize: "18px",
                fill: "#ffffff",
            })
            .setOrigin(0.5);

        // fake tween smoothing
        this.fakeProgress = 0;
        this.speed = 800; // ms tween speed

        this.load.on("progress", (progress) => {
            this.currentTween = this.tweens.add({
                targets: this,
                fakeProgress: progress,
                duration: this.speed,
                ease: "Linear",
                onUpdate: () => {
                    progressBar.clear();
                    progressBar.fillStyle(0xe67e22, 1); // Changed to red to match the image
                    progressBar.fillRoundedRect(barX, barY, barWidth * this.fakeProgress, barHeight, radius);

                    progressText.setText(`Loading: ${Math.round(this.fakeProgress * 100)}%`);
                },
            });
        });

        this.load.on("complete", () => {
            this.time.delayedCall(this.speed, () => {
                this.currentTween.stop();
                bg.destroy();
                progressBox.destroy();
                progressBar.destroy();
                progressText.destroy();
                this.scene.start("GameEngine");
            });
        });

        // 🔹 Example load assets (replace with yours)
        this.load.setPath("assets");
        this.load.audio(Instances.audio.key.bg, Instances.audio.value.bg);
        this.load.audio(Instances.audio.key.cancel, Instances.audio.value.cancel);
        this.load.audio(Instances.audio.key.click, Instances.audio.value.click);
        this.load.audio(Instances.audio.key.connect, Instances.audio.value.connect);
        this.load.audio(Instances.audio.key.empty, Instances.audio.value.empty);
        this.load.audio(Instances.audio.key.win, Instances.audio.value.win);
        this.load.audio(Instances.audio.key.wrong, Instances.audio.value.wrong);

        this.load.start();
    }
}

export default Preload;
