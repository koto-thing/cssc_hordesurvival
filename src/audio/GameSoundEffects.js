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

  /**
   *  レベルアップ時のSEを再生する
   */
  playLevelUp() {
    this.#play("levelUpSound");
  }

  /**
   *  プレイヤーが攻撃を受けた時のSEを再生する
   */
  playPlayerHit() {
    this.#play("playerHitSound");
  }

  /**
   *  敵が攻撃を受けた時のSEを再生する
   */
  playEnemyHit() {
    this.#play("enemyHitSound", { volume: 0.3 });
  }

  /**
   *  敵を倒した時のSEを再生する
   */
  playEnemyDefeated() {
    this.#play("enemyDefeatedSound");
  }

  /**
   *  ボタンをクリックした時のSEを再生する
   */
  playButtonClick() {
    this.#play("buttonClickSound");
  }

  /**
   *  ゲームオーバー時のSEを再生する
   */
  playGameOver() {
    this.#play("gameOverSound");
  }

  /**
   *  ゲームクリア時のSEを再生する
   */
  playGameClear() {
    this.#play("gameClearSound");
  }

  /**
   *  CreateJS Sound APIを呼び出してSEを再生する
   * @param soundId
   * @param options
   */
  #play(soundId, options) {
    this.sound.play(soundId, options);
  }
}
