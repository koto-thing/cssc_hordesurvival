/**
 * 時間に基づいてWaveと敵の出現を管理する
 */
export class WaveController {
  constructor({
    waves,
    enemySpawner,
    spawnPositionResolver,
    getViewport,
    onTimeChanged = () => {},
    onCompleted = () => {},
  }) {
    this.waves = waves;
    this.enemySpawner = enemySpawner;
    this.spawnPositionResolver = spawnPositionResolver;
    this.getViewport = getViewport;
    this.onTimeChanged = onTimeChanged;
    this.onCompleted = onCompleted;

    this.elapsedTime = 0;
    this.completed = false;
    this.totalDuration = Math.max(0, ...this.waves.map((wave) => wave.startTime + wave.duration));
    this.spawnStates = this.waves.map((wave) =>
      wave.spawns.map((spawn) => {
        if (spawn.interval <= 0) {
          throw new Error("Enemy spawn interval must be greater than zero");
        }

        return {
          spawnedCount: 0,
          nextSpawnTime: wave.startTime,
        };
      }),
    );

    this.onTimeChanged(this.totalDuration);
  }

  /**
   * Waveの経過時間を進め、出現予定時刻を迎えた敵を生成する
   * @param deltaTime 前フレームからの経過時間（秒）
   */
  tick(deltaTime) {
    if (this.completed) {
      return;
    }

    this.elapsedTime += Math.max(0, Number.isFinite(deltaTime) ? deltaTime : 0);

    this.waves.forEach((wave, waveIndex) => {
      this.#spawnEnemiesForWave(wave, waveIndex);
    });

    this.onTimeChanged(Math.max(0, this.totalDuration - this.elapsedTime));

    if (this.elapsedTime >= this.totalDuration) {
      this.completed = true;
      this.onCompleted();
    }
  }

  /**
   * 指定Waveで出現予定時刻を迎えた敵を生成する
   * @param wave Wave定義
   * @param waveIndex Waveのインデックス
   */
  #spawnEnemiesForWave(wave, waveIndex) {
    const waveEndTime = wave.startTime + wave.duration;

    wave.spawns.forEach((spawn, spawnIndex) => {
      const state = this.spawnStates[waveIndex][spawnIndex];

      while (
        state.spawnedCount < spawn.count &&
        state.nextSpawnTime < waveEndTime &&
        state.nextSpawnTime <= this.elapsedTime
      ) {
        const position = this.spawnPositionResolver.resolve(spawn.positionType, this.getViewport());

        this.enemySpawner.spawn({
          enemyId: spawn.enemyId,
          position,
        });

        state.spawnedCount += 1;
        state.nextSpawnTime += spawn.interval;
      }
    });
  }
}
