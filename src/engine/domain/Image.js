import { UIElement } from "./UIElement.js";

const IMAGE_TYPES = new Set(["simple", "fit", "fill", "native"]);

/**
 * Unity の UI Image に相当する画像表示要素
 *
 * imageType:
 * - simple: 指定サイズに引き伸ばす
 * - fit: アスペクト比を保ち、全体が収まるように表示する
 * - fill: アスペクト比を保ち、領域を埋めるようにはみ出しを切り抜く
 * - native: 画像本来のサイズで表示する
 */
export class Image extends UIElement {
  constructor({
    source = null,
    width = null,
    height = null,
    imageType = "simple",
    preserveAspect = false,
    color = "#ffffff",
    alpha = 1,
    raycastTarget = true,
    fallback = null,
  } = {}) {
    const sourceSize = getSourceSize(source);
    super({
      width: width ?? sourceSize.width,
      height: height ?? sourceSize.height,
    });

    this.source = source;
    this.imageType = normalizeImageType(imageType);
    this.preserveAspect = preserveAspect;
    this.color = color;
    this.imageAlpha = clamp01(alpha);
    this.raycastTarget = raycastTarget;
    this.fallback = fallback;

    this.bitmap = new createjs.Bitmap(source);
    this.bitmap.mouseEnabled = false;
    this.fallbackShape = new createjs.Shape();
    this.fallbackShape.mouseEnabled = false;
    this.clipMask = new createjs.Shape();
    this.hitArea = new createjs.Shape();

    this.addChild(this.fallbackShape, this.bitmap);
    this.redraw();
  }

  /**
   * 画像ソースを設定する
   * @param source 画像ソース
   * @param param1 オプションパラメータ
   * @param param1.setNativeSize ネイティブサイズを設定するかどうか
   */
  setSource(source, { setNativeSize = false } = {}) {
    this.source = source;
    this.bitmap.image = source;

    if (setNativeSize) {
      this.setNativeSize();
      return;
    }

    this.redraw();
  }

  /**
   * 画像の表示方法を設定する
   * @param imageType 画像の表示方法(simple, fit, fill, native)
   */
  setImageType(imageType) {
    this.imageType = normalizeImageType(imageType);
    this.redraw();
  }

  /**
   * 画像のアスペクト比を保持するかどうかを設定する
   * @param preserveAspect アスペクト比を保持するかどうか
   */
  setPreserveAspect(preserveAspect) {
    this.preserveAspect = Boolean(preserveAspect);
    this.redraw();
  }

  /**
   * 画像の色とアルファ値を設定する
   * @param color 画像の色
   * @param alpha 画像のアルファ値(0 ~ 1)
   */
  setColor(color, alpha = this.imageAlpha) {
    this.color = color;
    this.imageAlpha = clamp01(alpha);
    this.redraw();
  }

  /**
   * 画像のレイキャストターゲットを設定する
   * @param raycastTarget レイキャストターゲットにするかどうか
   */
  setRaycastTarget(raycastTarget) {
    this.raycastTarget = Boolean(raycastTarget);
    this.mouseEnabled = this.raycastTarget;
  }

  /**
   * 画像の表示サイズを画像ソースのネイティブサイズに設定する
   */
  setNativeSize() {
    const { width, height } = getSourceSize(this.source);
    this.uiWidth = width;
    this.uiHeight = height;
    this.redraw();
  }

  /**
   * 画像の表示を更新する
   */
  redraw() {
    const sourceSize = getSourceSize(this.source);
    const targetWidth = this.imageType === "native" ? sourceSize.width : this.uiWidth;
    const targetHeight = this.imageType === "native" ? sourceSize.height : this.uiHeight;

    if (this.imageType === "native") {
      this.uiWidth = targetWidth;
      this.uiHeight = targetHeight;
    }

    this.bitmap.x = 0;
    this.bitmap.y = 0;
    this.bitmap.scaleX = 1;
    this.bitmap.scaleY = 1;
    this.bitmap.mask = null;

    if (sourceSize.width > 0 && sourceSize.height > 0) {
      this.#layoutBitmap(sourceSize.width, sourceSize.height, targetWidth, targetHeight);
    }

    this.#drawFallback(sourceSize.width <= 0 || sourceSize.height <= 0);
    this.#applyColor();
    this.hitArea.graphics.clear().beginFill("#000000").drawRect(0, 0, this.uiWidth, this.uiHeight);
    this.setRaycastTarget(this.raycastTarget);
  }

  /**
   * 画像がない場合の代替表示を描画する
   * @param visible {boolean} 代替表示を表示するか
   */
  #drawFallback(visible) {
    this.bitmap.visible = !visible;
    this.fallbackShape.visible = visible && this.fallback !== null;
    this.fallbackShape.uncache?.();
    this.fallbackShape.graphics.clear();

    if (!this.fallbackShape.visible) {
      return;
    }

    const {
      shape = "rect",
      fillColor = "#808080",
      strokeColor = null,
      strokeWidth = 0,
    } = this.fallback;
    const graphics = this.fallbackShape.graphics;

    if (strokeColor && strokeWidth > 0) {
      graphics.beginStroke(strokeColor).setStrokeStyle(strokeWidth);
    }

    graphics.beginFill(fillColor);

    if (shape === "circle") {
      const radius = Math.max(0, (Math.min(this.uiWidth, this.uiHeight) - strokeWidth) / 2);
      graphics.drawCircle(this.uiWidth / 2, this.uiHeight / 2, radius);
      this.#cacheFallback();
      return;
    }

    graphics.drawRect(0, 0, this.uiWidth, this.uiHeight);
    this.#cacheFallback();
  }

  /**
   * StageGLでもベクターのフォールバックを表示できるようキャッシュする
   */
  #cacheFallback() {
    if (this.uiWidth > 0 && this.uiHeight > 0) {
      this.fallbackShape.cache?.(0, 0, this.uiWidth, this.uiHeight);
    }
  }

  /**
   * 画像の表示方法に応じてBitmapをレイアウトする
   * @param sourceWidth 画像ソースの幅
   * @param sourceHeight 画像ソースの高さ
   * @param targetWidth 表示領域の幅
   * @param targetHeight 表示領域の高さ
   */
  #layoutBitmap(sourceWidth, sourceHeight, targetWidth, targetHeight) {
    const shouldFit =
      this.imageType === "fit" || (this.imageType === "simple" && this.preserveAspect);

    if (shouldFit || this.imageType === "fill") {
      const scale =
        this.imageType === "fill"
          ? Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)
          : Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);

      this.bitmap.scaleX = scale;
      this.bitmap.scaleY = scale;
      this.bitmap.x = (targetWidth - sourceWidth * scale) / 2;
      this.bitmap.y = (targetHeight - sourceHeight * scale) / 2;

      if (this.imageType === "fill") {
        this.clipMask.graphics
          .clear()
          .beginFill("#000000")
          .drawRect(0, 0, targetWidth, targetHeight);
        this.bitmap.mask = this.clipMask;
      }
      return;
    }

    if (this.imageType === "simple") {
      this.bitmap.scaleX = targetWidth / sourceWidth;
      this.bitmap.scaleY = targetHeight / sourceHeight;
    }
  }

  /**
   * 画像の色を適用する
   */
  #applyColor() {
    this.bitmap.alpha = this.imageAlpha;
    this.bitmap.filters = null;
    this.bitmap.uncache?.();

    const rgb = parseHexColor(this.color);
    if (!rgb || rgb.every((channel) => channel === 255) || !createjs.ColorFilter) {
      return;
    }

    this.bitmap.filters = [
      new createjs.ColorFilter(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1, 0, 0, 0, 0),
    ];

    const { width, height } = getSourceSize(this.source);
    if (width > 0 && height > 0) {
      this.bitmap.cache(0, 0, width, height);
    }
  }
}

/**
 * 画像ソースのサイズを取得する
 * @param source 画像ソース
 * @returns {{width, height}} 画像ソースの幅と高さ
 */
function getSourceSize(source) {
  return {
    width: source?.naturalWidth ?? source?.videoWidth ?? source?.width ?? 0,
    height: source?.naturalHeight ?? source?.videoHeight ?? source?.height ?? 0,
  };
}

/**
 * 画像の表示方法を正規化する
 * @param imageType 画像の表示方法
 * @returns {*} 正規化された画像の表示方法
 * @throws {RangeError} サポートされていない画像の表示方法の場合
 */
function normalizeImageType(imageType) {
  if (!IMAGE_TYPES.has(imageType)) {
    throw new RangeError(`Unsupported imageType: "${imageType}"`);
  }
  return imageType;
}

/**
 * 値を0から1の範囲にクランプする
 * @param value {number} クランプする値
 * @returns {number} クランプされた値
 */
function clamp01(value) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 1));
}

/**
 * 16進数カラーコードをRGB配列に変換する
 * @param color {string} 16進数カラーコード（例: "#ff0000"）
 * @returns {number[]|null} RGB配列（例: [255, 0, 0]）またはnull（無効なカラーコードの場合）
 */
function parseHexColor(color) {
  if (typeof color !== "string") {
    return null;
  }

  const match = color.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (!match) {
    return null;
  }

  const hex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((character) => character.repeat(2))
          .join("")
      : match[1];

  return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}
