import { Component } from "../engine/index.js";

/**
 * Playerを狙って敵弾を発射するコンポーネント
 */
export class EnemyShotController extends Component {
  constructor({
    bulletSpawner = null,
    bulletId = "enemyNormal",
    target = null,
    shotInterval = 2,
    aimType = "direct",
    bulletSpeed = 0,
  } = {}) {
    super();

    this.bulletSpawner = bulletSpawner;
    this.bulletId = bulletId;
    this.target = target;
    this.shotInterval = Math.max(0.01, shotInterval);
    this.aimType = aimType;
    this.bulletSpeed = Math.max(0, bulletSpeed);
    this.shotTimer = 0;
  }

  /**
   * 発射間隔ごとに現在位置または迎撃予測位置へ弾を撃つ
   * @param deltaTime 前フレームからの経過時間
   */
  tick(deltaTime) {
    if (!this.target?.transform || this.target.destroyed || this.bulletSpawner === null) {
      return;
    }

    this.shotTimer += Math.max(0, deltaTime);
    while (this.shotTimer >= this.shotInterval) {
      this.#shoot();
      this.shotTimer -= this.shotInterval;
    }
  }

  #shoot() {
    const shooterPosition = {
      x: this.transform.x,
      y: this.transform.y,
    };
    const targetPosition = {
      x: this.target.transform.x,
      y: this.target.transform.y,
    };
    const targetVelocity = {
      x: this.target.moveController?.velocityX ?? 0,
      y: this.target.moveController?.velocityY ?? 0,
    };
    const aimPosition =
      this.aimType === "predictive"
        ? resolveInterceptPosition({
            shooterPosition,
            targetPosition,
            targetVelocity,
            projectileSpeed: this.bulletSpeed,
          })
        : targetPosition;
    const angle = Math.atan2(aimPosition.y - shooterPosition.y, aimPosition.x - shooterPosition.x);

    this.bulletSpawner.spawn({
      bulletId: this.bulletId,
      position: shooterPosition,
      angle,
      owner: "enemy",
    });
  }
}

/**
 * 等速移動する対象と弾が衝突する最短の未来位置を求める
 * 解がない場合は現在位置を返して通常の照準へフォールバックする
 */
export function resolveInterceptPosition({
  shooterPosition,
  targetPosition,
  targetVelocity,
  projectileSpeed,
}) {
  const relativeX = targetPosition.x - shooterPosition.x;
  const relativeY = targetPosition.y - shooterPosition.y;
  const velocitySquared = targetVelocity.x ** 2 + targetVelocity.y ** 2;
  const speedSquared = projectileSpeed ** 2;
  const a = velocitySquared - speedSquared;
  const b = 2 * (relativeX * targetVelocity.x + relativeY * targetVelocity.y);
  const c = relativeX ** 2 + relativeY ** 2;
  const epsilon = 1e-8;
  let interceptTime = null;

  if (projectileSpeed <= 0) {
    return { ...targetPosition };
  }

  if (Math.abs(a) < epsilon) {
    if (Math.abs(b) >= epsilon) {
      const time = -c / b;
      interceptTime = time > 0 ? time : null;
    }
  } else {
    const discriminant = b ** 2 - 4 * a * c;
    if (discriminant >= 0) {
      const root = Math.sqrt(discriminant);
      const times = [(-b - root) / (2 * a), (-b + root) / (2 * a)].filter((time) => time > 0);
      interceptTime = times.length > 0 ? Math.min(...times) : null;
    }
  }

  if (interceptTime === null) {
    return { ...targetPosition };
  }

  return {
    x: targetPosition.x + targetVelocity.x * interceptTime,
    y: targetPosition.y + targetVelocity.y * interceptTime,
  };
}
