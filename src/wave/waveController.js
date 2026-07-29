/**
 * 時間に基づいてWaveと敵の出現を管理する
 */
export class WaveController {
  constructor({
    waves,
    enemySpawner,
    spawnPositionResolver,
    getViewport,
    repeats = false,
    difficultyIncreasePerCycle = 0.1,
    minimumIntervalMultiplier = 0.4,
    onTimeChanged = () => {},
    onCompleted = () => {},
  }) {
    this.waves = waves;
    this.enemySpawner = enemySpawner;
    this.spawnPositionResolver = spawnPositionResolver;
    this.getViewport = getViewport;
    this.repeats = repeats;
    this.difficultyIncreasePerCycle = difficultyIncreasePerCycle;
    this.minimumIntervalMultiplier = minimumIntervalMultiplier;
    this.onTimeChanged = onTimeChanged;
    this.onCompleted = onCompleted;

    this.elapsedTime = 0;
    this.cycle = 0;
    this.completed = false;
    this.totalDuration = Math.max(0, ...this.waves.map((wave) => wave.startTime + wave.duration));
    this.#validateWaves();
    this.spawnStates = this.#createSpawnStates();

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

    if (!this.repeats) {
      this.#spawnCurrentCycleEnemies();
      this.onTimeChanged(Math.max(0, this.totalDuration - this.elapsedTime));
    } else {
      this.#advanceRepeatingCycles();
      const cycleEndTime = (this.cycle + 1) * this.totalDuration;
      this.onTimeChanged(Math.max(0, cycleEndTime - this.elapsedTime));
    }

    if (!this.repeats && this.elapsedTime >= this.totalDuration) {
      this.completed = true;
      this.onCompleted();
    }
  }

  /**
   * 経過済みの周回を進めながら各周回の敵を生成する
   */
  #advanceRepeatingCycles() {
    let cycleEndTime = (this.cycle + 1) * this.totalDuration;

    while (this.elapsedTime >= cycleEndTime) {
      this.#spawnCurrentCycleEnemies();
      this.cycle += 1;
      this.spawnStates = this.#createSpawnStates();
      cycleEndTime = (this.cycle + 1) * this.totalDuration;
    }

    this.#spawnCurrentCycleEnemies();
  }

  /**
   * 現在の周回で出現予定時刻を迎えた敵を生成する
   */
  #spawnCurrentCycleEnemies() {
    this.waves.forEach((wave, waveIndex) => {
      this.#spawnEnemiesForWave(wave, waveIndex);
    });
  }

  /**
   * 指定Waveで出現予定時刻を迎えた敵を生成する
   * @param wave Wave定義
   * @param waveIndex Waveのインデックス
   */
  #spawnEnemiesForWave(wave, waveIndex) {
    const cycleStartTime = this.cycle * this.totalDuration;
    const waveEndTime = cycleStartTime + wave.startTime + wave.duration;
    const intervalMultiplier = Math.max(
      this.minimumIntervalMultiplier,
      1 - this.cycle * this.difficultyIncreasePerCycle,
    );
    const countMultiplier = 1 + this.cycle * this.difficultyIncreasePerCycle;

    wave.spawns.forEach((spawn, spawnIndex) => {
      const state = this.spawnStates[waveIndex][spawnIndex];
      const spawnLimit = Math.ceil(spawn.count * countMultiplier);
      const spawnInterval = spawn.interval * intervalMultiplier;

      while (
        state.spawnedCount < spawnLimit &&
        state.nextSpawnTime < waveEndTime &&
        state.nextSpawnTime <= this.elapsedTime
      ) {
        const position = this.spawnPositionResolver.resolve(spawn.positionType, this.getViewport());

        this.enemySpawner.spawn({
          enemyId: spawn.enemyId,
          position,
        });

        state.spawnedCount += 1;
        state.nextSpawnTime += spawnInterval;
      }
    });
  }

  /**
   * Wave定義の出現間隔を検証する
   */
  #validateWaves() {
    for (const wave of this.waves) {
      for (const spawn of wave.spawns) {
        if (spawn.interval <= 0) {
          throw new Error("Enemy spawn interval must be greater than zero");
        }
      }
    }
  }

  /**
   * 現在の周回用の敵出現状態を作成する
   * @returns {Array<Array<{spawnedCount: number, nextSpawnTime: number}>>}
   */
  #createSpawnStates() {
    const cycleStartTime = this.cycle * this.totalDuration;

    return this.waves.map((wave) =>
      wave.spawns.map(() => ({
        spawnedCount: 0,
        nextSpawnTime: cycleStartTime + wave.startTime,
      })),
    );
  }
}
