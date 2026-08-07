/**
 * ポーズメニューの画面状態と遷移を管理する
 */
export class PauseMenuController {
  constructor({ onStateChanged = () => {}, onReturnToTitle = () => {} } = {}) {
    this.state = "closed";
    this.onStateChanged = onStateChanged;
    this.onReturnToTitle = onReturnToTitle;
  }

  /**
   * メニューがゲームを一時停止しているか
   * @returns {boolean}
   */
  get isPaused() {
    return this.state !== "closed";
  }

  /**
   * ポーズメニューを開く
   */
  open() {
    this.#changeState("menu");
  }

  /**
   * オプション画面を開く
   */
  openOptions() {
    if (this.state !== "closed") {
      this.#changeState("options");
    }
  }

  /**
   * オプション画面からメニューへ戻る
   */
  returnToMenu() {
    if (this.state === "options") {
      this.#changeState("menu");
    }
  }

  /**
   * メニューを閉じてゲームへ戻る
   */
  resume() {
    this.#changeState("closed");
  }

  /**
   * タイトル画面への遷移を要求する
   */
  returnToTitle() {
    if (this.isPaused) {
      this.onReturnToTitle();
    }
  }

  /**
   * 状態を変更して表示側へ通知する
   * @param state 次の状態
   */
  #changeState(state) {
    if (state === this.state) {
      return;
    }

    // 状態を変更して表示側へ通知する
    this.state = state;
    this.onStateChanged(state);
  }
}
