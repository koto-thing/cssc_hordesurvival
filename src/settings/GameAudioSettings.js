const DEFAULT_VOLUME = 1;
const STORAGE_KEY = "cssc-horde-survival:game-volume";

/**
 * ゲーム全体の音量をCreateJS Soundと永続ストレージへ反映する
 */
export class GameAudioSettings {
  /**
   * @param options
   * @param options.sound 音量を適用するCreateJS Sound
   * @param options.storage 音量を保存するStorage互換オブジェクト
   */
  constructor({ sound = createjs.Sound, storage = globalThis.localStorage } = {}) {
    this.sound = sound;
    this.storage = storage;
    this._volume = this.#loadVolume();
    this.#applyVolume();
  }

  /**
   * 現在のゲーム音量を取得する
   * @returns {number} 0から1の音量
   */
  get volume() {
    return this._volume;
  }

  /**
   * ゲーム音量を変更して保存する
   * @param value 0から1の音量
   */
  setVolume(value) {
    this._volume = clampVolume(value);
    this.#applyVolume();

    // ストレージに保存する
    try {
      this.storage?.setItem(STORAGE_KEY, String(this._volume));
    } catch {
      // ストレージを利用できない環境でも音量変更は継続する
    }
  }

  /**
   * 保存済み音量を読み込む
   * @returns {number}
   */
  #loadVolume() {
    try {
      // ストレージに保存されている音量を読み込む
      const storedValue = this.storage?.getItem(STORAGE_KEY);
      if (storedValue === null || storedValue === undefined) {
        return DEFAULT_VOLUME;
      }

      return clampVolume(Number(storedValue));
    } catch {
      return DEFAULT_VOLUME;
    }
  }

  /**
   * CreateJS Soundへ現在の音量を反映する
   */
  #applyVolume() {
    if (this.sound !== null && this.sound !== undefined) {
      this.sound.volume = this._volume;
    }
  }
}

/**
 * 音量を有効範囲へ収める
 * @param value 音量
 * @returns {number}
 */
function clampVolume(value) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : DEFAULT_VOLUME));
}
