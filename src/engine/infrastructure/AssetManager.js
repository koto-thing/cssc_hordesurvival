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
    this.processedAssets = new Map();
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
        try {
          this.#rasterizeSvgImages();
          this.isLoaded = true;
          resolve();
        } catch (error) {
          reject(error);
        }
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

    const result = this.processedAssets.get(id) ?? this.queue.getResult(id);
    if (result === null || result === undefined) {
      throw new Error(`Asset with id ${id} not found.`);
    }

    return result;
  }

  /**
   * StageGLでSVGが黒い矩形になる問題を避けるため、読み込み済みSVGをCanvasへ変換する
   */
  #rasterizeSvgImages() {
    for (const asset of this.manifest) {
      if (asset.type !== createjs.Types.IMAGE || !isSvgSource(asset.src)) {
        continue;
      }

      const image = this.queue.getResult(asset.id);
      const width = image?.naturalWidth ?? image?.width ?? 0;
      const height = image?.naturalHeight ?? image?.height ?? 0;

      if (width <= 0 || height <= 0) {
        throw new Error(`SVG asset has no drawable size: ${asset.id}`);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (context === null) {
        throw new Error(`Failed to create canvas for SVG asset: ${asset.id}`);
      }

      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      this.processedAssets.set(asset.id, canvas);
    }
  }
}

function isSvgSource(source) {
  return typeof source === "string" && /\.svg(?:[?#]|$)/i.test(source);
}
