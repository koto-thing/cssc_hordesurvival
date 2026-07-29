import { CircleColliderComponent, GameObject } from "../engine/index.js";
import { BulletStatus } from "./BulletStatus.js";
import { StraightBulletMoveController } from "./StraightBulletMoveController.js";

/**
 * 弾を構成するゲームオブジェクト
 */
export class Bullet extends GameObject {
  /**
   * @param options
   * @param options.view 弾の表示オブジェクト
   * @param options.moveController 弾の移動方法
   * @param options.status 弾のステータス
   */
  constructor({
    view = null,
    moveController = new StraightBulletMoveController({ angle: 0, speed: 0 }),
    status = new BulletStatus(),
    collider = new CircleColliderComponent({ radius: 8 }),
  } = {}) {
    super("bullet", view);

    this.moveController = this.addComponent(moveController);
    this.status = this.addComponent(status);
    this.collider = this.addComponent(collider);
  }
}
