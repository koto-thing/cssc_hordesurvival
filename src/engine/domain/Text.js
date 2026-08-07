import { UIElement } from "./UIElement.js";

const CACHE_PADDING = 4;

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
    outlineColor = null,
    outlineWidth = 0,
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

    this.outlineView = null;
    this.outlineWidth = Math.max(0, Number(outlineWidth) || 0);
    if (outlineColor !== null && this.outlineWidth > 0) {
      this.outlineView = new createjs.Text(text, font, outlineColor);
      this.outlineView.textBaseline = "top";
      this.outlineView.lineHeight = lineHeight;
      this.outlineView.lineWidth = maxWidth;
      this.outlineView.outline = this.outlineWidth;
      this.outlineView.mouseEnabled = false;
      this.addChild(this.outlineView);
    }

    this.hitArea = new createjs.Shape();
    this.addChild(this.textView);
    this.redraw();
  }

  /**
   * ボタンの表示文字列を変更する
   * @param text
   */
  setText(text) {
    this.textView.text = text;
    if (this.outlineView !== null) {
      this.outlineView.text = text;
    }
    this.redraw();
  }

  /**
   * ボタンのフォントを変更する
   * @param font
   */
  setFont(font) {
    this.textView.font = font;
    if (this.outlineView !== null) {
      this.outlineView.font = font;
    }
    this.redraw();
  }

  /**
   * ボタンの表示色を変更する
   * @param color
   */
  setColor(color) {
    this.textView.color = color;
    this.redraw();
  }

  /**
   * ボタンの文字揃えを変更する
   * @param textAlign
   */
  setTextAlign(textAlign) {
    this.textAlign = textAlign;
    this.redraw();
  }

  /**
   * ボタンの縦方向の文字揃えを変更する
   * @param verticalAlign
   */
  setVerticalAlign(verticalAlign) {
    this.verticalAlign = verticalAlign;
    this.redraw();
  }

  /**
   * ボタンの表示サイズを変更する
   * @param width
   * @param height
   */
  setSize(width, height) {
    this.autoWidth = false;
    this.autoHeight = false;
    super.setSize(width, height);
  }

  /**
   * ボタンの表示を再描画する
   */
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
    if (this.outlineView !== null) {
      this.outlineView.textAlign = this.textAlign;
      this.outlineView.x = this.textView.x;
      this.outlineView.y = this.textView.y;
    }

    this.hitArea.graphics.clear().beginFill("#000000").drawRect(0, 0, this.uiWidth, this.uiHeight);

    // フォントの字形が計測領域をわずかに越えても端が見切れないよう余白を確保する
    const cachePadding = Math.max(CACHE_PADDING, this.outlineWidth);
    this.cache(
      -cachePadding,
      -cachePadding,
      this.uiWidth + cachePadding * 2,
      this.uiHeight + cachePadding * 2,
    );
  }

  /**
   * ボタンの横方向の文字位置を取得する
   * @returns {number}
   */
  #getHorizontalPosition() {
    if (this.textAlign === "center") {
      return this.uiWidth / 2;
    }

    if (this.textAlign === "right" || this.textAlign === "end") {
      return this.uiWidth;
    }

    return 0;
  }

  /**
   * ボタンの縦方向の文字位置を取得する
   * @returns {number}
   */
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
