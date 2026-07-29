import { UIElement } from "./UIElement.js";

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

  setText(text) {
    this.textView.text = text;
    this.redraw();
  }

  onClick(listener) {
    this.clickListeners.add(listener);

    return () => {
      this.clickListeners.delete(listener);
    };
  }

  redraw(color = null) {
    const currentColor = color ?? (this.interactable ? this.colors.normal : this.colors.disabled);

    this.background.graphics
      .clear()
      .beginFill(currentColor)
      .drawRoundRect(0, 0, this.uiWidth, this.uiHeight, 12);

    this.textView.x = this.uiWidth / 2;
    this.textView.y = this.uiHeight / 2;

    this.hitArea.graphics.clear().beginFill("#000000").drawRect(0, 0, this.uiWidth, this.uiHeight);

    this.cache(0, 0, this.uiWidth, this.uiHeight);
  }

  dispose() {
    this.clickListeners.clear();
    super.dispose();
  }

  #handleMouseOver = () => {
    if (this.interactable) {
      this.redraw(this.colors.hover);
    }
  };

  #handleMouseOut = () => {
    if (this.interactable) {
      this.redraw(this.colors.normal);
    }
  };

  #handleMouseDown = () => {
    if (this.interactable) {
      this.redraw(this.colors.pressed);
    }
  };

  #handlePressUp = () => {
    if (this.interactable) {
      this.redraw(this.colors.hover);
    }
  };

  #handleClick = () => {
    if (!this.interactable) {
      return;
    }

    for (const listener of this.clickListeners) {
      listener();
    }
  };
}
