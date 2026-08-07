import { AssetManager, Game, SceneManager, setUIInteractionFeedback } from "./engine/index.js";
import { TitleScene } from "./scenes/titleScene.js";
import { GameScene } from "./scenes/gameScene.js";
import { bulletList } from "./assets/assetList.js";
import { GameAudioSettings } from "./settings/GameAudioSettings.js";
import { MainMenuScene } from "./scenes/mainMenuScene.js";
import { CreditsScene } from "./scenes/creditsScene.js";
import { GameSoundEffects } from "./audio/GameSoundEffects.js";

async function main() {
  // ゲーム本体を作成
  const game = new Game("gameCanvas");

  // アセット登録
  const assetManager = new AssetManager();
  assetManager.register(bulletList);

  // アセットをロード
  await assetManager.load();
  const audioSettings = new GameAudioSettings();
  const soundEffects = new GameSoundEffects();
  setUIInteractionFeedback(() => soundEffects.playButtonClick());
  const gameSetup = {
    characterId: null,
    stageId: null,
  };

  // シーンマネージャーを作成
  const sceneManager = new SceneManager(game.stage);
  game.onResize(({ width, height }) => {
    sceneManager.resize(width, height);
  });

  // シーンを登録
  sceneManager.register("title", () => new TitleScene({ sceneManager }));
  sceneManager.register("credits", () => new CreditsScene({ sceneManager }));
  sceneManager.register("mainMenu", () => new MainMenuScene({ sceneManager, gameSetup }));
  sceneManager.register(
    "game",
    () => new GameScene({ sceneManager, assetManager, audioSettings, soundEffects, gameSetup }),
  );

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
