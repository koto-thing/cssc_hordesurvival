/**
 * ゲームで使用するアセットの登録、読み込み、取得を管理するクラス
 */
export class AssetManager {
  /**
   * コンストラクタ
   */
  constructor() {
    this.queue = new createjs.LoadQueue();
    this.manifest = [];
    this.isLoaded = false;

    this.queue.installPlugin(createjs.Sound);
  }

  /**
   * アセットを登録する
   * @param assetList {Array} アセットのリスト
   */
  register(assetList) {
    if (this.isLoaded) {
      throw new Error("Cannot register assets after loading has started.");
    }

    this.manifest.push(...assetList);
  }

  /**
   * アセットをロードする
   * @returns {Promise<void>|Promise<unknown>}
   */
  load() {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.queue.on("complete", () => {
        this.isLoaded = true;
        resolve();
      });

      this.queue.on("error", (event) => {
        reject(new Error(`Failed to load asset: ${event.data?.src ?? "unknown"}`));
      });

      this.queue.loadManifest(this.manifest);
    });
  }

  /**
   * アセットを取得する
   * @param id {string} アセットのID
   * @returns {*}
   */
  get(id) {
    if (!this.isLoaded) {
      throw new Error("Assets are not loaded yet.");
    }

    const result = this.queue.getResult(id);
    if (result === null || result === undefined) {
      throw new Error(`Asset with id ${id} not found.`);
    }

    return result;
  }
}
