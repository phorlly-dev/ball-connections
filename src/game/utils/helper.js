import { audio, status } from "../consts";
import { drawAllPaths, updateBallStyle } from "./payload";
import { getById, setDelay, setPoints, setStatus } from "./state";

const Helpers = {
    hide({ id = "", element = null }) {
        return element ? element.classList.add("hidden") : getById(id).classList.add("hidden");
    },
    show({ id = "", element = null }) {
        return element ? element.classList.remove("hidden") : getById(id).classList.remove("hidden");
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
        setStatus(message, "error");

        // Remove current path instantly
        scene.isDragging = false;
        scene.currentPath = null;

        // clear graphics and redraw ONLY confirmed paths
        scene.lineGraphics.clear();
        scene.paths.forEach((path) => {
            if (path.completed) {
                // redraw completed paths only
                drawPath(scene, path);
            }
        });

        setDelay({
            scene,
            delay: 5000,
            callback: () => setStatus(status),
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
            updateBallStyle(path.startBall);

            if (path.endBall) {
                path.endBall.connected = false;
                path.endBall.connectedTo = null;
                updateBallStyle(path.endBall);
            }

            // Remove the path
            scene.paths.splice(pathIndex, 1);

            // Redraw
            scene.lineGraphics.clear();
            drawAllPaths(scene);
            setOrCutScore(scene, scene.totalBalls, false);
            playSound(scene, audio.key.cancel);

            setStatus("🔄 Connection removed!");
        }
    },
    setOrCutScore(scene, points, positive = true) {
        if (positive) {
            scene.currentScore += points;
        } else {
            scene.currentScore -= points;
        }

        setPoints(scene.currentScore);
    },
    toggleDrawingCursor(enable) {
        getById("phaser-game").classList.toggle("drawing", enable);
    },
};

export const {
    hide,
    show,
    playSound,
    drawPath,
    cancelCurrentPath,
    isTooEasy,
    disconnectPath,
    setOrCutScore,
    toggleDrawingCursor,
} = Helpers;
