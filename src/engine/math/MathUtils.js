/**
 * 値を最小値から最大値の範囲内に制限する
 * @param value {number} 制限する値
 * @param min {number} 最小値
 * @param max {number} 最大値
 * @returns {number} 範囲内に制限された値
 */
export function clamp(value, min, max) {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  return Math.min(Math.max(value, lower), upper);
}

/**
 * 値を0から1の範囲内に制限する
 * @param value {number} 制限する値
 * @returns {number} 0から1の範囲内に制限された値
 */
export function clamp01(value) {
  return clamp(value, 0, 1);
}

/**
 * 2つの値の間を線形補間する
 * @param start {number} 開始値
 * @param end {number} 終了値
 * @param amount {number} 補間率
 * @returns {number} 補間された値
 */
export function lerp(start, end, amount) {
  return start + (end - start) * clamp01(amount);
}

/**
 * 指定範囲内で値がどの割合にあるかを求める
 * @param start {number} 開始値
 * @param end {number} 終了値
 * @param value {number} 割合を求める値
 * @returns {number} 0から1の範囲内に制限された割合
 */
export function inverseLerp(start, end, value) {
  if (start === end) {
    return 0;
  }

  return clamp01((value - start) / (end - start));
}

/**
 * 値をある範囲から別の範囲へ変換する
 * @param value {number} 変換する値
 * @param fromMin {number} 変換元の最小値
 * @param fromMax {number} 変換元の最大値
 * @param toMin {number} 変換先の最小値
 * @param toMax {number} 変換先の最大値
 * @returns {number} 変換後の値
 */
export function remap(value, fromMin, fromMax, toMin, toMax) {
  return lerp(toMin, toMax, inverseLerp(fromMin, fromMax, value));
}
