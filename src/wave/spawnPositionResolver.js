const DEFAULT_SCREEN_MARGIN = 32;

/**
 * 敵の出現形式をビューポート上の座標へ変換する
 */
export class SpawnPositionResolver {
  constructor({ random = Math.random, screenMargin = DEFAULT_SCREEN_MARGIN } = {}) {
    this.random = random;
    this.screenMargin = Math.max(0, screenMargin);
  }

  /**
   * 出現形式に対応した座標を返す
   * @param positionType 出現形式
   * @param viewport 現在のビューポート
   * @returns {{x: number, y: number}}
   */
  resolve(positionType, viewport) {
    switch (positionType) {
      // 画面の端から出現する
      case "screenEdge":
        return this.resolveScreenEdge(viewport);

      default:
        throw new Error(`Unknown position type: ${positionType}`);
    }
  }

  /**
   * 画面の上下左右からランダムな出現座標を返す
   * @param viewport 現在のビューポート
   * @returns {{x: number, y: number}}
   */
  resolveScreenEdge(viewport) {
    const width = Math.max(0, viewport?.width ?? 0);
    const height = Math.max(0, viewport?.height ?? 0);
    const side = Math.min(3, Math.floor(this.#randomValue() * 4));

    switch (side) {
      case 0:
        return { x: this.#randomValue() * width, y: -this.screenMargin };
      case 1:
        return { x: width + this.screenMargin, y: this.#randomValue() * height };
      case 2:
        return { x: this.#randomValue() * width, y: height + this.screenMargin };
      default:
        return { x: -this.screenMargin, y: this.#randomValue() * height };
    }
  }

  /**
   * 座標計算に使える0以上1未満の乱数へ丸める
   * @returns {number}
   */
  #randomValue() {
    return Math.min(1 - Number.EPSILON, Math.max(0, this.random()));
  }
}
