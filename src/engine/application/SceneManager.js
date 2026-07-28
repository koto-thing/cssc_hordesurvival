/**
 * シーンの登録、切り替え、更新を管理するクラス
 */
export class SceneManager {
  /**
   * コンストラクタ
   * @param stage {createjs.Stage} ゲームのステージ
   */
  constructor(stage) {
    this.stage = stage;
    this.sceneFactories = new Map();
    this.currentScene = null;
    this.nextSceneName = null;
    this.viewport = {
      width: stage.canvas.width,
      height: stage.canvas.height,
    };
  }

  /**
   * シーンを登録する
   * @param name {string} シーンの名前
   * @param factory {function(): Scene} シーンを生成するファクトリ関数
   */
  register(name, factory) {
    if (this.sceneFactories.has(name)) {
      throw new Error(`Scene "${name}" is already registered.`);
    }

    this.sceneFactories.set(name, factory);
  }

  /**
   * シーンを変更する
   * @param name {string} シーンの名前
   */
  changeScene(name) {
    if (!this.sceneFactories.has(name)) {
      throw new Error(`Scene "${name}" is not registered.`);
    }

    // update中二即座にシーンを破棄しないために予約しとく
    this.nextSceneName = name;
  }

  /**
   * シーンを更新する
   * @param deltaTime {number} 前フレームからの経過時間
   */
  tick(deltaTime) {
    if (this.nextSceneName !== null) {
      this.applySceneChange();
    }

    this.currentScene?.tick(deltaTime);
  }

  /**
   * シーンのビューポートのサイズを変更する
   * @param width {number} 新しい幅
   * @param height {number} 新しい高さ
   */
  resize(width, height) {
    this.viewport.width = width;
    this.viewport.height = height;
    this.currentScene?.resize(width, height);
  }

  /**
   * シーンの変更を適用する
   */
  applySceneChange() {
    if (this.currentScene !== null) {
      this.currentScene.exit();
      this.stage.removeChild(this.currentScene.root);
      this.currentScene.dispose();
    }

    const factory = this.sceneFactories.get(this.nextSceneName);

    this.currentScene = factory();
    this.nextSceneName = null;

    this.currentScene.resize(this.viewport.width, this.viewport.height);
    this.stage.addChild(this.currentScene.root);
    this.currentScene.initialize();
  }
}
