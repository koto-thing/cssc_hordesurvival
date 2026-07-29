import { GameObject } from "../engine/index.js";
import { EnemyStatusController } from "./enemyStatusController.js";

/**
 * 敵を構成するゲームオブジェクト
 */
export class Enemy extends GameObject {
  constructor({ view = null, moveController = null, status = new EnemyStatusController() } = {}) {
    super("Enemy", view);

    this.moveController = moveController ? this.addComponent(moveController) : null;
    this.status = this.addComponent(status);
  }
}
