/**
 * 描画を行わない単体テストでクラス定義を読み込むための最小限のCreateJS環境
 */
class TestContainer {}
class TestFilter {}

globalThis.createjs ??= {};
globalThis.createjs.Container ??= TestContainer;
globalThis.createjs.Filter ??= TestFilter;
