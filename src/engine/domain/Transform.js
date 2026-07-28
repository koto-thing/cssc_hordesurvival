import { Component } from "./Component.js";

/**
 * ゲームオブジェクトの位置、回転、拡縮を管理するコンポーネント
 */
export class Transform extends Component {
  /**
   * コンストラクタ
   * @param renderTarget {object} トランスフォームの対象となる表示オブジェクト
   */
  constructor(renderTarget) {
    super();
    this.renderTarget = renderTarget;
  }

  /**
   * ゲームオブジェクトのx座標の位置を取得する
   * @returns {*}
   */
  get x() {
    return this.renderTarget.x;
  }

  /**
   * ゲームオブジェクトのx座標を新たに設定する
   * @param value 新たなx座標
   */
  set x(value) {
    this.renderTarget.x = value;
  }

  /**
   * ゲームオブジェクトのy座標の位置を取得する
   * @returns {*}
   */
  get y() {
    return this.renderTarget.y;
  }

  /**
   * ゲームオブジェクトのy座標を新たに設定する
   * @param value 新たなy座標
   */
  set y(value) {
    this.renderTarget.y = value;
  }

  /**
   * ゲームオブジェクトの位置を取得または設定する
   * @returns {{x: *, y: *}} x, y座標
   */
  get position() {
    return { x: this.x, y: this.y };
  }

  /**
   * ゲームオブジェクトの位置を新たに設定する
   * @param value {{x: number, y: number}} 新たなx, y座標
   */
  set position(value) {
    this.x = value.x;
    this.y = value.y;
  }

  /**
   * ゲームオブジェクトの回転を取得する
   * @returns {number} 回転角度
   */
  get rotation() {
    return this.renderTarget.rotation;
  }

  /**
   * ゲームオブジェクトの回転を設定する
   * @param value 新たな回転角度
   */
  set rotation(value) {
    this.renderTarget.rotation = value;
  }

  /**
   * ゲームオブジェクトのx方向のスケールを取得する
   * @returns {number} x方向のスケール
   */
  get scaleX() {
    return this.renderTarget.scaleX;
  }

  /**
   * ゲームオブジェクトのx方向のスケールを新たに設定する
   * @param value 新たなx方向のスケール
   */
  set scaleX(value) {
    this.renderTarget.scaleX = value;
  }

  /**
   * ゲームオブジェクトのy方向のスケールを取得する
   * @returns {number} y方向のスケール
   */
  get scaleY() {
    return this.renderTarget.scaleY;
  }

  /**
   * ゲームオブジェクトのy方向のスケールを新たに設定する
   * @param value 新たなy方向のスケール
   */
  set scaleY(value) {
    this.renderTarget.scaleY = value;
  }

  /**
   * ゲームオブジェクトのスケールを設定する
   * @param x {number} 新しいスケールX
   * @param y {number} 新しいスケールY
   */
  setScale(x, y = x) {
    this.scaleX = x;
    this.scaleY = y;
  }

  /**
   * ゲームオブジェクトの位置を移動する
   * @param dx x方向の移動量
   * @param dy y方向の移動量
   */
  translate(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}
