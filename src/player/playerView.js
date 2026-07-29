import { Image, Slider, Text } from "../engine/index.js";

const PLAYER_RADIUS = 24;
const PLAYER_SIZE = PLAYER_RADIUS * 2;
const EXPERIENCE_BAR_WIDTH = 480;
const EXPERIENCE_BAR_HEIGHT = 32;
const EXPERIENCE_BAR_TOP = 20;
const HUD_MARGIN = 32;
const HEART_SIZE = 30;
const HEART_GAP = 4;
const DEFAULT_EXPERIENCE_TO_NEXT_LEVEL = 100;
const EXPERIENCE_BAR_FOLLOW_SPEED = 10;

/**
 * Playerのワールド表示と固定HUDを管理する描画クラス
 */
export class PlayerView {
  constructor() {
    this.statusController = null;
    this.renderedHealth = null;
    this.renderedExperience = null;
    this.renderedExperienceToNextLevel = null;
    this.renderedLevel = null;
    this.displayedExperience = 0;
    this.playerDisplay = new createjs.Container();
    this.hudView = new createjs.Container();

    this.playerImage = new Image({
      source: null,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      imageType: "fit",
      raycastTarget: false,
      fallback: {
        shape: "circle",
        fillColor: "#5dd6ff",
        strokeColor: "#dff8ff",
        strokeWidth: 4,
      },
    });
    this.playerImage.x = -PLAYER_RADIUS;
    this.playerImage.y = -PLAYER_RADIUS;

    this.experienceBar = new Slider({
      minValue: 0,
      maxValue: DEFAULT_EXPERIENCE_TO_NEXT_LEVEL,
      value: 0,
      width: EXPERIENCE_BAR_WIDTH,
      height: EXPERIENCE_BAR_HEIGHT,
      handleSize: 0,
      trackThickness: 16,
      backgroundColor: "#243247",
      fillColor: "#67e8a5",
      disabledColor: "#67e8a5",
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

    this.levelText = new Text({
      text: "Lv. 1",
      width: 72,
      height: EXPERIENCE_BAR_HEIGHT,
      font: "700 12px sans-serif",
      color: "#ffffff",
      verticalAlign: "middle",
    });

    this.hearts = new createjs.Container();
    this.playerDisplay.mouseEnabled = false;
    this.hudView.mouseEnabled = false;
    this.playerDisplay.addChild(this.playerImage);
    this.hudView.addChild(this.experienceBar, this.experienceText, this.levelText, this.hearts);
  }

  /**
   * 表示対象のステータスコンポーネントを設定する
   * @param statusController {import("./playerStatusController.js").PlayerStatusController}
   */
  bind(statusController) {
    this.statusController = statusController;
    this.displayedExperience = statusController.experience;
    this.sync(0);
  }

  /**
   * ステータスコンポーネントの現在値を表示へ反映する
   */
  sync(deltaTime = 0) {
    if (this.statusController === null) {
      return;
    }

    if (
      this.renderedExperience !== this.statusController.experience ||
      this.renderedExperienceToNextLevel !== this.statusController.experienceToNextLevel
    ) {
      const { experience, experienceToNextLevel } = this.statusController;
      this.experienceBar.setRange(0, experienceToNextLevel);
      this.experienceText.setText(
        `EXP ${experience.toLocaleString("ja-JP")} / ${experienceToNextLevel.toLocaleString("ja-JP")}`,
      );
      this.renderedExperience = experience;
      this.renderedExperienceToNextLevel = experienceToNextLevel;
    }

    const followAmount = 1 - Math.exp(-EXPERIENCE_BAR_FOLLOW_SPEED * Math.max(0, deltaTime));
    this.displayedExperience +=
      (this.statusController.experience - this.displayedExperience) * followAmount;
    if (Math.abs(this.statusController.experience - this.displayedExperience) < 0.01) {
      this.displayedExperience = this.statusController.experience;
    }
    this.experienceBar.setValueWithoutNotify(this.displayedExperience);

    if (this.renderedLevel !== this.statusController.level) {
      this.levelText.setText(`Lv. ${this.statusController.level}`);
      this.renderedLevel = this.statusController.level;
    }

    if (
      this.renderedHealth !== this.statusController.health ||
      this.renderedMaxHealth !== this.statusController.maxHealth
    ) {
      this.#drawHearts(this.statusController.health, this.statusController.maxHealth);
      this.renderedHealth = this.statusController.health;
      this.renderedMaxHealth = this.statusController.maxHealth;
    }
  }

  /**
   * 固定HUDをビューポートに合わせて配置する
   * @param width {number} ビューポートの幅
   */
  layout(width) {
    const barWidth = Math.min(EXPERIENCE_BAR_WIDTH, Math.max(0, width - HUD_MARGIN * 2));
    const barX = Math.max(0, (width - barWidth) / 2);

    this.experienceBar.setSize(barWidth, EXPERIENCE_BAR_HEIGHT);
    this.experienceBar.x = barX;
    this.experienceBar.y = EXPERIENCE_BAR_TOP;
    this.experienceText.setSize(barWidth, EXPERIENCE_BAR_HEIGHT);
    this.experienceText.x = barX;
    this.experienceText.y = EXPERIENCE_BAR_TOP;
    this.levelText.x = barX + 8;
    this.levelText.y = EXPERIENCE_BAR_TOP;
    this.hearts.x = barX;
    this.hearts.y = EXPERIENCE_BAR_TOP + EXPERIENCE_BAR_HEIGHT + 4;
  }

  /**
   * 表示オブジェクトを破棄する
   */
  destroy() {
    this.playerDisplay.removeAllEventListeners();
    this.playerDisplay.parent?.removeChild(this.playerDisplay);
    this.hudView.removeAllEventListeners();
    this.hudView.parent?.removeChild(this.hudView);
    this.statusController = null;
  }

  #drawHearts(health, maxHealth) {
    this.hearts.removeAllChildren();

    for (let index = 0; index < maxHealth; index += 1) {
      // 汎用Textを使い、StageGLでもHPが確実に表示されるようキャッシュする
      const heart = new Text({
        text: index < health ? "♥" : "♡",
        width: HEART_SIZE,
        height: HEART_SIZE + 4,
        font: `bold ${HEART_SIZE}px sans-serif`,
        color: index < health ? "#ff5c70" : "#7f3945",
      });
      heart.x = index * (HEART_SIZE + HEART_GAP);
      this.hearts.addChild(heart);
    }
  }
}
