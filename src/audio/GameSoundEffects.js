/**
 * ゲーム内SEのCreateJS Sound呼び出しを集約する
 */
export class GameSoundEffects {
  /**
   * @param options.sound CreateJS Sound API
   */
  constructor({ sound = createjs.Sound } = {}) {
    this.sound = sound;
  }

  playLevelUp() {
    this.#play("levelUpSound");
  }

  playPlayerHit() {
    this.#play("playerHitSound");
  }

  playEnemyHit() {
    this.#play("enemyHitSound", { volume: 0.3 });
  }

  playEnemyDefeated() {
    this.#play("enemyDefeatedSound");
  }

  playButtonClick() {
    this.#play("buttonClickSound");
  }

  playGameOver() {
    this.#play("gameOverSound");
  }

  playGameClear() {
    this.#play("gameClearSound");
  }

  #play(soundId, options) {
    this.sound.play(soundId, options);
  }
}
