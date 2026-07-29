/**
 * 弾の定義を解決し、生成後の弾をシーンへ通知する
 */
export class BulletSpawner {
  constructor({ bulletFactory, bulletDefinitions, onSpawn }) {
    this.bulletFactory = bulletFactory;
    this.bulletDefinitions = bulletDefinitions;
    this.onSpawn = onSpawn;
  }

  /**
   * 指定された種類の弾を生成する
   * @param options
   * @param options.bulletId 弾のID
   * @param options.position 弾の生成座標
   * @param options.angle 弾を飛ばす角度
   * @param options.owner 弾を発射した陣営
   * @param options.range 弾が消滅するまでの最大移動距離
   * @returns {import("./bullet.js").Bullet}
   */
  spawn({ bulletId, position, angle, owner, range = null }) {
    const definition = this.bulletDefinitions[bulletId];

    // 定義がない場合はエラーを投げる
    if (!definition) {
      throw new Error(`Unknown bullet ID: ${bulletId}`);
    }

    const bullet = this.bulletFactory.create({
      definition,
      position,
      angle,
      owner,
      range,
    });

    this.onSpawn(bullet);
    return bullet;
  }
}
