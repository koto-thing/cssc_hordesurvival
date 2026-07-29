import { CircleColliderComponent, GameObject } from "../engine/index.js";
import { EnemyStatusController } from "./enemyStatusController.js";
import { EnemyPresentationController } from "./EnemyPresentationController.js";

/**
 * 敵を構成するゲームオブジェクト
 */
export class Enemy extends GameObject {
  constructor({
    view = null,
    moveController = null,
    status = new EnemyStatusController(),
    enemyView = null,
    collider = new CircleColliderComponent({ radius: 16 }),
  } = {}) {
    super("Enemy", view);

    this.moveController = moveController ? this.addComponent(moveController) : null;
    this.status = this.addComponent(status);
    this.presentationController = enemyView
      ? this.addComponent(new EnemyPresentationController({ enemyView, status: this.status }))
      : null;
    this.collider = this.addComponent(collider);
  }

  /**
   * Player弾命中時の表示フィードバックを再生する
   */
  playHitFeedback() {
    this.presentationController?.playHitFeedback();
  }
}
