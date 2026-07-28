import { Scene } from '../engine/index.js';

export class GameScene extends Scene {
    constructor({ sceneManager, assetManager }) {
        super();

        this.sceneManager = sceneManager;
        this.assetManager = assetManager;
    }

    initialize() {

    }

    tick() {

    }

    exit() {

    }

    resize(width, height) {
        super.resize(width, height);
    }
}