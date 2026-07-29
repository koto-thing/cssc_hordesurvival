import { Component } from "../engine/index.js";

/**
 * 対象へ向かって敵を移動させるコンポーネント
 */
export class ChasePlayerMoveController extends Component {
  /**
   * @param options
   * @param options.target 追従するGameObject
   * @param options.speed 1秒あたりの移動距離
   */
  constructor({ target, speed = 0 }) {
    super();

    this.target = target;
    this.speed = Math.max(0, speed);
  }

  /**
   * 対象への方向を正規化して一定速度で移動する
   * @param deltaTime 前フレームからの経過時間
   */
  tick(deltaTime) {
    if (!this.target?.transform || this.target.destroyed) {
      return;
    }

    const dx = this.target.transform.x - this.transform.x;
    const dy = this.target.transform.y - this.transform.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      return;
    }

    const movement = this.speed * Math.max(0, deltaTime);
    this.transform.translate((dx / distance) * movement, (dy / distance) * movement);
  }
}
