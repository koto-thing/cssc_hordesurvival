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
    const definition = this.enemyDefinitions[enemyId];

    if (!definition) {
      throw new Error(`Unknown enemy ID: ${enemyId}`);
    }

    const enemy = this.enemyFactory.create({
      definition,
      position,
      target: this.target,
    });

    this.onSpawn(enemy);
    return enemy;
  }
}
