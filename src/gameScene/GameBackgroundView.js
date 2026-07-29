import { UI_THEME } from "../assets/uiTheme.js";

/**
 * ゲーム画面の仮背景を描画する
 *
 * 将来画像へ差し替える場合は、このビューの描画実装だけを変更する
 */
export class GameBackgroundView {
  constructor() {
    this.view = new createjs.Shape();
    this.view.mouseEnabled = false;
  }

  /**
   * 背景を表示領域全体へ広げる
   * @param width 表示幅
   * @param height 表示高さ
   */
  layout(width, height) {
    this.view.graphics.clear().beginFill(UI_THEME.backgroundDeep).drawRect(0, 0, width, height);
    this.view.cache(0, 0, width, height);
  }
}
