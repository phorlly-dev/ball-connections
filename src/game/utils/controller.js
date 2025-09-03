import Payloads from "./payload";
import States from "./state";

const Controllers = {
    buttons(scene) {
        const resetBtn = States.getById("reset-btn");
        const hintBtn = States.getById("hint-btn");

        resetBtn.addEventListener("click", () => Payloads.initLevel(scene, scene.currentLevel));
        hintBtn.addEventListener("click", () => {
            States.setStatus("💡 Connect pairs without crossing lines or other balls.");
            States.setDelay({ scene, callback: () => States.setStatus("Connect the matching colors!") });
        });
    },
    handlePointerUp(scene, pointer) {
        if (!scene.isDragging || !scene.currentPath) return;
        scene.isDragging = false;
        const endBall = Payloads.getBallAt(scene, pointer.x, pointer.y);

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
            Payloads.updateBallStyle(scene.currentPath.startBall);
            Payloads.updateBallStyle(endBall);
            Payloads.checkCompletion(scene, {
                startBall: scene.currentPath.startBall,
                endBall,
                color: scene.currentPath.color,
            });
        } else {
            if (endBall) States.setStatus("❌ Cannot connect different colors!", "error");
            States.setDelay({ scene, delay: 5000, callback: () => States.setStatus("Connect the matching colors!") });
        }

        scene.currentPath = null;
        Payloads.drawAllPaths(scene);
    },
    handlePointerMove(scene, pointer) {
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
            Payloads.cancelCurrentPath(scene, "❌ Cannot hit the boundary!");
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

                const thickness = 20;
                const rect = Phaser.Geom.Rectangle.FromPoints([seg.getPointA(), seg.getPointB()]);
                Phaser.Geom.Rectangle.Inflate(rect, thickness, thickness);

                if (Phaser.Geom.Intersects.LineToRectangle(newSegment, rect)) {
                    Payloads.cancelCurrentPath(scene, "❌ Cannot cross another path!");
                    return; // ⬅️ stop here
                }
            }
        }

        // --- Block hitting other balls ---
        for (const ball of scene.balls) {
            if (ball.id === scene.currentPath.startBall.id) continue;

            const isPartner = ball.colorKey === scene.currentPath.startBall.colorKey;

            // distance = ball radius + line thickness + extra margin
            const padding = 20;
            const ballCircle = new Phaser.Geom.Circle(ball.x, ball.y, scene.ballRadius + padding);

            if (!isPartner && Phaser.Geom.Intersects.LineToCircle(newSegment, ballCircle)) {
                Payloads.cancelCurrentPath(scene, "❌ Cannot pass through or\ntoo close to another ball!");
                return; // ⬅️ stop here
            }
        }

        // --- If valid, push new point ---
        if (newPoint) scene.currentPath.points.push(newPoint);
        Payloads.drawAllPaths(scene);
    },
    handlePointerDown(scene, pointer) {
        const clickedBall = Payloads.getBallAt(scene, pointer.x, pointer.y);
        if (!clickedBall) return;

        // --- NEW: Disconnect if already connected ---
        if (clickedBall.connected) {
            Payloads.disconnectPath(scene, clickedBall);
            return;
        }

        // --- existing logic for starting a new path ---
        if (!clickedBall.connected) {
            scene.isDragging = true;

            // If scene ball's partner was already connected, break that path
            const partner = scene.balls.find((b) => b.colorKey === clickedBall.colorKey && b.id !== clickedBall.id);
            if (partner && partner.connected) Payloads.disconnectPath(scene, partner);

            scene.paths = scene.paths.filter((path) => path.startBall.colorKey !== clickedBall.colorKey);
            scene.currentPath = {
                startBall: clickedBall,
                points: [new Phaser.Math.Vector2(clickedBall.x, clickedBall.y)],
                color: clickedBall.colorHex,
                completed: false,
            };
            Payloads.drawAllPaths(scene);
        }
    },
};

export default Controllers;
