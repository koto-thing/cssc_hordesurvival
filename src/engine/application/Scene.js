/**
 * ゲーム内の各シーンに共通するライフサイクルと表示領域を管理
 */
export class Scene {
  /**
   * シーンを初期化する
   */
  constructor() {
    this.root = new createjs.Container();
    this.viewport = {
      width: 0,
      height: 0,
    };
  }

  /**
   * シーンのビューポートの幅を取得する
   * @returns {number} シーンのビューポートの幅
   */
  get width() {
    return this.viewport.width;
  }

  /**
   * シーンのビューポートの高さを取得する
   * @returns {number} シーンのビューポートの高さ
   */
  get height() {
    return this.viewport.height;
  }

  /**
   * シーンが開始された時に呼び出される
   */
  initialize() {}

  /**
   * シーンが更新されるたびに呼び出される
   * @param deltaTime {number} 前のフレームからの経過時間
   */
  tick(_deltaTime) {}

  /**
   * シーンが終了するときに呼び出される
   */
  exit() {}

  /**
   * シーンのビューポートのサイズを変更する
   * @param width {number} ビューポートの幅
   * @param height {number} ビューポートの高さ
   */
  resize(width, height) {
    this.viewport.width = width;
    this.viewport.height = height;
  }

  /**
   * シーンを破棄する
   */
  dispose() {
    this.root.removeAllEventListeners();
    this.root.removeAllChildren();
  }
}
