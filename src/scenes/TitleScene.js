import { Scene, Text } from "../engine/index.js";

export class TitleScene extends Scene {
  constructor({ sceneManager, assetManager }) {
    super();

    this.sceneManager = sceneManager;
    this.assetManager = assetManager;

    this.titleText = null;
    this.startText = null;
    this.background = null;
    this.mouseDownHandler = () => this.sceneManager.changeScene("game");
  }

  initialize() {
    this.background = new createjs.Shape();

    this.titleText = new Text({
      text: "SIMPLE HORDE SURVIVAL",
      font: "32px sans-serif",
    });

    this.startText = new Text({
      text: "Click to Start",
      font: "20px sans-serif",
    });
    this.startText.cursor = "pointer";

    this.startText.on("click", () => {
      this.sceneManager.changeScene("game");
    });

    this.root.addChild(this.background, this.titleText, this.startText);
    window.addEventListener("mousedown", this.mouseDownHandler);

    this.layout();
  }

  tick() {
    const alphaSpeed = 2;

    this.startText.alpha = 0.5 + Math.sin((createjs.Ticker.getTime() / 1000) * alphaSpeed) * 0.5;
  }

  exit() {
    window.removeEventListener("mousedown", this.mouseDownHandler);
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

    this.background.graphics.clear().beginFill("#202030").drawRect(0, 0, this.width, this.height);

    this.titleText.x = (this.width - this.titleText.uiWidth) / 2;
    this.titleText.y = this.height * 0.3;

    this.startText.x = (this.width - this.startText.uiWidth) / 2;
    this.startText.y = this.height * 0.65;

    this.background.cache(0, 0, this.width, this.height);
  }
}
