import { Scene } from "../engine/index.js";

export class TitleScene extends Scene {
    constructor({ sceneManager, assetManager }) {
        super();

        this.sceneManager = sceneManager;
        this.assetManager = assetManager;

        this.titleText = null;
        this.startText = null;
        this.background = null;
    }

    initialize() {
        this.background = new createjs.Shape();

        this.titleText = new createjs.Text(
            "SIMPLE SHOOTING",
            "32px sans-serif",
            "#ffffff",
        );

        this.titleText.textAlign = "center";

        this.startText = new createjs.Text(
            "Click to Start",
            "20px sans-serif",
            "#ffffff",
        );

        this.startText.textAlign = "center";
        this.startText.cursor = "pointer";

        this.startText.on("click", () => {
            this.sceneManager.changeScene("game");
        });

        this.root.addChild(
            this.background,
            this.titleText,
            this.startText,
        );

        this.layout();
    }

    tick() {
        const alphaSpeed = 2;

        this.startText.alpha =
            0.5 + Math.sin(createjs.Ticker.getTime() / 1000 * alphaSpeed) * 0.5;

        window.addEventListener("mousedown", (e) => this.sceneManager.changeScene("game"));
    }

    exit() {
        console.log("Exiting TitleScene");
    }

    resize(width, height) {
        super.resize(width, height);
        this.layout();
    }

    layout() {
        if (this.background === null) {
            return;
        }

        this.background.graphics
            .clear()
            .beginFill("#202030")
            .drawRect(0, 0, this.width, this.height);

        this.titleText.x = this.width / 2;
        this.titleText.y = this.height * 0.3;

        this.startText.x = this.width / 2;
        this.startText.y = this.height * 0.65;

        this.background.cache(0, 0, this.width, this.height);
        this.#cacheCenteredText(this.titleText, 40);
        this.#cacheCenteredText(this.startText, 28);
    }
    
    /**
     * StageGLでTextを表示するため、中央揃えの文字をテクスチャ化する
     * @param text {createjs.Text} キャッシュするテキスト
     * @param height {number} キャッシュ領域の高さ
     */
    #cacheCenteredText(text, height) {
        const width = Math.ceil(text.getMeasuredWidth());
        text.cache(-width / 2, 0, width, height);
    }
}