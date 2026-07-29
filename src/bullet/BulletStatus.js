import { Component } from "../engine/index.js";

/**
 * 弾の戦闘情報と生存時間を保持するコンポーネント
 */
export class BulletStatus extends Component {
  constructor({ damage = 1, lifetime = 1, owner = "neutral", piercing = false } = {}) {
    super();

    this.damage = damage;
    this.lifetime = lifetime;
    this.owner = owner;
    this.piercing = Boolean(piercing);
    this.hitTargets = new WeakSet();
  }

  /**
   * 対象へまだ命中していないかを判定する
   * @param target 命中対象
   */
  canHit(target) {
    return target !== null && typeof target === "object" && !this.hitTargets.has(target);
  }

  /**
   * 対象を命中済みとして記録する
   * @param target 命中対象
   */
  recordHit(target) {
    if (target !== null && typeof target === "object") {
      this.hitTargets.add(target);
    }
  }

  tick(deltaTime) {
    this.lifetime -= Math.max(0, deltaTime);

    if (this.lifetime <= 0) {
      this.destroy();
    }
  }
}
