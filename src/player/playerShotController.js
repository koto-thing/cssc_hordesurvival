import { Component, InputSystem } from "../engine/index.js";

/**
 * プレイヤーの弾を撃つコンポーネント
 */
export class PlayerShotController extends Component {
  constructor({ bulletSpawner = null, bulletId = "normal", inputSystem = InputSystem } = {}) {
    super();

    this.bulletSpawner = bulletSpawner;
    this.bulletId = bulletId;
    this.inputSystem = inputSystem;

    this.bulletShotInterval = 0.2;
    this.bulletShotTimer = 0;
  }

  tick(deltaTime) {
    this.bulletShotTimer += deltaTime;

    if (this.bulletShotTimer >= this.bulletShotInterval) {
      this.#shot(this.inputSystem.mousePosition);
      this.bulletShotTimer -= this.bulletShotInterval;
    }
  }

  /**
   * 弾をカーソル方向に飛ばす
   * @param mousePosition マウス座標
   */
  #shot(mousePosition) {
    // 座標から角度を計算
    const dx = mousePosition.x - this.transform.x;
    const dy = mousePosition.y - this.transform.y;
    const angle = Math.atan2(dy, dx);

    // Spawnerが設定されていない間は発射処理を行わない
    if (this.bulletSpawner === null) {
      return;
    }

    // 弾を発射
    this.bulletSpawner.spawn({
      bulletId: this.bulletId,
      position: {
        x: this.transform.x,
        y: this.transform.y,
      },
      angle,
      owner: "player",
    });
  }
}
