import { Component } from "./Component.js";

const DEFAULT_VIEWPORT = Object.freeze({ x: 0, y: 0, width: 1, height: 1 });

/**
 * 2Dワールドの表示位置、回転、拡大率を管理するカメラコンポーネント
 *
 * Camera自身のTransformはワールド座標を表し、targetにその逆変換を適用する
 * HUDなどカメラの影響を受けない表示物はtargetの外へ配置する
 */
export class Camera extends Component {
  /**
   * @param {{
   *   target?: object|null,
   *   viewportWidth?: number,
   *   viewportHeight?: number,
   *   viewport?: {x?: number, y?: number, width?: number, height?: number},
   *   zoom?: number,
   *   minZoom?: number,
   *   maxZoom?: number,
   *   bounds?: {x: number, y: number, width: number, height: number}|null
   * }} options
   */
  constructor({
    target = null,
    viewportWidth = 0,
    viewportHeight = 0,
    viewport = DEFAULT_VIEWPORT,
    zoom = 1,
    minZoom = 0.01,
    maxZoom = Number.POSITIVE_INFINITY,
    bounds = null,
  } = {}) {
    super();

    this.target = target;
    this.viewportWidth = nonNegative(viewportWidth);
    this.viewportHeight = nonNegative(viewportHeight);
    this.viewport = normalizeViewport(viewport);
    this.minZoom = positive(minZoom, "minZoom");
    this.maxZoom = positive(maxZoom, "maxZoom");
    if (this.maxZoom < this.minZoom) {
      throw new RangeError("maxZoom must be greater than or equal to minZoom");
    }

    this._zoom = 1;
    this.zoom = zoom;
    this.bounds = bounds === null ? null : normalizeBounds(bounds);
    this.followTarget = null;
    this.followOffset = { x: 0, y: 0 };
    this.followDamping = 0;
    this._originalTargetTransform = null;
  }

  get zoom() {
    return this._zoom;
  }

  set zoom(value) {
    const zoom = positive(value, "zoom");
    this._zoom = Math.min(this.maxZoom ?? zoom, Math.max(this.minZoom ?? zoom, zoom));
  }

  /**
   * カメラが実際に描画するピクセル領域を返す
   */
  get pixelRect() {
    return {
      x: this.viewport.x * this.viewportWidth,
      y: this.viewport.y * this.viewportHeight,
      width: this.viewport.width * this.viewportWidth,
      height: this.viewport.height * this.viewportHeight,
    };
  }

  /**
   *  現在表示されるワールド座標上の軸平行境界を返す
   */
  get worldBounds() {
    const rect = this.pixelRect;
    const corners = [
      this.screenToWorld({ x: rect.x, y: rect.y }),
      this.screenToWorld({ x: rect.x + rect.width, y: rect.y }),
      this.screenToWorld({ x: rect.x, y: rect.y + rect.height }),
      this.screenToWorld({ x: rect.x + rect.width, y: rect.y + rect.height }),
    ];
    const xs = corners.map((point) => point.x);
    const ys = corners.map((point) => point.y);
    const left = Math.min(...xs);
    const top = Math.min(...ys);
    return {
      x: left,
      y: top,
      width: Math.max(...xs) - left,
      height: Math.max(...ys) - top,
    };
  }

  initialize() {
    this._rememberTargetTransform();
    this.apply();
  }

  lateTick(deltaTime) {
    this._updateFollow(deltaTime);
    this.apply();
  }

  /**
   * 描画対象のワールドContainerを変更する
   */
  setTarget(target) {
    if (target === this.target) {
      return;
    }

    this._restoreTargetTransform();
    this.target = target;
    this._rememberTargetTransform();
    this.apply();
  }

  /**
   * Canvas全体のピクセルサイズを設定する
   */
  setViewportSize(width, height) {
    this.viewportWidth = nonNegative(width);
    this.viewportHeight = nonNegative(height);
    this.apply();
  }

  /**
   *  Canvas内で描画する正規化領域（各値0〜1）を設定する
   */
  setViewport(viewport) {
    this.viewport = normalizeViewport(viewport);
    this.apply();
  }

  /**
   * カメラ位置を制限するワールド境界を設定する
   */
  setBounds(bounds) {
    this.bounds = bounds === null ? null : normalizeBounds(bounds);
    this.apply();
  }

  /**
   * Transformまたは{x, y}を持つオブジェクトへの追従を開始する
   * dampingが0の場合は即時追従し、値を大きくすると滑らかに追従する
   */
  follow(target, { offsetX = 0, offsetY = 0, damping = 0 } = {}) {
    if (!target || !Number.isFinite(target.x) || !Number.isFinite(target.y)) {
      throw new TypeError("follow target must have finite x and y properties");
    }

    this.followTarget = target;
    this.followOffset = { x: offsetX, y: offsetY };
    this.followDamping = nonNegative(damping);
  }

  stopFollowing() {
    this.followTarget = null;
  }

  /**
   * ワールド座標をCanvas座標へ変換する
   */
  worldToScreen(point) {
    const center = this._screenCenter();
    const camera = this._cameraPosition();
    const radians = (-this._cameraRotation() * Math.PI) / 180;
    const dx = point.x - camera.x;
    const dy = point.y - camera.y;
    return {
      x: center.x + (dx * Math.cos(radians) - dy * Math.sin(radians)) * this.zoom,
      y: center.y + (dx * Math.sin(radians) + dy * Math.cos(radians)) * this.zoom,
    };
  }

  /**
   * Canvas座標をワールド座標へ変換する
   */
  screenToWorld(point) {
    const center = this._screenCenter();
    const camera = this._cameraPosition();
    const radians = (this._cameraRotation() * Math.PI) / 180;
    const dx = (point.x - center.x) / this.zoom;
    const dy = (point.y - center.y) / this.zoom;
    return {
      x: camera.x + dx * Math.cos(radians) - dy * Math.sin(radians),
      y: camera.y + dx * Math.sin(radians) + dy * Math.cos(radians),
    };
  }

  /**
   *  点または矩形がカメラの表示範囲に入っているか判定する
   */
  isVisible(value) {
    const bounds = this.worldBounds;
    if (value.width === undefined || value.height === undefined) {
      return (
        value.x >= bounds.x &&
        value.x <= bounds.x + bounds.width &&
        value.y >= bounds.y &&
        value.y <= bounds.y + bounds.height
      );
    }

    return (
      value.x + value.width >= bounds.x &&
      value.x <= bounds.x + bounds.width &&
      value.y + value.height >= bounds.y &&
      value.y <= bounds.y + bounds.height
    );
  }

  /**
   * 現在のカメラ状態を描画対象へ反映する
   */
  apply() {
    if (!this.target || !this.transform) {
      return;
    }

    const position = this._clampedPosition(this.transform.x, this.transform.y);
    const center = this._screenCenter();
    this.target.regX = position.x;
    this.target.regY = position.y;
    this.target.x = center.x;
    this.target.y = center.y;
    this.target.rotation = -this._cameraRotation();
    this.target.scaleX = this.zoom;
    this.target.scaleY = this.zoom;
  }

  /**
   * @private
   * Cameraを破棄する
   */
  onDestroy() {
    this._restoreTargetTransform();
    this.followTarget = null;
  }

  /**
   * カメラが追従対象を持つ場合、追従処理を行う
   * @param deltaTime
   * @private
   */
  _updateFollow(deltaTime) {
    if (!this.followTarget || !this.transform) {
      return;
    }

    const targetX = this.followTarget.x + this.followOffset.x;
    const targetY = this.followTarget.y + this.followOffset.y;
    const dt = Math.max(0, Number(deltaTime) || 0);
    const amount = this.followDamping === 0 ? 1 : 1 - Math.exp(-this.followDamping * dt);
    this.transform.x += (targetX - this.transform.x) * amount;
    this.transform.y += (targetY - this.transform.y) * amount;
  }

  /**
   * カメラのワールド座標上の位置を返す
   * @returns {{x: number, y: number}}
   * @private
   */
  _cameraPosition() {
    if (!this.transform) {
      return { x: 0, y: 0 };
    }

    return this._clampedPosition(this.transform.x, this.transform.y);
  }

  /**
   * カメラの回転角度を返す
   * @returns {number}
   * @private
   */
  _cameraRotation() {
    return this.transform?.rotation ?? 0;
  }

  /**
   * カメラの表示領域の中心座標を返す
   * @returns {{x, y}}
   * @private
   */
  _screenCenter() {
    const rect = this.pixelRect;
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }

  /**
   * カメラの位置をbounds内に収める
   * @param x
   * @param y
   * @returns {{x: number, y: number}}
   * @private
   */
  _clampedPosition(x, y) {
    if (!this.bounds) {
      return { x, y };
    }

    const rect = this.pixelRect;
    const halfWidth = rect.width / (2 * this.zoom);
    const halfHeight = rect.height / (2 * this.zoom);
    return {
      x: clampAxis(x, this.bounds.x + halfWidth, this.bounds.x + this.bounds.width - halfWidth),
      y: clampAxis(y, this.bounds.y + halfHeight, this.bounds.y + this.bounds.height - halfHeight),
    };
  }

  /**
   * 現在のtargetのTransformを記録する
   * @private
   */
  _rememberTargetTransform() {
    if (!this.target || this._originalTargetTransform !== null) {
      return;
    }

    this._originalTargetTransform = {};
    for (const property of ["x", "y", "regX", "regY", "rotation", "scaleX", "scaleY"]) {
      this._originalTargetTransform[property] = this.target[property];
    }
  }

  /**
   * 記録されたtargetのTransformを復元する
   * @private
   */
  _restoreTargetTransform() {
    if (!this.target || !this._originalTargetTransform) {
      return;
    }

    Object.assign(this.target, this._originalTargetTransform);
    this._originalTargetTransform = null;
  }
}

/**
 * カメラの表示領域を正規化する
 * @param viewport
 * @returns {{x: number, y: number, width: number, height: number}}
 */
function normalizeViewport(viewport) {
  const result = { ...DEFAULT_VIEWPORT, ...viewport };
  for (const property of ["x", "y", "width", "height"]) {
    if (!Number.isFinite(result[property]) || result[property] < 0 || result[property] > 1) {
      throw new RangeError(`viewport.${property} must be between 0 and 1`);
    }
  }

  if (result.x + result.width > 1 || result.y + result.height > 1) {
    throw new RangeError("viewport must fit inside the canvas");
  }

  return result;
}

/**
 * カメラのワールド境界を正規化する
 * @param bounds
 * @returns {{x: *, y: *, width: *, height: *}}
 */
function normalizeBounds(bounds) {
  if (
    !Number.isFinite(bounds.x) ||
    !Number.isFinite(bounds.y) ||
    !Number.isFinite(bounds.width) ||
    !Number.isFinite(bounds.height) ||
    bounds.width < 0 ||
    bounds.height < 0
  ) {
    throw new TypeError("bounds must contain finite x, y and non-negative width, height");
  }

  return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
}

/**
 * 値が正の有限数であることを確認する
 * @param value
 * @param name
 * @returns {*}
 */
function positive(value, name) {
  if ((!Number.isFinite(value) && value !== Number.POSITIVE_INFINITY) || value <= 0) {
    throw new RangeError(`${name} must be greater than 0`);
  }

  return value;
}

/**
 * 値が非負の有限数であることを確認する
 * @param value
 * @returns {*}
 */
function nonNegative(value) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError("value must be a non-negative finite number");
  }

  return value;
}

/**
 * 値をminとmaxの範囲に収める
 * @param value
 * @param min
 * @param max
 * @returns {number}
 */
function clampAxis(value, min, max) {
  if (min > max) {
    return (min + max) / 2;
  }

  return Math.min(max, Math.max(min, value));
}
