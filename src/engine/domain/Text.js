import { UIElement } from "./UIElement.js";

/**
 * StageGLでも簡単に文字を表示できる汎用UIテキスト
 */
export class Text extends UIElement {
  constructor({
    text = "",
    width = null,
    height = null,
    font = "20px sans-serif",
    color = "#ffffff",
    textAlign = "left",
    verticalAlign = "top",
    lineHeight = 0,
    maxWidth = null,
  } = {}) {
    super({ width: width ?? 0, height: height ?? 0 });

    this.autoWidth = width === null;
    this.autoHeight = height === null;
    this.textAlign = textAlign;
    this.verticalAlign = verticalAlign;

    this.textView = new createjs.Text(text, font, color);
    this.textView.textBaseline = "top";
    this.textView.lineHeight = lineHeight;
    this.textView.lineWidth = maxWidth;
    this.textView.mouseEnabled = false;

    this.hitArea = new createjs.Shape();
    this.addChild(this.textView);
    this.redraw();
  }

  setText(text) {
    this.textView.text = text;
    this.redraw();
  }

  setFont(font) {
    this.textView.font = font;
    this.redraw();
  }

  setColor(color) {
    this.textView.color = color;
    this.redraw();
  }

  setTextAlign(textAlign) {
    this.textAlign = textAlign;
    this.redraw();
  }

  setVerticalAlign(verticalAlign) {
    this.verticalAlign = verticalAlign;
    this.redraw();
  }

  setSize(width, height) {
    this.autoWidth = false;
    this.autoHeight = false;
    super.setSize(width, height);
  }

  redraw() {
    if (this.autoWidth) {
      this.uiWidth = Math.max(1, Math.ceil(this.textView.getMeasuredWidth()));
    }

    if (this.autoHeight) {
      this.uiHeight = Math.max(1, Math.ceil(this.textView.getMeasuredHeight()));
    }

    this.textView.textAlign = this.textAlign;
    this.textView.x = this.#getHorizontalPosition();
    this.textView.y = this.#getVerticalPosition();

    this.hitArea.graphics.clear().beginFill("#000000").drawRect(0, 0, this.uiWidth, this.uiHeight);

    this.cache(0, 0, this.uiWidth, this.uiHeight);
  }

  #getHorizontalPosition() {
    if (this.textAlign === "center") {
      return this.uiWidth / 2;
    }

    if (this.textAlign === "right" || this.textAlign === "end") {
      return this.uiWidth;
    }

    return 0;
  }

  #getVerticalPosition() {
    const textHeight = this.textView.getMeasuredHeight();

    if (this.verticalAlign === "middle") {
      return (this.uiHeight - textHeight) / 2;
    }

    if (this.verticalAlign === "bottom") {
      return this.uiHeight - textHeight;
    }

    return 0;
  }
}
