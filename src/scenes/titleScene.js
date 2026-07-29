import { UI_BUTTON_COLORS, UI_THEME } from "../assets/uiTheme.js";
import { Button, notifyUIInteraction, Scene, Text } from "../engine/index.js";

const CREDIT_BUTTON_MARGIN = 24;

/**
 * クレジットボタンを画面左下へ固定する配置を計算する
 * @param height 表示領域の高さ
 * @param buttonHeight ボタンの高さ
 * @returns {{x: number, y: number}}
 */
export function calculateCreditButtonPosition(height, buttonHeight) {
  return {
    x: CREDIT_BUTTON_MARGIN,
    y: Math.max(0, height - buttonHeight - CREDIT_BUTTON_MARGIN),
  };
}

/**
 * ゲームタイトルを表示してメインメニューへ遷移するシーン
 */
export class TitleScene extends Scene {
  constructor({ sceneManager }) {
    super();

    this.sceneManager = sceneManager;
    this.titleText = null;
    this.startText = null;
    this.creditButton = null;
    this.background = null;
    this.startHandler = () => {
      notifyUIInteraction();
      this.sceneManager.changeScene("mainMenu");
    };
  }

  /**
   * タイトル画面を生成する
   */
  initialize() {
    this.background = new createjs.Shape();
    this.titleText = new Text({
      text: "SIMPLE HORDE SURVIVAL",
      font: "32px sans-serif",
      color: UI_THEME.text,
    });
    this.startText = new Text({
      text: "Click to Start",
      font: "20px sans-serif",
      color: UI_THEME.textMuted,
    });
    this.creditButton = new Button({
      text: "クレジット",
      width: 180,
      height: 52,
      font: "600 20px sans-serif",
      normalColor: UI_BUTTON_COLORS.secondary.normal,
      hoverColor: UI_BUTTON_COLORS.secondary.hover,
      pressedColor: UI_BUTTON_COLORS.secondary.pressed,
    });

    // クレジットボタンとタイトル開始操作が同時に反応しないよう個別に入力を登録
    this.background.on("click", this.startHandler);
    this.titleText.on("click", this.startHandler);
    this.startText.on("click", this.startHandler);
    this.creditButton.onClick(() => this.sceneManager.changeScene("credits"));

    this.root.addChild(this.background, this.titleText, this.startText, this.creditButton);
    this.layout();
  }

  /**
   * 開始案内を点滅させる
   */
  tick() {
    const alphaSpeed = 2;
    this.startText.alpha = 0.5 + Math.sin((createjs.Ticker.getTime() / 1000) * alphaSpeed) * 0.5;
  }

  /**
   * 表示領域の変更を反映する
   */
  resize(width, height) {
    super.resize(width, height);
    this.layout();
  }

  /**
   * タイトルUIを配置する
   */
  layout() {
    if (this.background === null) {
      return;
    }

    this.background.graphics
      .clear()
      .beginFill(UI_THEME.backgroundDeep)
      .drawRect(0, 0, this.width, this.height);
    this.titleText.x = (this.width - this.titleText.uiWidth) / 2;
    this.titleText.y = this.height * 0.3;
    this.startText.x = (this.width - this.startText.uiWidth) / 2;
    this.startText.y = this.height * 0.65;
    const creditButtonPosition = calculateCreditButtonPosition(
      this.height,
      this.creditButton.uiHeight,
    );
    this.creditButton.x = creditButtonPosition.x;
    this.creditButton.y = creditButtonPosition.y;
    this.background.cache(0, 0, this.width, this.height);
  }
}
