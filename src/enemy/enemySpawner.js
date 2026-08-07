/**
 * 敵のスポーンの仕方を決める
 */
export class EnemySpawner {
  constructor({ enemyFactory, enemyDefinitions, target, onSpawn }) {
    this.enemyFactory = enemyFactory;
    this.enemyDefinitions = enemyDefinitions;
    this.target = target;
    this.onSpawn = onSpawn;
  }

  /**
   * 敵をスポーンさせる
   * @param param0
   * @param param0.enemyId 敵のID
   * @param param0.position 敵の出現位置
   * @returns {*}
   */
  spawn({ enemyId, position }) {
    // 敵の定義を取得する
    const definition = this.enemyDefinitions[enemyId];

    // 敵の定義が存在しない場合はエラーを投げる
    if (!definition) {
      throw new Error(`Unknown enemy ID: ${enemyId}`);
    }

    // 敵を生成する
    const enemy = this.enemyFactory.create({
      definition,
      position,
      target: this.target,
    });

    // 敵をスポーンさせた後の処理を呼び出す
    this.onSpawn(enemy);
    return enemy;
  }
}
