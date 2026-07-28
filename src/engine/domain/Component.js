/**
 * GameObject へ追加できるふるまいの基底クラス
 */
export class Component {
  /**
   * コンストラクタ
   */
  constructor() {
    this.gameObject = null;
    this.enabled = true;
    this._initialized = false;
  }

  /**
   * ゲームオブジェクトのトランスフォームを取得する
   * @returns {import("./Transform.js").Transform|null}
   */
  get transform() {
    return this.gameObject?.transform ?? null;
  }

  /**
   * コンポーネントが初期化された時に呼び出される
   */
  initialize() {}

  /**
   * initialize() 後に呼び出される
   */
  lateInitialize() {}

  /**
   * コンポーネントが更新されるたびに呼び出される
   */
  tick() {}

  /**
   * tick() が呼ばれた後に呼び出される
   */
  lateTick() {}

  /**
   * コンポーネントが破棄されるときに呼び出される
   */
  onDestroy() {}

  /**
   * コンポーネントを破棄する
   */
  destroy() {
    this.gameObject?.destroy();
  }
}
