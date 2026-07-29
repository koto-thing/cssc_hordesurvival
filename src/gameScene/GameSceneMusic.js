/**
 * ゲームシーンのBGM再生ライフサイクルを管理する
 */
export class GameSceneMusic {
  /**
   * @param options.sound CreateJS Sound API
   * @param options.soundId プリロード済みBGMのID
   */
  constructor({ sound = createjs.Sound, soundId = "gameSceneMusic" } = {}) {
    this.sound = sound;
    this.soundId = soundId;
    this.instance = null;
  }

  /**
   * BGMを無限ループで再生する
   */
  play() {
    this.stop();
    this.instance = this.sound.play(this.soundId, { loop: -1 });
  }

  /**
   * 再生中のBGMを停止する
   */
  stop() {
    this.instance?.stop();
    this.instance = null;
  }
}
