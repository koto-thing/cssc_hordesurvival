import { notifyUIInteraction } from "../engine/index.js";

/**
 * ゲーム終了後にタイトルへ戻るクリック入力を管理する
 */
export class GameResultInputController {
  constructor({ eventTarget = window, onReturnRequested = () => {} } = {}) {
    this.eventTarget = eventTarget;
    this.onReturnRequested = onReturnRequested;
    this.enabled = false;
    this.mouseDownHandler = () => {
      notifyUIInteraction();
      this.onReturnRequested();
    };
  }

  /**
   * クリック入力の監視を開始する
   */
  enable() {
    if (this.enabled) {
      return;
    }

    this.enabled = true;
    this.eventTarget.addEventListener("mousedown", this.mouseDownHandler);
  }

  /**
   * クリック入力の監視を解除する
   */
  disable() {
    if (!this.enabled) {
      return;
    }

    this.enabled = false;
    this.eventTarget.removeEventListener("mousedown", this.mouseDownHandler);
  }
}
