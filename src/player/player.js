import { CircleColliderComponent, GameObject } from "../engine/index.js";
import { PlayerMoveController } from "./playerMoveController.js";
import { PlayerStatusController } from "./playerStatusController.js";
import { PlayerShotController } from "./playerShotController.js";

/**
 * プレイヤーを構成するゲームオブジェクト
 */
export class Player extends GameObject {
  constructor({
    view = null,
    moveController = new PlayerMoveController(),
    statusController = new PlayerStatusController(),
    playerShotController = new PlayerShotController(),
    collider = new CircleColliderComponent({ radius: 24 }),
  } = {}) {
    super("Player", view);

    // コンポーネント追加
    this.moveController = this.addComponent(moveController);
    this.statusController = this.addComponent(statusController);
    this.playerShotController = this.addComponent(playerShotController);
    this.collider = this.addComponent(collider);
  }
}
