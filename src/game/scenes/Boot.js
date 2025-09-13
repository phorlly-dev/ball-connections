import { boot, image, preload } from "../consts";

class Boot extends Phaser.Scene {
    constructor() {
        super(boot);
    }

    preload() {
        this.load.setPath("assets");
        this.load.image(image.key.bg, image.value.bg);
    }

    create() {
        this.scene.start(preload);
    }
}

export default Boot;
