import { Component } from "../engine/index.js";

/**
 * 弾の戦闘情報と生存時間を保持するコンポーネント
 */
export class BulletStatus extends Component {
  constructor({ damage = 1, lifetime = 1, owner = "neutral" } = {}) {
    super();

    this.damage = damage;
    this.lifetime = lifetime;
    this.owner = owner;
  }

  tick(deltaTime) {
    this.lifetime -= Math.max(0, deltaTime);

    if (this.lifetime <= 0) {
      this.destroy();
    }
  }
}
