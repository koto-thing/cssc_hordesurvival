/**
 * ゲーム内で使用する数値の正規化処理を提供する
 */
export class MathUtil {
  /**
   * 値を正の整数に変換する
   * @param {number} value 変換する値
   * @param {number} fallback 値が正の有限数でない場合の代替値
   * @returns {number} 正の整数または代替値
   */
  static positiveInteger(value, fallback) {
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
  }

  /**
   * 値を0以上の整数に変換する
   * @param {number} value 変換する値
   * @returns {number} 0以上の整数
   */
  static nonNegativeInteger(value) {
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  }

  /**
   * 値を指定範囲内の整数に変換する
   * @param {number} value 変換する値
   * @param {number} min 最小値
   * @param {number} max 最大値
   * @returns {number} 指定範囲内の整数
   */
  static clampInteger(value, min, max) {
    const number = Number.isFinite(value) ? Math.floor(value) : min;
    return Math.min(max, Math.max(min, number));
  }
}
