import { UI_BUTTON_COLORS, UI_THEME } from "../assets/uiTheme.js";
import { Button, Scene, Text } from "../engine/index.js";

const BACK_BUTTON_MARGIN = 24;

/**
 * クレジット表記を表示するシーン
 */
export class CreditsScene extends Scene {
  constructor({ sceneManager }) {
    super();

    this.sceneManager = sceneManager;
    this.background = null;
    this.heading = null;
    this.credits = null;
    this.backButton = null;
  }

  /**
   * クレジット画面を生成する
   */
  initialize() {
    this.background = new createjs.Shape();
    this.heading = new Text({
      text: "クレジット",
      width: 480,
      height: 64,
      font: "700 36px sans-serif",
      color: UI_THEME.text,
      textAlign: "center",
      verticalAlign: "middle",
    });
    this.credits = new Text({
      text: "スライム - みかづき\nBGM - もみじば",
      width: 480,
      height: 120,
      font: "600 24px sans-serif",
      color: UI_THEME.textMuted,
      textAlign: "center",
      verticalAlign: "middle",
      lineHeight: 42,
    });
    this.backButton = new Button({
      text: "← タイトルへ戻る",
      width: 220,
      height: 56,
      font: "600 20px sans-serif",
      normalColor: UI_BUTTON_COLORS.secondary.normal,
      hoverColor: UI_BUTTON_COLORS.secondary.hover,
      pressedColor: UI_BUTTON_COLORS.secondary.pressed,
    });
    this.backButton.onClick(() => this.sceneManager.changeScene("title"));

    this.root.addChild(this.background, this.heading, this.credits, this.backButton);
    this.layout();
  }

  /**
   * 表示領域の変更を反映する
   */
  resize(width, height) {
    super.resize(width, height);
    this.layout();
  }

  /**
   * クレジットUIを配置する
   */
  layout() {
    if (this.background === null) {
      return;
    }

    // 背景を描画してキャッシュする
    this.background.graphics
      .clear()
      .beginFill(UI_THEME.backgroundDeep)
      .drawRect(0, 0, this.width, this.height);
    this.background.cache(0, 0, this.width, this.height);

    // UIを配置する
    this.heading.x = (this.width - this.heading.uiWidth) / 2;
    this.heading.y = this.height * 0.25;
    this.credits.x = (this.width - this.credits.uiWidth) / 2;
    this.credits.y = this.height * 0.43;
    this.backButton.x = BACK_BUTTON_MARGIN;
    this.backButton.y = BACK_BUTTON_MARGIN;
  }
}
