import { colors } from "../consts";

const States = {
    getById(id) {
        return document.getElementById(id);
    },
    setStatus(message, className = "") {
        const status = getById("status");
        status.textContent = message;
        status.className = `status ${className}`;
    },
    setTitle(level) {
        getById("title").textContent = level;
    },
    setPoints(score) {
        getById("score").textContent = score;
    },
    setSubtitle(counter) {
        getById("subtile").textContent = counter;
    },
    playConnectEffect(scene, { startBall, endBall, color }) {
        // Pulse balls
        scene.tweens.add({
            targets: [startBall.mainCircle, endBall.mainCircle],
            scale: 1.3,
            duration: 150,
            yoyo: true,
            ease: "Sine.easeInOut",
        });

        // Animate path highlight
        const g = scene.add.graphics();
        g.lineStyle(14, color, 1).strokePoints(
            [new Phaser.Math.Vector2(startBall.x, startBall.y), new Phaser.Math.Vector2(endBall.x, endBall.y)],
            false,
            true
        );
        scene.tweens.add({
            targets: g,
            alpha: 0,
            duration: 500,
            onComplete: () => g.destroy(),
        });

        // --- NEW: Popup text ---
        const text = scene.add
            .text(
                (startBall.x + endBall.x) / 2, // midpoint
                (startBall.y + endBall.y) / 2,
                "✨ Great Job!",
                {
                    fontSize: "20px",
                    fontStyle: "bold",
                    color: "#27ae60",
                    stroke: "#ffffff",
                    strokeThickness: 4,
                }
            )
            .setOrigin(0.5);

        scene.tweens.add({
            targets: text,
            y: text.y - 40, // float up
            alpha: 0,
            duration: 1800,
            ease: "Cubic.easeOut",
            onComplete: () => text.destroy(),
        });
    },
    setDelay({ scene, delay = 2000, callback }) {
        scene.time.delayedCall(delay, callback);
    },
    playLevelCompleteEffect(scene, level) {
        // Flash message
        const text = scene.add
            .text(scene.sys.game.config.width / 2, scene.sys.game.config.height / 2, `🎉 Level ${level} Completed!`, {
                fontSize: "28px",
                fontStyle: "bold",
                color: "#27ae60",
            })
            .setOrigin(0.5);

        scene.tweens.add({
            targets: text,
            scale: 1.2,
            duration: 300,
            yoyo: true,
            repeat: 2,
            onComplete: () => text.destroy(),
        });

        const emitterConfig = {
            x: { min: 0, max: scene.sys.game.config.width },
            y: 0,
            lifespan: 1500,
            speedY: { min: 200, max: 400 },
            scale: { start: 0.6, end: 0 },
            quantity: 4,
            blendMode: "ADD",
        };

        colors.forEach((c) => {
            const emitter = scene.add.particles(0, 0, `particle_${c.key}`, emitterConfig);
            setDelay({
                scene,
                callback: () => {
                    emitter.stop();
                    emitter.destroy(); // safe cleanup
                },
            });
        });
    },
    bindToggleButtons({ scene, elements, callback }) {
        elements.forEach((el) => el.addEventListener("pointerdown", () => callback(scene)));
    },
};

export const {
    getById,
    setStatus,
    setTitle,
    setPoints,
    setSubtitle,
    playConnectEffect,
    setDelay,
    playLevelCompleteEffect,
    bindToggleButtons,
} = States;
