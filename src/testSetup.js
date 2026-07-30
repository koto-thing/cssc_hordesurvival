/**
 * 描画を行わない単体テストでクラス定義を読み込むための最小限のCreateJS環境
 */
class TestContainer {
  constructor() {
    this.children = [];
    this.handlers = {};
  }

  addChild(...children) {
    this.children.push(...children);
  }

  on(type, listener) {
    this.handlers[type] = listener;
  }
}
class TestFilter {}

globalThis.createjs ??= {};
globalThis.createjs.Container ??= TestContainer;
globalThis.createjs.Filter ??= TestFilter;
globalThis.createjs.Types ??= {
  IMAGE: "image",
  SOUND: "sound",
};
