import { Transform } from "./Transform.js";

/**
 * 表示を部ジェクトと複数のコンポーネントを管理するゲームオブジェクト
 */
export class GameObject {
  /**
   * コンストラクタ
   * @param name {string} ゲームオブジェクトの名前
   * @param view {object} ゲームオブジェクトのビュー（表示オブジェクト）
   */
  constructor(name = "GameObject", view = null) {
    this.name = name;
    this.active = true;
    this.destroyed = false;

    this.view = view ?? {
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      visible: true,
      removeAllEventListeners() {},
    };

    this.components = [];
    this.transform = new Transform(this.view);
    this.addComponent(this.transform);
  }

  /**
   * ゲームオブジェクトにコンポーネントを追加する
   * @param component {Component} 追加するコンポーネント
   * @returns {*}
   */
  addComponent(component) {
    if (this.destroyed) {
      throw new Error(`Cannot add component to destroyed GameObject: "${this.name}"`);
    }

    if (component.gameObject !== null) {
      throw new Error("This component has already attached to a GameObject");
    }

    component.gameObject = this;
    this.components.push(component);
    component.initialize();

    return component;
  }

  /**
   * ゲームオブジェクトからコンポーネントを取得する
   * @param ComponentType {function} 取得するコンポーネントの型
   * @returns {import("./Component.js").Component|null}
   */
  getComponent(ComponentType) {
    return this.components.find((component) => component instanceof ComponentType) ?? null;
  }

  /**
   * ゲームオブジェクトから指定された型のすべてのコンポーネントを取得する
   * @param ComponentType {function} 取得するコンポーネントの型
   * @returns {import("./Component.js").Component[]}
   */
  getComponents(ComponentType) {
    return this.components.filter((component) => component instanceof ComponentType);
  }

  /**
   * ゲームオブジェクトが指定された方のコンポーネントを持っているかどうかをチェックする
   * @param ComponentType {function} 確認するコンポーネントの型
   * @returns {boolean} コンポーネントを持っているかどうか
   */
  hasComponent(ComponentType) {
    return this.getComponent(ComponentType) !== null;
  }

  /**
   * ゲームオブジェクトからコンポーネントを削除する
   * @param componentOrType {import("./Component.js").Component|function} 削除するコンポーネントまたはその型
   * @returns {boolean} 削除に成功したかどうか
   */
  removeComponent(componentOrType) {
    const index =
      typeof componentOrType === "function"
        ? this.components.findIndex((component) => component instanceof componentOrType)
        : this.components.indexOf(componentOrType);

    if (index < 0) {
      return false;
    }

    const component = this.components[index];
    if (component === this.transform) {
      throw new Error("Transform cannot be removed");
    }

    this.components.splice(index, 1);
    component.onDestroy();
    component.gameObject = null;
    return true;
  }

  /**
   * ゲームオブジェクトを更新する
   * @param deltaTime {number} 前のフレームからの経過時間
   */
  tick(deltaTime) {
    if (!this.active || this.destroyed) {
      return;
    }

    for (const component of this.components.slice()) {
      if (!component.enabled) {
        continue;
      }

      if (!component._initialized) {
        component._initialized = true;
        component.initialize();
      }

      component.tick(deltaTime);
    }
  }

  /**
   * ゲームオブジェクトの更新後に呼び出される
   * @param deltaTime {number} 前フレームからの経過時間
   */
  lateTick(deltaTime) {
    if (!this.active || this.destroyed) {
      return;
    }

    for (const component of this.components.slice()) {
      if (component.enabled && component._initialized) {
        component.lateTick(deltaTime);
      }
    }
  }

  /**
   * ゲームオブジェクトのアクティブ除隊を設定する
   * @param active {boolean} アクティブ状態
   */
  setActive(active) {
    this.active = active;
    this.view.visible = active;
  }

  /**
   * ゲームオブジェクトを破棄する
   */
  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;

    for (const component of [...this.components].reverse()) {
      component.onDestroy();
      component.gameObject = null;
    }

    this.components.length = 0;
    this.view.removeAllEventListeners?.();
    this.view.parent?.removeChild(this.view);
  }
}
