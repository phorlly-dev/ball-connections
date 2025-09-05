import Instances from "../consts";
import Payloads from "./payload";
import States from "./state";

const Helpers = {
    hide({ id = "", element = null }) {
        return element ? element.classList.add("hidden") : States.getById(id).classList.add("hidden");
    },
    show({ id = "", element = null }) {
        return element ? element.classList.remove("hidden") : States.getById(id).classList.remove("hidden");
    },
    playSound(scene, key) {
        if (scene.sound.locked) {
            scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => scene.sound.play(key));
        } else {
            scene.sound.play(key);
        }
    },
    drawPath(scene, path) {
        if (path.points.length < 2) return;

        // Outer base
        scene.lineGraphics.lineStyle(18, path.startBall.colorHex, 0.35).strokePoints(path.points);
        // Middle tube
        scene.lineGraphics.lineStyle(10, path.startBall.colorHex, 1).strokePoints(path.points);
        // Inner highlight
        scene.lineGraphics.lineStyle(4, 0xffffff, 0.8).strokePoints(path.points);
    },
    cancelCurrentPath(scene, message) {
        States.setStatus(message, "error");

        // Remove current path instantly
        scene.isDragging = false;
        scene.currentPath = null;

        // clear graphics and redraw ONLY confirmed paths
        scene.lineGraphics.clear();
        scene.paths.forEach((path) => {
            if (path.completed) {
                // redraw completed paths only
                this.drawPath(scene, path);
            }
        });

        States.setDelay({
            scene,
            delay: 5000,
            callback: () => States.setStatus(Instances.text.status),
        });
    },
    isTooEasy(config) {
        // heuristic: if all same-color pairs are too close (< 120 px) → reject
        for (let i = 0; i < config.length; i++) {
            for (let j = i + 1; j < config.length; j++) {
                if (config[i].color === config[j].color) {
                    const dist = Phaser.Math.Distance.Between(config[i].x, config[i].y, config[j].x, config[j].y);
                    if (dist < 150) return true;
                }
            }
        }
        return false;
    },
    disconnectPath(scene, ball) {
        // Find its path
        const pathIndex = scene.paths.findIndex(
            (p) => p.startBall.colorKey === ball.colorKey || (p.endBall && p.endBall.colorKey === ball.colorKey)
        );

        if (pathIndex !== -1) {
            const path = scene.paths[pathIndex];

            // Reset both balls
            path.startBall.connected = false;
            path.startBall.connectedTo = null;
            Payloads.updateBallStyle(path.startBall);

            if (path.endBall) {
                path.endBall.connected = false;
                path.endBall.connectedTo = null;
                Payloads.updateBallStyle(path.endBall);
            }

            // Remove the path
            scene.paths.splice(pathIndex, 1);

            // Redraw
            scene.lineGraphics.clear();
            Payloads.drawAllPaths(scene);
            this.setOrCutScore(scene, scene.totalBalls, false);
            Helpers.playSound(scene, Instances.audio.key.cancel);

            States.setStatus("🔄 Connection removed!");
        }
    },
    setOrCutScore(scene, points, positive = true) {
        if (positive) {
            scene.currentScore += points;
        } else {
            scene.currentScore -= points;
        }

        States.setPoints(scene.currentScore);
    },
    toggleDrawingCursor(enable) {
        const cursor = States.getById("phaser-game").classList;

        enable ? cursor.add("drawing") : cursor.remove("drawing");
        // gameDiv.classList.toggle("drawing", enable);
    },
};

export default Helpers;
