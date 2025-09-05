import Instances from "../consts";
import Helpers from "./helper";
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
                .setScale(0.8)
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

        States.setStatus(Instances.text.status);
    },
    generateLevelConfig(scene, level) {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;

        // Increase difficulty by adding more colors over time
        const numColors = Math.min(3 + Math.floor(level / 10), Instances.colors.length);
        States.setSubtitle(numColors);

        // Balls per color also increases with levels (max 4 per color)
        const ballsPerColor = Math.min(2 + Math.floor(level / 20), 4);

        scene.totalBalls = numColors * ballsPerColor;
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
            while (positions.length < scene.totalBalls && attempts < 2000) {
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
        } while (ballConfig.length < scene.totalBalls || Helpers.isTooEasy(ballConfig));

        return { balls: ballConfig };
    },
    checkCompletion(scene, { startBall, endBall, color }) {
        if (scene.balls.every((ball) => ball.connected)) {
            States.setStatus(`🎉 Level ${scene.currentLevel} Complete!`, "completed");
            Helpers.playSound(scene, Instances.audio.key.win);
            States.playLevelCompleteEffect(scene, scene.currentLevel);
            Helpers.setOrCutScore(scene, scene.totalBalls);
            States.setDelay({ scene, callback: () => this.initLevel(scene, scene.currentLevel + 1) });
        } else {
            States.setStatus("✅ Great connection!");
            Helpers.setOrCutScore(scene, scene.totalBalls);
            Helpers.playSound(scene, Instances.audio.key.connect);
            States.playConnectEffect(scene, { startBall, endBall, color });
        }
    },
    drawAllPaths(scene) {
        scene.lineGraphics.clear();
        const allPaths = scene.currentPath ? [...scene.paths, scene.currentPath] : scene.paths;
        allPaths.forEach((path) => Helpers.drawPath(scene, path));
    },
    getBallAt(scene, x, y) {
        return scene.balls.find((ball) => Phaser.Math.Distance.Between(x, y, ball.x, ball.y) < scene.ballRadius);
    },
    updateBallStyle(ball) {
        ball.mainCircle.setStrokeStyle(ball.connected ? 4 : 3, ball.connected ? 0x2c3e50 : 0xbdc3c7);
    },
    toggleUI(isVisible = true) {
        const header = States.getById("header");
        const footer = States.getById("footer");

        if (isVisible) {
            Helpers.show({ element: header });
            Helpers.show({ element: footer });
        } else {
            Helpers.hide({ element: header });
            Helpers.hide({ element: footer });
        }
    },
    toggleSound(scene) {
        // Start with muted = false
        scene.sound.mute = false;
        Helpers.playSound(scene, Instances.audio.key.click);

        if (scene.sound.mute) {
            // Unmute
            scene.sound.mute = false;
            Helpers.show({ element: scene.onBtn });
            Helpers.hide({ element: scene.offBtn });
        } else {
            // Mute
            scene.sound.mute = true;
            Helpers.hide({ element: scene.onBtn });
            Helpers.show({ element: scene.offBtn });
        }
    },
};

export default Payloads;
