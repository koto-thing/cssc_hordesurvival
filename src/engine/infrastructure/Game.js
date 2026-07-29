import { InputSystem } from "./InputSystem.js";

import { UI_THEME } from "../../assets/uiTheme.js";

/**
 * 描画ステージとゲームループを管理するクラス
 */
export class Game {
  /**
   * コンストラクタ
   * @param canvasId {string} キャンバスのID
   */
  constructor(canvasId) {
    const canvas = document.getElementById(canvasId);

    // キャンバスが見つからない場合、エラー
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas ${canvasId} not found.`);
    }

    // キャンバスとステージを初期化する
    this.canvas = canvas;
    this.stage = new createjs.StageGL(canvas);
    this.stage.clearColor = UI_THEME.canvas;

    // ゲームループの状態を管理するフラグとハンドラ
    this.isRunning = false;
    this.tickHandler = null;
    this.resizeListeners = new Set();
    this.resizeHandler = () => {
      this.resizeCanvas();
    };

    // Tickerのフレームレートを設定する
    createjs.Ticker.framerate = 60;
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;

    // ウィンドウのリサイズイベントを購読する
    window.addEventListener("resize", this.resizeHandler);
    this.resizeCanvas();

    // Inputを初期化する
    InputSystem.initialize(canvas);
  }

  /**
   * ゲームの幅を取得する
   * @returns {*}
   */
  get width() {
    return this.canvas.width;
  }

  /**
   * ゲームの高さを取得する
   * @returns {*}
   */
  get height() {
    return this.canvas.height;
  }

  /**
   * ゲームのリサイズイベントを購読する
   * @param listener {function({width: number, height: number}): void} リサイズイベントのリスナー
   * @returns {(function(): void)|*} リスナーの購読を解除する関数
   */
  onResize(listener) {
    this.resizeListeners.add(listener);
    listener({
      width: this.width,
      height: this.height,
    });

    return () => {
      this.resizeListeners.delete(listener);
    };
  }

  /**
   * ゲームのキャンバスをリサイズする
   */
  resizeCanvas() {
    const width = Math.max(1, Math.floor(window.innerWidth));
    const height = Math.max(1, Math.floor(window.innerHeight));

    if (this.canvas.width === width && this.canvas.height === height) {
      return;
    }

    this.canvas.width = width;
    this.canvas.height = height;

    this.stage.updateViewport?.(width, height);

    for (const listener of this.resizeListeners) {
      listener({ width, height });
    }

    this.stage.update();
  }

  /**
   * ゲームを開始する
   * @param updateCallback {function(number): void} 更新コールバック関数
   */
  start(updateCallback) {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    this.tickHandler = (event) => {
      const deltaTime = event.delta / 1000;

      InputSystem.tick();

      updateCallback(deltaTime);

      this.stage.update(event);

      InputSystem.lateTick();
    };

    createjs.Ticker.addEventListener("tick", this.tickHandler);
  }

  /**
   * ゲームを停止する
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    createjs.Ticker.removeEventListener("tick", this.tickHandler);

    this.tickHandler = null;
  }

  /**
   * ゲームを破棄する
   */
  dispose() {
    this.stop();
    InputSystem.dispose();
    window.removeEventListener("resize", this.resizeHandler);

    this.stage.removeAllChildren();
    this.stage.removeAllEventListeners();
    this.resizeListeners.clear();
  }
}
