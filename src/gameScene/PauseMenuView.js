import { UI_BUTTON_COLORS, UI_THEME } from "../assets/uiTheme.js";
import { Button, Slider, Text } from "../engine/index.js";

const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 390;
const BUTTON_WIDTH = 300;
const BUTTON_HEIGHT = 58;
const VIEWPORT_MARGIN = 20;
const VALUE_RIGHT_PADDING = 12;

/**
 * ポーズメニューとオプション画面を表示するオーバーレイ
 */
export class PauseMenuView {
  constructor({
    initialVolume,
    onReturnToTitle,
    onOpenOptions,
    onResume,
    onReturnToMenu,
    onVolumeChanged,
  }) {
    this.view = new createjs.Container();
    this.overlay = new createjs.Shape();
    this.dialog = new createjs.Container();
    this.panel = new createjs.Shape();
    this.menuContent = new createjs.Container();
    this.optionsContent = new createjs.Container();

    this.title = createLabel("メニュー", "700 34px sans-serif");
    this.returnToTitleButton = createButton("タイトルにもどる");
    this.optionsButton = createButton("オプション画面を開く");
    this.resumeButton = createButton("元の画面に戻る");

    this.optionsTitle = createLabel("オプション", "700 34px sans-serif");
    this.volumeLabel = new Text({
      text: "ゲーム音量",
      width: 180,
      height: 36,
      font: "600 22px sans-serif",
      color: UI_THEME.text,
      verticalAlign: "middle",
    });
    this.volumeValue = new Text({
      text: "",
      width: 80,
      height: 36,
      font: "700 22px monospace",
      color: UI_THEME.text,
      textAlign: "right",
      verticalAlign: "middle",
    });
    this.volumeSlider = new Slider({
      minValue: 0,
      maxValue: 1,
      value: initialVolume,
      width: BUTTON_WIDTH,
      height: 44,
      handleSize: 26,
      trackThickness: 10,
      backgroundColor: UI_THEME.surfaceStrong,
      fillColor: UI_THEME.primary,
      handleColor: UI_THEME.text,
    });
    this.backButton = createButton("メニューに戻る");

    this.returnToTitleButton.onClick(onReturnToTitle);
    this.optionsButton.onClick(onOpenOptions);
    this.resumeButton.onClick(onResume);
    this.backButton.onClick(onReturnToMenu);
    this.volumeSlider.onValueChanged((volume) => {
      this.#updateVolumeText(volume);
      onVolumeChanged(volume);
    });

    this.menuContent.addChild(
      this.title,
      this.returnToTitleButton,
      this.optionsButton,
      this.resumeButton,
    );
    this.optionsContent.addChild(
      this.optionsTitle,
      this.volumeLabel,
      this.volumeValue,
      this.volumeSlider,
      this.backButton,
    );
    this.dialog.addChild(this.panel, this.menuContent, this.optionsContent);
    this.view.addChild(this.overlay, this.dialog);

    this.#drawPanel();
    this.#layoutContents();
    this.#updateVolumeText(initialVolume);
    this.show("closed");
  }

  /**
   * 指定されたメニュー状態を表示する
   * @param state closed、menu、optionsのいずれか
   */
  show(state) {
    this.view.visible = state !== "closed";
    this.menuContent.visible = state === "menu";
    this.optionsContent.visible = state === "options";
  }

  /**
   * 表示領域に合わせてオーバーレイを配置する
   */
  layout(width, height) {
    this.overlay.graphics.clear().beginFill(UI_THEME.overlay).drawRect(0, 0, width, height);
    this.overlay.cache(0, 0, width, height);

    // 小さいビューポートでもダイアログ全体が画面内へ収まるよう均等に縮小する
    const dialogLayout = calculatePauseMenuLayout(width, height);
    this.dialog.scaleX = dialogLayout.scale;
    this.dialog.scaleY = dialogLayout.scale;
    this.dialog.x = dialogLayout.x;
    this.dialog.y = dialogLayout.y;
  }

  /**
   * UIイベントと表示要素を破棄する
   */
  dispose() {
    this.returnToTitleButton.dispose();
    this.optionsButton.dispose();
    this.resumeButton.dispose();
    this.volumeSlider.dispose();
    this.backButton.dispose();
    this.view.removeAllChildren();
  }

  /**
   * パネル内の各UIを配置する
   */
  #layoutContents() {
    const centeredX = (PANEL_WIDTH - BUTTON_WIDTH) / 2;

    // メニューとオプション画面のUIをパネル内へ配置する
    this.title.x = (PANEL_WIDTH - this.title.uiWidth) / 2;
    this.title.y = 38;
    [this.returnToTitleButton, this.optionsButton, this.resumeButton].forEach((button, index) => {
      button.x = centeredX;
      button.y = 105 + index * 82;
    });

    // オプション画面のUIをパネル内へ配置する
    this.optionsTitle.x = (PANEL_WIDTH - this.optionsTitle.uiWidth) / 2;
    this.optionsTitle.y = 38;
    this.volumeLabel.x = centeredX;
    this.volumeLabel.y = 120;
    this.volumeValue.x = centeredX + BUTTON_WIDTH - VALUE_RIGHT_PADDING - this.volumeValue.uiWidth;
    this.volumeValue.y = 120;
    this.volumeSlider.x = centeredX;
    this.volumeSlider.y = 162;
    this.backButton.x = centeredX;
    this.backButton.y = 272;
  }

  /**
   * ダイアログ背景をローカル座標で描画する
   */
  #drawPanel() {
    this.panel.graphics
      .clear()
      .beginFill(UI_THEME.surface)
      .drawRoundRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT, 20);
    this.panel.cache(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
  }

  /**
   * 音量のパーセント表示を更新する
   * @param volume 0から1の音量
   */
  #updateVolumeText(volume) {
    this.volumeValue.setText(`${Math.round(volume * 100)}%`);
  }
}

/**
 * ポーズメニュー用ボタンを生成する
 * @param text ボタン文字列
 * @returns {Button}
 */
function createButton(text) {
  return new Button({
    text,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    textColor: UI_THEME.textOnDark,
    normalColor: UI_BUTTON_COLORS.primary.normal,
    hoverColor: UI_BUTTON_COLORS.primary.hover,
    pressedColor: UI_BUTTON_COLORS.primary.pressed,
  });
}

/**
 * ポーズメニュー用テキストを生成する
 * @param text 表示文字列
 * @param font フォント
 * @returns {Text}
 */
function createLabel(text, font) {
  return new Text({ text, font, color: UI_THEME.text });
}

/**
 * ビューポート内にポーズメニューを収める配置を計算する
 * @param width ビューポート幅
 * @param height ビューポート高さ
 * @returns {{scale: number, x: number, y: number}}
 */
export function calculatePauseMenuLayout(width, height) {
  const availableWidth = Math.max(1, width - VIEWPORT_MARGIN * 2);
  const availableHeight = Math.max(1, height - VIEWPORT_MARGIN * 2);
  const scale = Math.min(1, availableWidth / PANEL_WIDTH, availableHeight / PANEL_HEIGHT);

  return {
    scale,
    x: (width - PANEL_WIDTH * scale) / 2,
    y: (height - PANEL_HEIGHT * scale) / 2,
  };
}
