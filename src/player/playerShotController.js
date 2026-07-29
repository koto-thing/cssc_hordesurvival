import { Component, InputSystem } from "../engine/index.js";

/**
 * プレイヤーの弾を撃つコンポーネント
 */
export class PlayerShotController extends Component {
  constructor({
    bulletSpawner = null,
    bulletId = "normal",
    shotInterval = 0.2,
    shotAngles = [0],
    shotRange = null,
    inputSystem = InputSystem,
  } = {}) {
    super();

    this.bulletSpawner = bulletSpawner;
    this.bulletId = bulletId;
    this.shotAngles = shotAngles.length > 0 ? [...shotAngles] : [0];
    this.shotRange = Number.isFinite(shotRange) && shotRange > 0 ? shotRange : null;
    this.inputSystem = inputSystem;

    this.bulletShotInterval = Math.max(0.01, shotInterval);
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

    // キャラクター定義の角度オフセットごとに弾を発射する
    for (const angleOffset of this.shotAngles) {
      this.bulletSpawner.spawn({
        bulletId: this.bulletId,
        position: {
          x: this.transform.x,
          y: this.transform.y,
        },
        angle: angle + angleOffset,
        owner: "player",
        range: this.shotRange,
      });
    }
  }
}
