import { UI_THEME } from "../assets/uiTheme.js";
import { GameObject, Image, notifyUIInteraction, Text } from "../engine/index.js";

const PANEL_WIDTH = 292;
const PANEL_HEIGHT = 188;
const PANEL_PADDING = 24;
const ROW_HEIGHT = 44;
const HUD_MARGIN = 32;
const MENU_ICON_SIZE = 64;

/**
 * ゲーム画面のカメラに追従するHUD
 */
export class HUDUIView extends GameObject {
  /**
   * @param param0
   * @param param0.menuIconSource ハンバーガーメニューアイコンの画像
   * @param param0.onMenuRequested メニューを開く操作
   */
  constructor({ menuIconSource, onMenuRequested = () => {} }) {
    const view = new createjs.Container();
    super("HUDUIView", view);

    this.remainingTime = 0;
    this.defeatedEnemies = 0;
    this.score = 0;

    this.labels = [];
    this.values = [];

    const rows = [
      ["残り時間", "00:00"],
      ["倒した敵", "0"],
      ["スコア", "0"],
    ];

    // ラベルと値のテキストを生成
    for (const [label, value] of rows) {
      // ラベル
      this.labels.push(
        new Text({
          text: label,
          width: 140,
          height: ROW_HEIGHT,
          font: "600 18px sans-serif",
          color: UI_THEME.textOnDark,
          verticalAlign: "middle",
          outlineColor: "#1a1714",
          outlineWidth: 4,
        }),
      );

      // 値
      this.values.push(
        new Text({
          text: value,
          width: 104,
          height: ROW_HEIGHT,
          font: "700 24px monospace",
          color: UI_THEME.textOnDark,
          textAlign: "right",
          verticalAlign: "middle",
          outlineColor: "#1a1714",
          outlineWidth: 5,
        }),
      );
    }

    // メニューアイコン
    this.menuIcon = new Image({
      source: menuIconSource,
      width: MENU_ICON_SIZE,
      height: MENU_ICON_SIZE,
      imageType: "fit",
      raycastTarget: true,
    });
    this.menuIcon.x = HUD_MARGIN;
    this.menuIcon.y = HUD_MARGIN;
    this.menuIcon.cursor = "pointer";
    this.menuIcon.on("click", () => {
      notifyUIInteraction();
      onMenuRequested();
    });

    // メニューアイコンをHUDに追加
    this.view.addChild(this.menuIcon);

    // ラベルと値をHUDに追加
    this.labels.forEach((label, index) => {
      label.y = PANEL_PADDING + index * ROW_HEIGHT;

      const value = this.values[index];
      value.y = label.y;

      this.view.addChild(label, value);
    });
  }

  /**
   * ビューポートに合わせてHUDを配置する
   * @param width {number} ビューポートの幅
   */
  layout(width) {
    const panelX = Math.max(HUD_MARGIN, width - PANEL_WIDTH - HUD_MARGIN);
    this.labels.forEach((label, index) => {
      label.x = panelX + PANEL_PADDING;
      this.values[index].x = panelX + PANEL_WIDTH - PANEL_PADDING - this.values[index].uiWidth;
    });
  }

  /**
   * 残り時間を設定する
   * @param seconds {number} 残り時間（秒）
   */
  setRemainingTime(seconds) {
    this.remainingTime = Math.max(0, Number.isFinite(seconds) ? seconds : 0);

    // 残り時間を分:秒形式に変換して表示する
    const totalSeconds = Math.ceil(this.remainingTime);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    this.values[0].setText(
      `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`,
    );
  }

  /**
   * 倒した敵の数を設定する
   * @param count {number} 倒した敵の数
   */
  setDefeatedEnemies(count) {
    this.defeatedEnemies = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
    this.values[1].setText(this.defeatedEnemies.toLocaleString("ja-JP"));
  }

  /**
   * スコアを設定する
   * @param score {number} スコア
   */
  setScore(score) {
    this.score = Math.max(0, Math.floor(Number.isFinite(score) ? score : 0));
    this.values[2].setText(this.score.toLocaleString("ja-JP"));
  }
}

/**
 * HUD UIの表示サイズ
 * @type {{width: number, height: number}}
 */
export const HUD_UI_VIEW_SIZE = {
  width: PANEL_WIDTH,
  height: PANEL_HEIGHT,
};
