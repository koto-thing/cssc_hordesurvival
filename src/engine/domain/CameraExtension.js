import { Camera } from "./Camera.js";
import { Component } from "./Component.js";

/**
 * Cinemachineのような追従制御をCameraへ追加するコンポーネント
 *
 * Cameraと同じGameObjectへ追加して使用する。追従対象の速度を使った先読み、
 * デッドゾーン、軸ごとの減衰、LookAt回転を組み合わせられる
 */
export class CameraExtension extends Component {
  /**
   * @param {{
   *   camera?: Camera|null,
   *   target?: object|null,
   *   offset?: {x?: number, y?: number},
   *   damping?: number|{x?: number, y?: number},
   *   deadZone?: {width?: number, height?: number},
   *   lookAheadTime?: number,
   *   lookAheadSmoothing?: number,
   *   maxLookAheadDistance?: number,
   *   lookAt?: boolean,
   *   rotationOffset?: number,
   *   rotationDamping?: number,
   *   snapOnEnable?: boolean
   * }} options
   */
  constructor({
    camera = null,
    target = null,
    offset = {},
    damping = 5,
    deadZone = {},
    lookAheadTime = 0,
    lookAheadSmoothing = 8,
    maxLookAheadDistance = Number.POSITIVE_INFINITY,
    lookAt = false,
    rotationOffset = 0,
    rotationDamping = 8,
    snapOnEnable = true,
  } = {}) {
    super();

    if (camera !== null && !(camera instanceof Camera)) {
      throw new TypeError("camera must be a Camera component");
    }

    this.camera = camera;
    this.target = null;
    this.offset = vector(offset);
    this.damping = dampingVector(damping);
    this.deadZone = size(deadZone);
    this.lookAheadTime = nonNegative(lookAheadTime, "lookAheadTime");
    this.lookAheadSmoothing = nonNegative(lookAheadSmoothing, "lookAheadSmoothing");
    this.maxLookAheadDistance = nonNegativeOrInfinity(maxLookAheadDistance, "maxLookAheadDistance");
    this.lookAt = Boolean(lookAt);
    this.rotationOffset = finite(rotationOffset, "rotationOffset");
    this.rotationDamping = nonNegative(rotationDamping, "rotationDamping");
    this.snapOnEnable = Boolean(snapOnEnable);

    this._previousTargetPosition = null;
    this._smoothedVelocity = { x: 0, y: 0 };
    this._hasSnapped = false;
    this.setTarget(target);
  }

  initialize() {
    this._resolveCamera();
    this.camera?.stopFollowing();
  }

  lateTick(deltaTime) {
    const camera = this._resolveCamera();
    const targetPosition = getPosition(this.target);
    if (!camera || !targetPosition || !this.transform) {
      return;
    }

    const dt = Math.max(0, Number(deltaTime) || 0);
    this._updateVelocity(targetPosition, dt);
    const desired = this._desiredPosition(targetPosition);

    if (this.snapOnEnable && !this._hasSnapped) {
      this.transform.position = desired;
      this._hasSnapped = true;
    } else {
      this.transform.x = damp(this.transform.x, desired.x, this.damping.x, dt);
      this.transform.y = damp(this.transform.y, desired.y, this.damping.y, dt);
    }

    if (this.lookAt) {
      const angle =
        (Math.atan2(targetPosition.y - this.transform.y, targetPosition.x - this.transform.x) *
          180) /
          Math.PI +
        this.rotationOffset;
      this.transform.rotation = dampAngle(this.transform.rotation, angle, this.rotationDamping, dt);
    }

    // CameraのlateTickより後にこの拡張が実行されても同じフレームへ反映する
    camera.apply();
  }

  /**
   *  追従対象を変更する。GameObject、Transform、または{x, y}を指定できる
   */
  setTarget(target, { snap = this.snapOnEnable } = {}) {
    if (target !== null && getPosition(target) === null) {
      throw new TypeError("target must be a GameObject, Transform, or object with finite x and y");
    }

    this.target = target;
    this._previousTargetPosition = getPosition(target);
    this._smoothedVelocity = { x: 0, y: 0 };
    this._hasSnapped = !snap;
  }

  /**
   *  現在位置から追従を再開し、急な位置ジャンプを防ぐ
   */
  resetTracking() {
    this._previousTargetPosition = getPosition(this.target);
    this._smoothedVelocity = { x: 0, y: 0 };
    this._hasSnapped = true;
  }

  /**
   * 次の更新で追従対象へ即座に移動する
   */
  snap() {
    this._hasSnapped = false;
  }

  /**
   * 対象がテレポートした際、先読み速度を発生させずカメラも同量移動する
   */
  onTargetWarped(deltaX, deltaY) {
    const x = finite(deltaX, "deltaX");
    const y = finite(deltaY, "deltaY");
    if (this.transform) {
      this.transform.translate(x, y);
    }

    if (this._previousTargetPosition) {
      this._previousTargetPosition.x += x;
      this._previousTargetPosition.y += y;
    }

    this.camera?.apply();
  }

  onDestroy() {
    this.camera = null;
    this.target = null;
    this._previousTargetPosition = null;
  }

  /**
   * Cameraコンポーネントを解決する
   * GameObjectにCameraがない場合はnullを返す
   * @returns {Camera|Component}
   * @private
   */
  _resolveCamera() {
    this.camera ??= this.gameObject?.getComponent(Camera) ?? null;
    return this.camera;
  }

  /**
   * 追従対象の速度を更新する
   * @param position
   * @param deltaTime
   * @private
   */
  _updateVelocity(position, deltaTime) {
    if (this._previousTargetPosition === null || deltaTime <= 0) {
      this._previousTargetPosition = { ...position };
      return;
    }

    const velocity = {
      x: (position.x - this._previousTargetPosition.x) / deltaTime,
      y: (position.y - this._previousTargetPosition.y) / deltaTime,
    };

    const amount =
      this.lookAheadSmoothing === 0 ? 1 : 1 - Math.exp(-this.lookAheadSmoothing * deltaTime);
    this._smoothedVelocity.x += (velocity.x - this._smoothedVelocity.x) * amount;
    this._smoothedVelocity.y += (velocity.y - this._smoothedVelocity.y) * amount;
    this._previousTargetPosition = { ...position };
  }

  /**
   * 追従対象の位置と速度から、カメラが目指すべき位置を計算する
   * @param targetPosition
   * @returns {{x: *, y: *}}
   * @private
   */
  _desiredPosition(targetPosition) {
    let lookAheadX = this._smoothedVelocity.x * this.lookAheadTime;
    let lookAheadY = this._smoothedVelocity.y * this.lookAheadTime;
    const distance = Math.hypot(lookAheadX, lookAheadY);
    if (distance > this.maxLookAheadDistance) {
      const scale = this.maxLookAheadDistance / distance;
      lookAheadX *= scale;
      lookAheadY *= scale;
    }

    const tracked = {
      x: targetPosition.x + this.offset.x + lookAheadX,
      y: targetPosition.y + this.offset.y + lookAheadY,
    };

    return {
      x: deadZonePosition(this.transform.x, tracked.x, this.deadZone.width / 2),
      y: deadZonePosition(this.transform.y, tracked.y, this.deadZone.height / 2),
    };
  }
}

/**
 * 追従対象の位置を取得する
 * GameObject、Transform、または{x, y}を指定できる
 * @param target
 * @returns {{x: *, y: *}|null}
 */
function getPosition(target) {
  const value = target?.transform ?? target;
  if (!value || !Number.isFinite(value.x) || !Number.isFinite(value.y)) {
    return null;
  }

  return { x: value.x, y: value.y };
}

/**
 * 追従対象のオフセットを正規化する
 * @param value
 * @returns {{x: *, y: *}}
 */
function vector(value) {
  return {
    x: finite(value.x ?? 0, "offset.x"),
    y: finite(value.y ?? 0, "offset.y"),
  };
}

/**
 * 追従対象の減衰を正規化する
 * @param value
 * @returns {{x: *, y: *}|{x: *, y: *}}
 */
function dampingVector(value) {
  if (typeof value === "number") {
    const damping = nonNegative(value, "damping");
    return { x: damping, y: damping };
  }

  return {
    x: nonNegative(value?.x ?? 5, "damping.x"),
    y: nonNegative(value?.y ?? 5, "damping.y"),
  };
}

/**
 * デッドゾーンのサイズを正規化する
 * @param value
 * @returns {{width: *, height: *}}
 */
function size(value) {
  return {
    width: nonNegative(value.width ?? 0, "deadZone.width"),
    height: nonNegative(value.height ?? 0, "deadZone.height"),
  };
}

/**
 * 減衰計算を行う
 * @param current
 * @param target
 * @param damping
 * @param deltaTime
 * @returns {*}
 */
function damp(current, target, damping, deltaTime) {
  if (damping === 0) {
    return target;
  }

  return current + (target - current) * (1 - Math.exp(-damping * deltaTime));
}

/**
 * 角度の減衰計算を行う
 * @param current
 * @param target
 * @param damping
 * @param deltaTime
 * @returns {*}
 */
function dampAngle(current, target, damping, deltaTime) {
  const difference = ((((target - current) % 360) + 540) % 360) - 180;
  return current + difference * (damping === 0 ? 1 : 1 - Math.exp(-damping * deltaTime));
}

/**
 * デッドゾーン内に追従対象がいる場合はカメラ位置を維持し、外に出た場合はデッドゾーンの端に追従対象を収める
 * @param cameraPosition
 * @param targetPosition
 * @param halfSize
 * @returns {number}
 */
function deadZonePosition(cameraPosition, targetPosition, halfSize) {
  if (targetPosition > cameraPosition + halfSize) {
    return targetPosition - halfSize;
  }

  if (targetPosition < cameraPosition - halfSize) {
    return targetPosition + halfSize;
  }

  return cameraPosition;
}

/**
 * 値が有限数であることを確認する
 * @param value
 * @param name
 * @returns {*}
 */
function finite(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }

  return value;
}

/**
 * 値が非負であることを確認する
 * @param value
 * @param name
 * @returns {*}
 */
function nonNegative(value, name) {
  const number = finite(value, name);
  if (number < 0) {
    throw new RangeError(`${name} must be non-negative`);
  }

  return number;
}

/**
 * 値が非負またはInfinityであることを確認する
 * @param value
 * @param name
 * @returns {*}
 */
function nonNegativeOrInfinity(value, name) {
  if (value === Number.POSITIVE_INFINITY) {
    return value;
  }

  return nonNegative(value, name);
}
