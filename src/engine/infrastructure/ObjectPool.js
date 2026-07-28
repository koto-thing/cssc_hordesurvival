/** オブジェクトの生成と再利用を管理するプール */
export class ObjectPool {
  /** オブジェクトプールを初期化する */
  constructor({ createObject, onGet = null, onRelease = null, initialSize = 0 }) {
    this.createObject = createObject;
    this.onGet = onGet;
    this.onRelease = onRelease;

    this.availableObjects = [];
    this.activeObjects = [];

    for (let i = 0; i < initialSize; ++i) {
      const object = this.createObject();
      this.availableObjects.push(object);
    }
  }

  /**
   * オブジェクトをプールから取得する
   * @returns {*} 取得したオブジェクト
   */
  get() {
    const object = this.availableObjects.pop() ?? this.createObject();

    this.activeObjects.push(object);
    this.onGet?.(object);

    return object;
  }

  /**
   * オブジェクトをプールに返却する
   * @param object {any} 返却するオブジェクト
   * @returns {boolean} 返却に成功した場合はtrue、失敗した場合はfalse
   */
  release(object) {
    const index = this.activeObjects.indexOf(object);
    if (index < 0) {
      return false;
    }

    this.activeObjects.splice(index, 1);
    this.onRelease?.(object);
    this.availableObjects.push(object);

    return true;
  }

  /**
   * プール内の非アクティブなオブジェクトを解放する
   */
  releaseInactiveObjects() {
    for (const object of this.activeObjects.slice()) {
      if (!object.active) {
        this.release(object);
      }
    }
  }

  /**
   * プール内のすべてのオブジェクトを解放する
   */
  clear() {
    this.availableObjects.length = 0;
    this.activeObjects.length = 0;
  }
}
