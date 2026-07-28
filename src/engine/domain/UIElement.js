/**
 * UI表示要素の基底クラス
 */
export class UIElement extends createjs.Container {
  /**
   * コンストラクタ
   * @param param0
   * @param param0.width
   * @param param0.height
   */
  constructor({ width = 0, height = 0 } = {}) {
    super();

    this.uiWidth = width;
    this.uiHeight = height;
    this.interactable = true;
  }

  /**
   * UI要素のサイズを変更する
   * @param width 新しい幅
   * @param height 新しい高さ
   */
  setSize(width, height) {
    this.uiWidth = width;
    this.uiHeight = height;
    this.redraw();
  }

  /**
   * UI要素の操作可否を変更する
   * @param interactable インタラクトできるかどうか
   */
  setInteractable(interactable) {
    this.interactable = interactable;
    this.mouseEnabled = interactable;
    this.cursor = interactable ? "pointer" : null;
    this.redraw();
  }

  /**
   * 表示内容を再描画する
   * 派生クラスで実装
   */
  redraw() {}

  /**
   * UI要素を破棄する
   */
  dispose() {
    this.removeAllEventListeners();
    this.removeAllChildren();
    this.parent?.removeChild(this);
  }
}
