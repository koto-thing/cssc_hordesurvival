import { clamp, inverseLerp, lerp } from "../math/MathUtils.js";
import { UIElement } from "./UIElement.js";
import { notifyUIInteraction } from "./UIInteractionFeedback.js";

const DIRECTIONS = new Set(["leftToRight", "rightToLeft", "bottomToTop", "topToBottom"]);

/**
 * Unity の UI Slider に相当する、値をドラッグ操作で変更できる UI 要素
 */
export class Slider extends UIElement {
  constructor({
    minValue = 0,
    maxValue = 1,
    value = minValue,
    wholeNumbers = false,
    direction = "leftToRight",
    width = 240,
    height = 32,
    handleSize = 24,
    trackThickness = 8,
    backgroundColor = "#4b5563",
    fillColor = "#5968ed",
    handleColor = "#ffffff",
    disabledColor = "#666666",
  } = {}) {
    super({ width, height });

    this.minValue = finiteOr(minValue, 0);
    this.maxValue = finiteOr(maxValue, 1);
    this.wholeNumbers = Boolean(wholeNumbers);
    this.direction = normalizeDirection(direction);
    this.handleSize = Math.max(0, finiteOr(handleSize, 24));
    this.trackThickness = Math.max(0, finiteOr(trackThickness, 8));
    this.colors = {
      background: backgroundColor,
      fill: fillColor,
      handle: handleColor,
      disabled: disabledColor,
    };
    this.valueChangedListeners = new Set();

    this.background = new createjs.Shape();
    this.fill = new createjs.Shape();
    this.handle = new createjs.Shape();
    this.hitArea = new createjs.Shape();
    this.addChild(this.background, this.fill, this.handle);

    this._value = this.#sanitizeValue(value);
    this.cursor = "pointer";
    this.on("mousedown", this.#handlePointerDown);
    this.on("pressmove", this.#handlePointer);
    this.redraw();
  }

  /**
   * 現在のスライダーの値
   * @returns {number}
   */
  get value() {
    return this._value;
  }

  /**
   * 現在のスライダーの値を設定する
   * @param value {number} 新しい値
   */
  set value(value) {
    this.setValue(value);
  }

  /**
   * 現在のスライダーの値を 0 から 1 の範囲に正規化した値
   * @returns {number} 正規化した値
   */
  get normalizedValue() {
    return inverseLerp(this.minValue, this.maxValue, this._value);
  }

  /**
   * 現在のスライダーの値を 0 から 1 の範囲に正規化した値を設定する
   * @param value {number} 新しい正規化した値
   */
  set normalizedValue(value) {
    this.setValue(lerp(this.minValue, this.maxValue, value));
  }

  /**
   * 現在のスライダーの値を設定する
   * @param value
   */
  setValue(value) {
    this.#setValue(value, true);
  }

  /**
   * 現在のスライダーの値を設定するが、リスナーは通知しない
   * @param value
   */
  setValueWithoutNotify(value) {
    this.#setValue(value, false);
  }

  /**
   * スライダーの値の範囲を設定する
   * @param minValue 最小値
   * @param maxValue 最大値
   */
  setRange(minValue, maxValue) {
    this.minValue = finiteOr(minValue, this.minValue);
    this.maxValue = finiteOr(maxValue, this.maxValue);
    this.#setValue(this._value, true);
    this.redraw();
  }

  /**
   * スライダーの方向を設定する
   * @param direction
   */
  setDirection(direction) {
    this.direction = normalizeDirection(direction);
    this.redraw();
  }

  /**
   * スライダーの値が変更されたときに呼び出されるリスナーを登録する
   * @param listener {function(value: number): void} 値が変更されたときに呼び出される関数
   * @returns {function(): boolean} 登録解除用の関数
   */
  onValueChanged(listener) {
    this.valueChangedListeners.add(listener);
    return () => this.valueChangedListeners.delete(listener);
  }

  /**
   * スライダーの表示を更新する
   */
  redraw() {
    const horizontal = this.direction === "leftToRight" || this.direction === "rightToLeft";
    // ハンドルが両端で描画領域外へ出ないよう直径分だけレールを短くする
    const trackWidth = horizontal
      ? Math.max(0, this.uiWidth - this.handleSize)
      : this.trackThickness;
    const trackHeight = horizontal
      ? this.trackThickness
      : Math.max(0, this.uiHeight - this.handleSize);
    const trackX = (this.uiWidth - trackWidth) / 2;
    const trackY = (this.uiHeight - trackHeight) / 2;
    const amount = this.normalizedValue;
    const reversed = this.direction === "rightToLeft" || this.direction === "bottomToTop";
    const color = this.interactable ? this.colors.fill : this.colors.disabled;

    this.background.graphics
      .clear()
      .beginFill(this.colors.background)
      .drawRoundRect(trackX, trackY, trackWidth, trackHeight, this.trackThickness / 2);

    this.fill.graphics.clear().beginFill(color);
    if (horizontal) {
      const fillWidth = trackWidth * amount;
      const fillX = reversed ? trackX + trackWidth - fillWidth : trackX;
      // 幅0の角丸矩形はStageGLで最小サイズの四角として描画されるため生成しない
      if (fillWidth > 0) {
        // Fillが細い途中フレームでも角丸半径が描画サイズを超えないよう制限する
        const fillRadius = Math.min(this.trackThickness, fillWidth, trackHeight) / 2;
        this.fill.graphics.drawRoundRect(fillX, trackY, fillWidth, trackHeight, fillRadius);
      }
    } else {
      const fillHeight = trackHeight * amount;
      const fillY = reversed ? trackY + trackHeight - fillHeight : trackY;
      if (fillHeight > 0) {
        // Fillが細い途中フレームでも角丸半径が描画サイズを超えないよう制限する
        const fillRadius = Math.min(this.trackThickness, trackWidth, fillHeight) / 2;
        this.fill.graphics.drawRoundRect(trackX, fillY, trackWidth, fillHeight, fillRadius);
      }
    }

    const visualAmount = reversed ? 1 - amount : amount;
    const handleX = horizontal ? trackX + visualAmount * trackWidth : this.uiWidth / 2;
    const handleY = horizontal ? this.uiHeight / 2 : trackY + visualAmount * trackHeight;
    this.handle.graphics.clear();
    if (this.handleSize > 0) {
      this.handle.graphics
        .beginFill(this.interactable ? this.colors.handle : this.colors.disabled)
        .drawCircle(handleX, handleY, this.handleSize / 2);
    }

    this.hitArea.graphics.clear().beginFill("#000000").drawRect(0, 0, this.uiWidth, this.uiHeight);

    // StageGLで動的なShapeを表示するため、再描画後の内容をキャッシュする
    this.background.cache?.(0, 0, this.uiWidth, this.uiHeight);
    this.fill.cache?.(0, 0, this.uiWidth, this.uiHeight);
    this.handle.cache?.(0, 0, this.uiWidth, this.uiHeight);
  }

  /**
   * スライダーを破棄する
   */
  dispose() {
    this.valueChangedListeners.clear();
    super.dispose();
  }

  /**
   * @private
   * スライダーの値を設定するが、リスナーの通知を制御できる
   * @param value 値
   * @param notify リスナーに通知するかどうか
   */
  #setValue(value, notify) {
    const nextValue = this.#sanitizeValue(value);
    if (Object.is(nextValue, this._value)) {
      return;
    }

    this._value = nextValue;
    this.redraw();
    if (notify) {
      for (const listener of this.valueChangedListeners) {
        listener(this._value);
      }
    }
  }

  /**
   * @private
   * スライダーの値を範囲内に収め、必要に応じて整数に丸める
   * @param value 値
   * @returns {number} 範囲内に収められた値
   */
  #sanitizeValue(value) {
    let result = clamp(finiteOr(value, this.minValue), this.minValue, this.maxValue);
    if (this.wholeNumbers) {
      result = clamp(Math.round(result), this.minValue, this.maxValue);
    }
    return result;
  }

  /**
   * @private
   * スライダーのハンドルをドラッグしたときの処理
   * @param event {createjs.MouseEvent} マウスイベント
   */
  #handlePointer = (event) => {
    if (!this.interactable) {
      return;
    }

    const point = this.globalToLocal(event.stageX, event.stageY);
    const horizontal = this.direction === "leftToRight" || this.direction === "rightToLeft";
    const size = horizontal ? this.uiWidth : this.uiHeight;
    const start = this.handleSize / 2;
    const length = Math.max(0, size - this.handleSize);
    let amount = length > 0 ? ((horizontal ? point.x : point.y) - start) / length : 0;

    if (this.direction === "rightToLeft" || this.direction === "bottomToTop") {
      amount = 1 - amount;
    }
    this.normalizedValue = clamp(amount, 0, 1);
  };

  /**
   * 操作開始を通知してからスライダーの値を更新する
   * @param event {createjs.MouseEvent} マウスイベント
   */
  #handlePointerDown = (event) => {
    if (!this.interactable) {
      return;
    }

    notifyUIInteraction();
    this.#handlePointer(event);
  };
}

/**
 * @private
 * スライダーの方向を正規化する
 * @param direction {string} スライダーの方向
 * @returns {*string} 正規化されたスライダーの方向
 */
function normalizeDirection(direction) {
  if (!DIRECTIONS.has(direction)) {
    throw new RangeError(`Unsupported slider direction: "${direction}"`);
  }
  return direction;
}

/**
 * @private
 * 値が有限数であればその値を返し、そうでなければフォールバック値を返す
 * @param value {number} 値
 * @param fallback {number} フォールバック値
 * @returns {*number} 有限数の値またはフォールバック値
 */
function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}
