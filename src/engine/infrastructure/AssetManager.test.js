import { beforeAll, describe, expect, it } from "vite-plus/test";

class LoadQueue {
  constructor() {
    this.listeners = new Map();
    this.results = new Map();
  }

  installPlugin() {}

  on(type, listener) {
    this.listeners.set(type, listener);
  }

  loadManifest(manifest) {
    for (const asset of manifest) {
      this.results.set(asset.id, asset.testResult);
    }
    this.listeners.get("complete")();
  }

  getResult(id) {
    return this.results.get(id);
  }
}

let AssetManager;

beforeAll(async () => {
  globalThis.createjs = {
    LoadQueue,
    Sound: {},
    Types: {
      IMAGE: "image",
    },
  };

  globalThis.document = {
    createElement: () => {
      const context = {
        clearRect() {},
        drawImage(source) {
          this.source = source;
        },
      };

      return {
        width: 0,
        height: 0,
        context,
        getContext: () => context,
      };
    },
  };

  ({ AssetManager } = await import("./AssetManager.js"));
});

describe("AssetManager", () => {
  it("rasterizes SVG images for StageGL", async () => {
    const svgImage = { naturalWidth: 512, naturalHeight: 256 };
    const assetManager = new AssetManager();
    assetManager.register([
      {
        id: "icon",
        src: "/icon.svg",
        type: createjs.Types.IMAGE,
        testResult: svgImage,
      },
    ]);

    await assetManager.load();
    const result = assetManager.get("icon");

    expect(result).not.toBe(svgImage);
    expect(result.width).toBe(512);
    expect(result.height).toBe(256);
    expect(result.context.source).toBe(svgImage);
  });
});
