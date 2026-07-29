import { Component, MathUtil } from "../engine/index.js";

const DEFAULT_HEALTH = 3;
const DEFAULT_EXPERIENCE_TO_NEXT_LEVEL = 100;

/**
 * Playerの体力と経験値に関する内部処理を管理するコンポーネント
 */
export class PlayerStatusController extends Component {
  constructor({
    health = DEFAULT_HEALTH,
    maxHealth = health,
    experience = 0,
    experienceToNextLevel = DEFAULT_EXPERIENCE_TO_NEXT_LEVEL,
  } = {}) {
    super();

    this.maxHealth = MathUtil.positiveInteger(maxHealth, DEFAULT_HEALTH);
    this.health = MathUtil.clampInteger(health, 0, this.maxHealth);
    this.experienceToNextLevel = MathUtil.positiveInteger(
      experienceToNextLevel,
      DEFAULT_EXPERIENCE_TO_NEXT_LEVEL,
    );
    this.experience = MathUtil.clampInteger(experience, 0, this.experienceToNextLevel);
  }

  /**
   * 体力を設定する
   * @param health {number} 設定する体力
   */
  setHealth(health) {
    this.health = MathUtil.clampInteger(health, 0, this.maxHealth);
  }

  /**
   * 体力を減らす
   * @param amount {number} 減らす量
   */
  damage(amount = 1) {
    this.setHealth(this.health - MathUtil.nonNegativeInteger(amount));
  }

  /**
   * 体力を回復する
   * @param amount {number} 回復する量
   */
  heal(amount = 1) {
    this.setHealth(this.health + MathUtil.nonNegativeInteger(amount));
  }

  /**
   * 経験値を設定する
   * @param experience {number} 設定する経験値
   * @param experienceToNextLevel {number} 次のレベルまでに必要な経験値
   */
  setExperience(experience, experienceToNextLevel = this.experienceToNextLevel) {
    this.experienceToNextLevel = MathUtil.positiveInteger(
      experienceToNextLevel,
      this.experienceToNextLevel,
    );
    this.experience = MathUtil.clampInteger(experience, 0, this.experienceToNextLevel);
  }
}
