import "./style.css";

import { AssetManager, Game, SceneManager } from "./engine/index.js";
import { TitleScene } from "./scenes/TitleScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { bulletList } from "./assets/assetList.js";

async function main() {
  // ゲーム本体を作成
  const game = new Game("gameCanvas");

  // アセット登録
  const assetManager = new AssetManager();
  assetManager.register(bulletList);

  await assetManager.load();

  // シーンマネージャーを作成
  const sceneManager = new SceneManager(game.stage);
  game.onResize(({ width, height }) => {
    sceneManager.resize(width, height);
  });

  // シーンを登録
  sceneManager.register("title", () => new TitleScene({ sceneManager, assetManager }));
  sceneManager.register("game", () => new GameScene({ sceneManager, assetManager }));

  // 起動時のシーンを設定
  sceneManager.changeScene("title");

  // ゲームループ
  game.start((deltaTime) => {
    sceneManager.tick(deltaTime);
  });
}

main().catch((error) => {
  console.error("Error while initializing game", error);
});
