import Instances from "../consts";

const States = {
    getById(id) {
        return document.getElementById(id);
    },
    setStatus(message, className = "") {
        const status = this.getById("status");
        status.textContent = message;
        status.className = `status ${className}`;

        return status;
    },
    setTitle(level) {
        return (this.getById("title").textContent = level);
    },
    setSubtitle(counter) {
        return (this.getById("subtile").textContent = counter);
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
        g.lineStyle(14, color, 1).strokePoints([startBall, endBall], false, true);
        scene.tweens.add({
            targets: g,
            alpha: 0,
            duration: 400,
            onComplete: () => g.destroy(),
        });
    },
    setDelay({ scene, delay = 1000, callback }) {
        scene.time.delayedCall(delay, callback);
    },
    playLevelCompleteEffect(scene, level) {
        // Flash message
        const text = scene.add
            .text(scene.sys.game.config.width / 2, scene.sys.game.config.height / 2, `🎉 Level ${level} Complete!`, {
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

        // Confetti particles
        const particles = scene.add.particles(0, 0, "flares", {
            frame: ["red", "green", "blue", "yellow", "white"],
            x: { min: 0, max: scene.sys.game.config.width },
            y: 0,
            lifespan: 1500,
            speedY: { min: 200, max: 400 },
            scale: { start: 0.6, end: 0 },
            quantity: 4,
            blendMode: "ADD",
        });

        // Stop confetti after a while
        this.setDelay({ scene, delay: 2000, callback: () => particles.destroy() });
    },
};

export default States;
