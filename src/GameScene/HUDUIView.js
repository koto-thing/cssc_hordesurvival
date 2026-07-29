import { GameObject, Image, Slider, Text } from "../engine/index.js";

const PANEL_WIDTH = 292;
const PANEL_HEIGHT = 188;
const PANEL_PADDING = 24;
const ROW_HEIGHT = 44;
const HUD_MARGIN = 32;
const MENU_ICON_SIZE = 64;
const EXPERIENCE_BAR_WIDTH = 480;
const EXPERIENCE_BAR_HEIGHT = 32;
const EXPERIENCE_BAR_TOP = 20;

/**
 * ゲーム画面のカメラに追従するHUD
 */
export class HUDUIView extends GameObject {
  /**
   * @param param0
   * @param param0.menuIconSource ハンバーガーメニューアイコンの画像
   */
  constructor({ menuIconSource }) {
    const view = new createjs.Container();
    super("HUDUIView", view);

    this.remainingTime = 0;
    this.defeatedEnemies = 0;
    this.score = 0;
    this.experience = 0;
    this.experienceToNextLevel = 100;

    this.labels = [];
    this.values = [];

    const rows = [
      ["残り時間", "00:00"],
      ["倒した敵", "0"],
      ["スコア", "0"],
    ];

    for (const [label, value] of rows) {
      this.labels.push(
        new Text({
          text: label,
          width: 140,
          height: ROW_HEIGHT,
          font: "600 18px sans-serif",
          color: "#b8c5d6",
          verticalAlign: "middle",
        }),
      );

      this.values.push(
        new Text({
          text: value,
          width: 104,
          height: ROW_HEIGHT,
          font: "700 24px monospace",
          color: "#ffffff",
          textAlign: "right",
          verticalAlign: "middle",
        }),
      );
    }

    this.menuIcon = new Image({
      source: menuIconSource,
      width: MENU_ICON_SIZE,
      height: MENU_ICON_SIZE,
      imageType: "fit",
      raycastTarget: false,
    });
    this.menuIcon.x = HUD_MARGIN;
    this.menuIcon.y = HUD_MARGIN;

    this.experienceBar = new Slider({
      minValue: 0,
      maxValue: this.experienceToNextLevel,
      value: this.experience,
      width: EXPERIENCE_BAR_WIDTH,
      height: EXPERIENCE_BAR_HEIGHT,
      handleSize: 0,
      trackThickness: 16,
      backgroundColor: "#243247",
      fillColor: "#67e8a5",
    });
    this.experienceBar.setInteractable(false);

    this.experienceText = new Text({
      text: "",
      width: EXPERIENCE_BAR_WIDTH,
      height: EXPERIENCE_BAR_HEIGHT,
      font: "700 16px sans-serif",
      color: "#ffffff",
      textAlign: "center",
      verticalAlign: "middle",
    });
    this.updateExperienceText();

    this.view.mouseEnabled = false;
    this.view.addChild(this.menuIcon, this.experienceBar, this.experienceText);

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
    const experienceBarWidth = Math.min(EXPERIENCE_BAR_WIDTH, Math.max(0, width - HUD_MARGIN * 2));
    const experienceBarX = Math.max(0, (width - experienceBarWidth) / 2);

    this.experienceBar.setSize(experienceBarWidth, EXPERIENCE_BAR_HEIGHT);
    this.experienceBar.x = experienceBarX;
    this.experienceBar.y = EXPERIENCE_BAR_TOP;
    this.experienceText.setSize(experienceBarWidth, EXPERIENCE_BAR_HEIGHT);
    this.experienceText.x = experienceBarX;
    this.experienceText.y = EXPERIENCE_BAR_TOP;

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

  /**
   * 現在の経験値と次のレベルに必要な経験値を設定する
   * @param experience {number} 現在の経験値
   * @param experienceToNextLevel {number} 次のレベルに必要な経験値
   */
  setExperience(experience, experienceToNextLevel = this.experienceToNextLevel) {
    this.experienceToNextLevel = Math.max(
      1,
      Math.floor(Number.isFinite(experienceToNextLevel) ? experienceToNextLevel : 1),
    );
    this.experience = Math.min(
      this.experienceToNextLevel,
      Math.max(0, Math.floor(Number.isFinite(experience) ? experience : 0)),
    );

    this.experienceBar.setRange(0, this.experienceToNextLevel);
    this.experienceBar.setValueWithoutNotify(this.experience);
    this.updateExperienceText();
  }

  updateExperienceText() {
    this.experienceText.setText(
      `EXP ${this.experience.toLocaleString("ja-JP")} / ${this.experienceToNextLevel.toLocaleString("ja-JP")}`,
    );
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
