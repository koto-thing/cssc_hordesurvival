import { Image, Slider, Text } from "../engine/index.js";
import { LevelUpCelebrationView } from "./LevelUpCelebrationView.js";

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
const HIT_FLASH_DURATION = 0.32;
const HIT_FLASH_INTERVAL = 0.06;
const HURT_HEART_SIZE = 36;
const HURT_HEART_DURATION = 0.65;
const HURT_HEART_START_COLOR = [144, 74, 214];
const HURT_HEART_END_COLOR = [0, 0, 0];

/**
 * 壊れたハートの経過率から紫から黒への表示色を求める
 * @param progress {number} 0から1の演出経過率
 * @returns {string} 16進数カラーコード
 */
export function calculateHurtHeartColor(progress) {
  const ratio = Math.min(1, Math.max(0, Number(progress) || 0));
  const channels = HURT_HEART_START_COLOR.map((start, index) =>
    Math.round(start + (HURT_HEART_END_COLOR[index] - start) * ratio),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Playerのワールド表示と固定HUDを管理する描画クラス
 */
export class PlayerView {
  constructor({ color = "#5dd6ff", hurtBreakIconSource = null } = {}) {
    this.statusController = null;
    this.playerColor = color;
    this.hurtBreakIconSource = hurtBreakIconSource;
    this.hitFlashRemaining = 0;
    this.hurtHeartEntries = [];
    this.renderedHealth = null;
    this.renderedExperience = null;
    this.renderedExperienceToNextLevel = null;
    this.renderedLevel = null;
    this.displayedExperience = 0;
    this.playerDisplay = new createjs.Container();
    this.hudView = new createjs.Container();
    this.levelUpCelebration = new LevelUpCelebrationView();

    // プレイヤーの表示は画像とフォールバック図形の両方を用意し、画像が読み込まれない場合でも色付き円で表示されるようにする
    this.playerImage = new Image({
      source: null,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      imageType: "fit",
      raycastTarget: false,
      fallback: {
        shape: "circle",
        fillColor: color,
        strokeColor: "#dff8ff",
        strokeWidth: 4,
      },
    });
    this.playerImage.x = -PLAYER_RADIUS;
    this.playerImage.y = -PLAYER_RADIUS;

    // 経験値バーはスライダーを使い、値の変化に応じてバーが伸びるようにする
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

    // 経験値バーの上に表示するテキストはTextを使い、StageGLでも確実に表示されるようキャッシュする
    this.experienceText = new Text({
      text: "",
      width: EXPERIENCE_BAR_WIDTH,
      height: EXPERIENCE_BAR_HEIGHT,
      font: "700 16px sans-serif",
      color: "#ffffff",
      textAlign: "center",
      verticalAlign: "middle",
    });

    // レベル表示はTextを使い、StageGLでも確実に表示されるようキャッシュする
    this.levelText = new Text({
      text: "Lv. 1",
      width: 72,
      height: EXPERIENCE_BAR_HEIGHT,
      font: "700 12px sans-serif",
      color: "#ffffff",
      verticalAlign: "middle",
    });

    // ハート表示はContainerを使い、Textでハートを描画することでStageGLでも確実に表示されるようにする
    this.hearts = new createjs.Container();
    this.hurtFeedback = new createjs.Container();
    this.playerDisplay.mouseEnabled = false;
    this.hudView.mouseEnabled = false;
    this.playerDisplay.addChild(this.levelUpCelebration.view, this.playerImage, this.hurtFeedback);
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

    // 経験値バーの範囲とテキストを更新する
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

    // 経験値バーの表示値を滑らかに追従させる
    const followAmount = 1 - Math.exp(-EXPERIENCE_BAR_FOLLOW_SPEED * Math.max(0, deltaTime));
    this.displayedExperience +=
      (this.statusController.experience - this.displayedExperience) * followAmount;
    if (Math.abs(this.statusController.experience - this.displayedExperience) < 0.01) {
      this.displayedExperience = this.statusController.experience;
    }
    this.experienceBar.setValueWithoutNotify(this.displayedExperience);

    // レベル表示を更新する
    if (this.renderedLevel !== this.statusController.level) {
      this.levelText.setText(`Lv. ${this.statusController.level}`);
      this.renderedLevel = this.statusController.level;
    }

    // ハート表示を更新する
    if (
      this.renderedHealth !== this.statusController.health ||
      this.renderedMaxHealth !== this.statusController.maxHealth
    ) {
      this.#drawHearts(this.statusController.health, this.statusController.maxHealth);
      this.renderedHealth = this.statusController.health;
      this.renderedMaxHealth = this.statusController.maxHealth;
    }

    // 被弾時の赤点滅と割れたハート演出を進める
    this.#tickHitFeedback(deltaTime);
  }

  /**
   * 被弾時の赤点滅と割れたハート演出を開始する
   */
  playHitFeedback() {
    this.hitFlashRemaining = HIT_FLASH_DURATION;
    this.#setPlayerColor("#ff3030");
    this.#createBrokenHeart();
  }

  /**
   * プレイヤーの周囲でレベルアップ演出を再生する
   */
  playLevelUpFeedback() {
    this.levelUpCelebration.play();
  }

  /**
   * ゲーム停止中にも必要なワールド演出を進める
   * @param deltaTime 前フレームからの経過時間
   */
  tickPresentation(deltaTime) {
    this.levelUpCelebration.tick(deltaTime);
  }

  /**
   * 固定HUDをビューポートに合わせて配置する
   * @param width {number} ビューポートの幅
   */
  layout(width) {
    const barWidth = Math.min(EXPERIENCE_BAR_WIDTH, Math.max(0, width - HUD_MARGIN * 2));
    const barX = Math.max(0, (width - barWidth) / 2);

    // 経験値バーとレベル表示の位置を更新する
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
    this.levelUpCelebration.destroy();
    this.playerDisplay.removeAllEventListeners();
    this.playerDisplay.parent?.removeChild(this.playerDisplay);
    this.hudView.removeAllEventListeners();
    this.hudView.parent?.removeChild(this.hudView);
    this.statusController = null;
    this.hurtHeartEntries = [];
  }

  #drawHearts(health, maxHealth) {
    this.hearts.removeAllChildren();

    // ハートの表示は最大体力分のハートを描画し、現在体力分は塗りつぶし、残りは空ハートにする
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

  #tickHitFeedback(deltaTime) {
    const dt = Math.max(0, Number(deltaTime) || 0);

    // 被弾時の赤点滅を進める
    if (this.hitFlashRemaining > 0) {
      this.hitFlashRemaining = Math.max(0, this.hitFlashRemaining - dt);
      const flashIndex = Math.floor(this.hitFlashRemaining / HIT_FLASH_INTERVAL);
      this.#setPlayerColor(flashIndex % 2 === 0 ? "#ff3030" : this.playerColor);
    } else {
      this.#setPlayerColor(this.playerColor);
    }

    // 割れたハート演出を進める
    for (let index = this.hurtHeartEntries.length - 1; index >= 0; index -= 1) {
      const entry = this.hurtHeartEntries[index];
      entry.age += dt;
      const progress = Math.min(1, entry.age / HURT_HEART_DURATION);
      const fallDistance = 34 * progress + 22 * progress * progress;
      entry.left.x = -HURT_HEART_SIZE / 2 - 14 * progress;
      entry.right.x = -HURT_HEART_SIZE / 2 + 14 * progress;
      entry.left.y = -PLAYER_RADIUS - HURT_HEART_SIZE - fallDistance;
      entry.right.y = entry.left.y;
      entry.left.rotation = -28 * progress;
      entry.right.rotation = 28 * progress;
      entry.container.alpha = 1 - progress;
      const heartColor = calculateHurtHeartColor(progress);
      entry.left.setColor(heartColor);
      entry.right.setColor(heartColor);

      if (entry.age >= HURT_HEART_DURATION) {
        this.hurtFeedback.removeChild(entry.container);
        this.hurtHeartEntries.splice(index, 1);
      }
    }
  }

  /**
   * プレイヤーの表示色を更新する
   * @param color 表示色
   */
  #setPlayerColor(color) {
    if (this.playerImage.color === color && this.playerImage.fallback.fillColor === color) {
      return;
    }

    // 画像とフォールバック図形のどちらでも同じ色変化になるよう更新する
    this.playerImage.fallback.fillColor = color;
    this.playerImage.setColor(color);
  }

  /**
   * 割れたハートの演出を作成する
   */
  #createBrokenHeart() {
    const container = new createjs.Container();
    const left = this.#createHeartHalf(true);
    const right = this.#createHeartHalf(false);
    left.x = -HURT_HEART_SIZE / 2;
    right.x = -HURT_HEART_SIZE / 2;
    left.y = -PLAYER_RADIUS - HURT_HEART_SIZE;
    right.y = left.y;
    container.addChild(left, right);
    this.hurtFeedback.addChild(container);
    this.hurtHeartEntries.push({ container, left, right, age: 0 });
  }

  /**
   * 割れたハートの半分を作成する
   * @param isLeft {boolean} 左半分かどうか
   * @returns {Image} 割れたハートの半分の表示オブジェクト
   */
  #createHeartHalf(isLeft) {
    const heart = new Image({
      source: this.hurtBreakIconSource,
      width: HURT_HEART_SIZE,
      height: HURT_HEART_SIZE,
      imageType: "fit",
      color: calculateHurtHeartColor(0),
      raycastTarget: false,
      fallback: {
        shape: "rect",
        fillColor: "#df5656",
      },
    });
    const mask = new createjs.Shape();
    const halfWidth = HURT_HEART_SIZE / 2;
    mask.graphics
      .beginFill("#000000")
      .drawRect(isLeft ? 0 : halfWidth, 0, halfWidth, HURT_HEART_SIZE);
    heart.mask = mask;
    return heart;
  }
}
