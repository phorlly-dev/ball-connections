import { audio, status } from "../consts";
import { cancelCurrentPath, disconnectPath, playSound, toggleDrawingCursor } from "./helper";
import { checkCompletion, drawAllPaths, getBallAt, initLevel, toggleSound, updateBallStyle } from "./payload";
import { bindToggleButtons, getById, setDelay, setStatus } from "./state";

const Controllers = {
    makebuttons(scene) {
        // clear old listeners before binding new
        const elements = [getById("reset-btn"), getById("hint-btn"), getById("on-btn"), getById("off-btn")];

        elements.forEach((el) => {
            el.replaceWith(el.cloneNode(true)); // 🔑 remove old listeners
        });

        scene.resetBtn = getById("reset-btn");
        scene.hintBtn = getById("hint-btn");
        scene.onBtn = getById("on-btn");
        scene.offBtn = getById("off-btn");

        scene.resetBtn.addEventListener("click", () => {
            initLevel(scene, scene.currentLevel);
            playSound(scene, audio.key.click);
        });
        scene.hintBtn.addEventListener("click", () => {
            setStatus(hintText);
            playSound(scene, audio.key.click);
            setDelay({ scene, callback: () => setStatus(status) });
        });
    },
    toggleMute(scene) {
        bindToggleButtons({
            scene,
            elements: [scene.onBtn, scene.offBtn],
            callback: toggleSound,
        });
    },
    pointerUp(scene, pointer) {
        toggleDrawingCursor(false);
        if (!scene.isDragging || !scene.currentPath) return;

        scene.isDragging = false;
        const endBall = getBallAt(scene, pointer.x, pointer.y);

        // ✅ Correct connection
        if (
            endBall &&
            endBall.id !== scene.currentPath.startBall.id &&
            endBall.colorKey === scene.currentPath.startBall.colorKey &&
            !endBall.connected
        ) {
            scene.currentPath.points.push(new Phaser.Math.Vector2(endBall.x, endBall.y));
            scene.currentPath.endBall = endBall;
            scene.currentPath.completed = true;
            scene.paths.push(scene.currentPath);

            scene.currentPath.startBall.connected = true;
            scene.currentPath.startBall.connectedTo = endBall;
            endBall.connected = true;
            endBall.connectedTo = scene.currentPath.startBall;

            updateBallStyle(scene.currentPath.startBall);
            updateBallStyle(endBall);

            checkCompletion(scene, {
                startBall: scene.currentPath.startBall,
                endBall,
                color: scene.currentPath.color,
            });
        }

        scene.currentPath = null;
        drawAllPaths(scene);
        setDelay({
            scene,
            delay: 5000,
            callback: () => setStatus(status),
        });
    },
    pointerMove(scene, pointer) {
        if (!scene.isDragging || !scene.currentPath) return;

        const newPoint = new Phaser.Math.Vector2(pointer.x, pointer.y);
        const lastPoint = scene.currentPath.points[scene.currentPath.points.length - 1];
        if (Phaser.Math.Distance.BetweenPoints(newPoint, lastPoint) <= 12) return;

        const newSegment = new Phaser.Geom.Line(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
        const margin = 12;

        // --- Prevent drawing outside game area ---
        if (
            newPoint.x < margin ||
            newPoint.x > scene.sys.game.config.width - margin ||
            newPoint.y < margin ||
            newPoint.y > scene.sys.game.config.height - margin
        ) {
            cancelCurrentPath(scene, "❌ Cannot hit the boundary!");
            playSound(scene, audio.key.empty);
            return; // ⬅️ stop here
        }

        // --- Block crossing another path ---
        for (const path of scene.paths) {
            for (let i = 0; i < path.points.length - 1; i++) {
                const seg = new Phaser.Geom.Line(
                    path.points[i].x,
                    path.points[i].y,
                    path.points[i + 1].x,
                    path.points[i + 1].y
                );

                const rect = Phaser.Geom.Rectangle.FromPoints([seg.getPointA(), seg.getPointB()]);
                Phaser.Geom.Rectangle.Inflate(rect, margin, margin);

                if (Phaser.Geom.Intersects.LineToRectangle(newSegment, rect)) {
                    cancelCurrentPath(scene, "❌ Cannot cross another path!");
                    playSound(scene, audio.key.wrong);
                    return; // ⬅️ stop here
                }
            }
        }

        // --- Block hitting other balls ---
        for (const ball of scene.balls) {
            if (ball.id === scene.currentPath.startBall.id) continue; // skip start ball

            const isPartner = ball.colorKey === scene.currentPath.startBall.colorKey;

            // add padding so line can't squeeze near balls
            const ballCircle = new Phaser.Geom.Circle(ball.x, ball.y, scene.ballRadius + margin);

            // ❌ Only block if different color and touching
            if (!isPartner && Phaser.Geom.Intersects.LineToCircle(newSegment, ballCircle)) {
                cancelCurrentPath(scene, "❌ Cannot pass through a different-colored ball!");
                playSound(scene, audio.key.wrong);
                return; // ⬅️ stop here
            }
        }

        // --- If valid, push new point ---
        scene.currentPath.points.push(newPoint);
        drawAllPaths(scene);
    },
    pointerDown(scene, pointer) {
        toggleDrawingCursor(true);
        const clickedBall = getBallAt(scene, pointer.x, pointer.y);
        if (!clickedBall) return;

        // --- NEW: Disconnect if already connected ---
        if (clickedBall.connected) {
            disconnectPath(scene, clickedBall);
            return;
        }

        // --- existing logic for starting a new path ---
        if (!clickedBall.connected) {
            scene.isDragging = true;

            // If scene ball's partner was already connected, break that path
            const partner = scene.balls.find((b) => b.colorKey === clickedBall.colorKey && b.id !== clickedBall.id);
            if (partner && partner.connected) disconnectPath(scene, partner);

            scene.paths = scene.paths.filter((path) => path.startBall.colorKey !== clickedBall.colorKey);
            scene.currentPath = {
                startBall: clickedBall,
                points: [new Phaser.Math.Vector2(clickedBall.x, clickedBall.y)],
                color: clickedBall.colorHex,
                completed: false,
            };

            drawAllPaths(scene);
        }
    },
};

export const { makebuttons, toggleMute, pointerUp, pointerMove, pointerDown } = Controllers;
