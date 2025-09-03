import Instances from "../consts";
import States from "./state";

const Payloads = {
    initLevel(scene, level) {
        scene.currentLevel = level;
        States.setTitle(level);

        scene.balls.forEach((ball) => ball.destroy());
        scene.balls = [];
        scene.paths = [];
        scene.isDragging = false;
        scene.currentPath = null;
        scene.lineGraphics.clear();

        const levelConfig = this.generateLevelConfig(scene, level);

        levelConfig.balls.forEach((config) => {
            const colorInfo = Instances.colors.find((c) => c.key === config.color);
            const ballContainer = scene.add
                .container(config.x, config.y)
                .setSize(scene.ballRadius * 2, scene.ballRadius * 2)
                .setInteractive();

            const mainCircle = scene.add
                .circle(0, 0, scene.ballRadius * 1.2, colorInfo.hex)
                .setStrokeStyle(3, 0xbdc3c7);
            const highlight = scene.add.circle(-8, -8, 8, 0xffffff, 0.7);
            ballContainer.add([mainCircle, highlight]);

            ballContainer.id = config.id;
            ballContainer.colorKey = config.color;
            ballContainer.colorHex = colorInfo.hex;
            ballContainer.connected = false;
            ballContainer.connectedTo = null;
            ballContainer.mainCircle = mainCircle;

            scene.balls.push(ballContainer);
        });

        States.setStatus("Connect the matching colors!");
    },
    generateLevelConfig(scene, level) {
        const gameWidth = scene.sys.game.config.width;
        const gameHeight = scene.sys.game.config.height;

        // Increase difficulty by adding more colors over time
        const numColors = Math.min(3 + Math.floor(level / 10), Instances.colors.length);
        States.setSubtitle(numColors);

        // Balls per color also increases with levels (max 4 per color)
        const ballsPerColor = Math.min(2 + Math.floor(level / 20), 4);

        const totalBalls = numColors * ballsPerColor;
        const minDistance = scene.ballRadius * 3 + 5;
        const margin = scene.ballRadius * 2;

        // Minimum distance between same-color balls (scales with level)
        const sameColorMinDistance = Math.max(gameWidth, gameHeight) / (2.5 + Math.floor(level / 8));

        let positions = [];
        let ballConfig = [];
        let attempts = 0;

        do {
            positions = [];
            attempts = 0;

            // random positions with spacing
            while (positions.length < totalBalls && attempts < 2000) {
                const x = Phaser.Math.Between(margin, gameWidth - margin);
                const y = Phaser.Math.Between(margin, gameHeight - margin);

                let isValid = true;
                for (const pos of positions) {
                    if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < minDistance) {
                        isValid = false;
                        break;
                    }
                }

                if (isValid) positions.push({ x, y });
                attempts++;
            }

            // assign colors
            ballConfig = [];
            const availableColors = [...Instances.colors];
            Phaser.Utils.Array.Shuffle(positions);

            for (let i = 0; i < numColors; i++) {
                const color = availableColors[i];

                for (let j = 0; j < ballsPerColor; j++) {
                    const idx = i * ballsPerColor + j;

                    // check same-color distance rule
                    if (j > 0) {
                        const partner = ballConfig.find((b) => b.color === color.key);
                        const dist = Phaser.Math.Distance.Between(
                            positions[idx].x,
                            positions[idx].y,
                            partner.x,
                            partner.y
                        );
                        if (dist < sameColorMinDistance) {
                            continue; // reject placement → regen in outer loop
                        }
                    }

                    ballConfig.push({
                        x: positions[idx].x,
                        y: positions[idx].y,
                        color: color.key,
                        id: `${color.key}${j + 1}`,
                    });
                }
            }
        } while (ballConfig.length < totalBalls || this.isTooEasy(ballConfig));

        return { balls: ballConfig };
    },
    checkCompletion(scene, { startBall, endBall, color }) {
        if (scene.balls.every((ball) => ball.connected)) {
            States.setStatus(`🎉 Level ${scene.currentLevel} Complete!`, "completed");
            States.playLevelCompleteEffect(scene, scene.currentLevel);
            States.setDelay({ scene, callback: () => this.initLevel(scene, scene.currentLevel + 1) });
        } else {
            States.setStatus("✅ Great connection!");
            States.playConnectEffect(scene, { startBall, endBall, color });
            States.setDelay({ scene, callback: () => States.setStatus("Connect the matching colors!") });
        }
    },
    drawAllPaths(scene) {
        scene.lineGraphics.clear();
        const allPaths = scene.currentPath ? [...scene.paths, scene.currentPath] : scene.paths;
        allPaths.forEach((path) => this.drawPath(scene, path));
    },
    drawPath(scene, path) {
        if (path.points.length < 2) return;

        // Outer base
        scene.lineGraphics.lineStyle(18, path.color, 0.35).strokePoints(path.points);
        // Middle tube
        scene.lineGraphics.lineStyle(10, path.color, 1).strokePoints(path.points);
        // Inner highlight
        scene.lineGraphics.lineStyle(4, 0xffffff, 0.8).strokePoints(path.points);
    },
    getBallAt(scene, x, y) {
        return scene.balls.find((ball) => Phaser.Math.Distance.Between(x, y, ball.x, ball.y) < scene.ballRadius);
    },
    updateBallStyle(ball) {
        ball.mainCircle.setStrokeStyle(ball.connected ? 4 : 3, ball.connected ? 0x2c3e50 : 0xbdc3c7);
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

        States.setDelay({ scene, delay: 5000, callback: () => States.setStatus("Connect the matching colors!") });
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
        const pathIndex = this.paths.findIndex(
            (p) => p.startBall.colorKey === ball.colorKey || (p.endBall && p.endBall.colorKey === ball.colorKey)
        );

        if (pathIndex !== -1) {
            const path = this.paths[pathIndex];

            // Reset both balls
            path.startBall.connected = false;
            path.startBall.connectedTo = null;
            this.updateBallStyle(path.startBall);

            if (path.endBall) {
                path.endBall.connected = false;
                path.endBall.connectedTo = null;
                this.updateBallStyle(path.endBall);
            }

            // Remove the path
            scene.paths.splice(pathIndex, 1);

            // Redraw
            scene.lineGraphics.clear();
            this.drawAllPaths(scene);

            States.setStatus("🔄 Connection removed!");
        }
    },
};

export default Payloads;
