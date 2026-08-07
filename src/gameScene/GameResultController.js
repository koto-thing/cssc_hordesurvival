/**
 * ゲーム終了状態とタイトルへ戻る要求を管理する
 */
export class GameResultController {
  constructor({ onResultChanged = () => {}, onReturnRequested = () => {} } = {}) {
    this.result = null;
    this.onResultChanged = onResultChanged;
    this.onReturnRequested = onReturnRequested;
  }

  /**
   * ゲームオーバー状態へ移行する
   * @returns 終了状態へ移行できた場合はtrue
   */
  gameOver() {
    return this.#finish("gameOver");
  }

  /**
   * ゲームクリア状態へ移行する
   * @returns 終了状態へ移行できた場合はtrue
   */
  clear() {
    return this.#finish("clear");
  }

  /**
   * 終了後にタイトルへ戻る
   * @returns タイトルへの遷移を要求した場合はtrue
   */
  requestReturn() {
    if (this.result === null) {
      return false;
    }

    this.onReturnRequested();
    return true;
  }

  /**
   * 終了状態を設定する
   * @param result 終了状態
   * @returns {boolean} 終了状態を設定できた場合はtrue
   */
  #finish(result) {
    if (this.result !== null) {
      return false;
    }

    this.result = result;
    this.onResultChanged(result);
    return true;
  }
}
