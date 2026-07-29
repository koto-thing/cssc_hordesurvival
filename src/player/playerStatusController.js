import { Component, MathUtil } from "../engine/index.js";

const DEFAULT_HEALTH = 3;
const DEFAULT_EXPERIENCE_TO_NEXT_LEVEL = 100;
const DEFAULT_INVULNERABILITY_DURATION = 1;

/**
 * Playerの体力と経験値に関する内部処理を管理するコンポーネント
 */
export class PlayerStatusController extends Component {
  constructor({
    health = DEFAULT_HEALTH,
    maxHealth = health,
    experience = 0,
    experienceToNextLevel = DEFAULT_EXPERIENCE_TO_NEXT_LEVEL,
    level = 1,
    invulnerabilityDuration = DEFAULT_INVULNERABILITY_DURATION,
  } = {}) {
    super();

    this.maxHealth = MathUtil.positiveInteger(maxHealth, DEFAULT_HEALTH);
    this.health = MathUtil.clampInteger(health, 0, this.maxHealth);
    this.experienceToNextLevel = MathUtil.positiveInteger(
      experienceToNextLevel,
      DEFAULT_EXPERIENCE_TO_NEXT_LEVEL,
    );
    this.experience = MathUtil.clampInteger(experience, 0, this.experienceToNextLevel);
    this.level = MathUtil.positiveInteger(level, 1);
    this.invulnerabilityDuration = Math.max(0, Number(invulnerabilityDuration) || 0);
    this.invulnerabilityRemaining = 0;
  }

  /**
   * 無敵時間を更新する
   * @param deltaTime 前フレームからの経過時間
   */
  tick(deltaTime) {
    this.invulnerabilityRemaining = Math.max(
      0,
      this.invulnerabilityRemaining - Math.max(0, deltaTime),
    );
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
   * 攻撃によるダメージを受け、無敵時間を開始する
   * @param amount ダメージ量
   * @returns {boolean} ダメージを受けた場合はtrue
   */
  takeHit(amount = 1) {
    if (this.invulnerabilityRemaining > 0 || this.health <= 0) {
      return false;
    }

    this.damage(amount);
    this.invulnerabilityRemaining = this.invulnerabilityDuration;
    return true;
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

  /**
   * 経験値を加算し、必要経験値に達した分だけレベルを上げる
   * @param amount 加算する経験値
   */
  addExperience(amount) {
    let totalExperience = this.experience + MathUtil.nonNegativeInteger(amount);

    while (totalExperience >= this.experienceToNextLevel) {
      totalExperience -= this.experienceToNextLevel;
      this.level += 1;
    }

    this.experience = totalExperience;
  }
}
