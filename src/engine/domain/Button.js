import { UIElement } from "./UIElement.js";

import { notifyUIInteraction } from "./UIInteractionFeedback.js";

/**
 * クリック可能な汎用UIボタン
 */
export class Button extends UIElement {
  constructor({
    text = "Button",
    width = 240,
    height = 64,
    font = "24px sans-serif",
    textColor = "#ffffff",
    normalColor = "4654d6",
    hoverColor = "#5968ed",
    pressedColor = "#3542bd",
    disabledColor = "#666666",
  } = {}) {
    super({ width, height });

    this.colors = {
      normal: normalColor,
      hover: hoverColor,
      pressed: pressedColor,
      disabled: disabledColor,
    };

    this.clickListeners = new Set();

    this.background = new createjs.Shape();
    this.textView = new createjs.Text(text, font, textColor);

    this.textView.textAlign = "center";
    this.textView.textBaseline = "top";
    this.textView.mouseEnabled = false;

    this.addChild(this.background, this.textView);

    this.hitArea = new createjs.Shape();
    this.cursor = "pointer";

    this.on("mouseover", this.#handleMouseOver, this);
    this.on("mouseout", this.#handleMouseOut, this);
    this.on("mousedown", this.#handleMouseDown, this);
    this.on("pressup", this.#handlePressUp, this);
    this.on("click", this.#handleClick, this);

    this.redraw();
  }

  /**
   * ボタンの表示文字列を変更する
   * @param text 新しい文字列
   */
  setText(text) {
    this.textView.text = text;
    this.redraw();
  }

  /**
   * ボタンがクリックされたときに呼び出されるリスナーを登録する
   * @param listener クリック時に呼び出される関数
   * @returns {(function(): void)|*} 登録解除用の関数
   */
  onClick(listener) {
    this.clickListeners.add(listener);

    return () => {
      this.clickListeners.delete(listener);
    };
  }

  /**
   * ボタンの表示色を変更する
   * @param colors 状態ごとの色
   */
  setColors(colors) {
    this.colors = { ...this.colors, ...colors };
    this.redraw();
  }

  /**
   * ボタンの表示を再描画する
   * @param color 現在の状態に応じた色を指定する（省略時は状態に応じた色を自動選択）
   */
  redraw(color = null) {
    const currentColor = color ?? (this.interactable ? this.colors.normal : this.colors.disabled);

    this.background.graphics
      .clear()
      .beginFill(currentColor)
      .drawRoundRect(0, 0, this.uiWidth, this.uiHeight, 12);

    this.textView.x = this.uiWidth / 2;
    // textBaselineがtopのため、文字の実測高を引いてボタン中央へ配置する
    this.textView.y = (this.uiHeight - this.textView.getMeasuredHeight()) / 2;

    this.hitArea.graphics.clear().beginFill("#000000").drawRect(0, 0, this.uiWidth, this.uiHeight);

    this.cache(0, 0, this.uiWidth, this.uiHeight);
  }

  /**
   * ボタンを破棄する
   */
  dispose() {
    this.clickListeners.clear();
    super.dispose();
  }

  /**
   * ボタンのマウスオーバー時の処理
   */
  #handleMouseOver = () => {
    if (this.interactable) {
      this.redraw(this.colors.hover);
    }
  };

  /**
   * ボタンのマウスアウト時の処理
   */
  #handleMouseOut = () => {
    if (this.interactable) {
      this.redraw(this.colors.normal);
    }
  };

  /**
   * ボタンのマウスダウン時の処理
   */
  #handleMouseDown = () => {
    if (this.interactable) {
      this.redraw(this.colors.pressed);
    }
  };

  /**
   * ボタンのマウスアップ時の処理
   */
  #handlePressUp = () => {
    if (this.interactable) {
      this.redraw(this.colors.hover);
    }
  };

  /**
   * ボタンのクリック時の処理
   */
  #handleClick = () => {
    if (!this.interactable) {
      return;
    }

    // UI操作のフィードバックを通知する
    notifyUIInteraction();
    for (const listener of this.clickListeners) {
      listener();
    }
  };
}
