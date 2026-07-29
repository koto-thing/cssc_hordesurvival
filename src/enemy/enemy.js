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
    animation = null,
    shotController = null,
    collider = new CircleColliderComponent({ radius: 16 }),
  } = {}) {
    super("Enemy", view);

    this.moveController = moveController ? this.addComponent(moveController) : null;
    this.status = this.addComponent(status);
    this.animation = animation ? this.addComponent(animation) : null;
    this.presentationController = enemyView
      ? this.addComponent(new EnemyPresentationController({ enemyView, status: this.status }))
      : null;
    this.shotController = shotController ? this.addComponent(shotController) : null;
    this.collider = this.addComponent(collider);
    this.isDying = false;
  }

  /**
   * Player弾命中時の表示フィードバックを再生する
   */
  playHitFeedback() {
    this.presentationController?.playHitFeedback();
  }

  /**
   * 戦闘機能を停止し、死亡アニメーション完了後に破棄する
   */
  defeat() {
    if (this.isDying || this.destroyed) {
      return;
    }

    this.isDying = true;
    if (this.moveController) {
      this.moveController.enabled = false;
    }
    if (this.shotController) {
      this.shotController.enabled = false;
    }
    this.collider.enabled = false;
    this.presentationController?.beginDeath();

    if (this.animation?.clips.has("die")) {
      this.animation.play("die", { onComplete: () => this.destroy() });
      return;
    }

    this.destroy();
  }
}
