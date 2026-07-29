import { HUDUIView } from "../GameScene/HUDUIView.js";
import { Scene } from "../engine/index.js";

export class GameScene extends Scene {
  constructor({ sceneManager, assetManager }) {
    super();

    this.sceneManager = sceneManager;
    this.assetManager = assetManager;
    this.hud = null;
  }

  initialize() {
    this.hud = new HUDUIView({
      menuIconSource: this.assetManager.get("menuIcon"),
    });
    this.hud.setRemainingTime(180);
    this.hud.setDefeatedEnemies(0);
    this.hud.setScore(0);
    this.hud.setExperience(0, 100);
    this.root.addChild(this.hud.view);
    this.layout();
  }

  tick() {}

  exit() {
    this.hud?.destroy();
    this.hud = null;
  }

  resize(width, height) {
    super.resize(width, height);
    this.layout();
  }

  layout() {
    if (this.hud === null) {
      return;
    }

    this.hud.transform.x = 0;
    this.hud.transform.y = 0;
    this.hud.layout(this.width);
  }
}
