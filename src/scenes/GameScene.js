import { bulletList } from "../assets/bulletList.js";
import { enemyList } from "../assets/enemyList.js";
import { waveList } from "../assets/waveList.js";
import { BulletFactory } from "../bullet/bulletFactory.js";
import { BulletSpawner } from "../bullet/bulletSpawner.js";
import { CombatCollisionController } from "../combat/CombatCollisionController.js";
import { CombatFeedbackView } from "../combat/CombatFeedbackView.js";
import { EnemyFactory } from "../enemy/enemyFactory.js";
import { EnemySpawner } from "../enemy/enemySpawner.js";
import { Scene } from "../engine/index.js";
import { HUDUIView } from "../gameScene/HUDUIView.js";
import { GameRenderLayers } from "../gameScene/GameRenderLayers.js";
import { GameResultController } from "../gameScene/GameResultController.js";
import { GameResultView } from "../gameScene/GameResultView.js";
import { PauseMenuController } from "../gameScene/PauseMenuController.js";
import { PauseMenuView } from "../gameScene/PauseMenuView.js";
import { Player } from "../player/player.js";
import { PlayerShotController } from "../player/playerShotController.js";
import { PlayerView } from "../player/playerView.js";
import { SpawnPositionResolver } from "../wave/spawnPositionResolver.js";
import { WaveController } from "../wave/waveController.js";

export class GameScene extends Scene {
  constructor({ sceneManager, assetManager, audioSettings }) {
    super();

    this.sceneManager = sceneManager;
    this.assetManager = assetManager;
    this.audioSettings = audioSettings;
    this.renderLayers = null;
    this.hud = null;
    this.player = null;
    this.playerView = null;
    this.bulletSpawner = null;
    this.enemySpawner = null;
    this.waveController = null;
    this.bullets = [];
    this.enemies = [];
    this.defeatedEnemies = 0;
    this.score = 0;
    this.combatFeedbackView = new CombatFeedbackView();
    this.combatCollisionController = new CombatCollisionController({
      onPlayerBulletHit: (hit) => this.combatFeedbackView.showPlayerHit(hit),
    });
    this.gameResultController = new GameResultController({
      onResultChanged: (result) => this.#showResult(result),
      onReturnRequested: () => this.sceneManager.changeScene("title"),
    });
    this.gameResultView = null;
    this.pauseMenuView = null;
    this.pauseMenuController = new PauseMenuController({
      onStateChanged: (state) => this.pauseMenuView?.show(state),
      onReturnToTitle: () => this.sceneManager.changeScene("title"),
    });
    this.returnToTitleHandler = () => this.gameResultController.requestReturn();
  }

  /**
   * シーン開始時にゲームオブジェクトを初期化する
   */
  initialize() {
    this.renderLayers = new GameRenderLayers();
    this.renderLayers.attachTo(this.root);
    this.hud = new HUDUIView({
      menuIconSource: this.assetManager.get("menuIcon"),
      onMenuRequested: () => this.pauseMenuController.open(),
    });
    this.gameResultView = new GameResultView();
    this.pauseMenuView = new PauseMenuView({
      initialVolume: this.audioSettings.volume,
      onReturnToTitle: () => this.pauseMenuController.returnToTitle(),
      onOpenOptions: () => this.pauseMenuController.openOptions(),
      onResume: () => this.pauseMenuController.resume(),
      onReturnToMenu: () => this.pauseMenuController.returnToMenu(),
      onVolumeChanged: (volume) => this.audioSettings.setVolume(volume),
    });

    /* HUD */
    this.hud.setDefeatedEnemies(0);
    this.hud.setScore(0);

    /* Player and bullets */
    this.playerView = new PlayerView();
    const bulletFactory = new BulletFactory({
      assetManager: this.assetManager,
    });
    this.bulletSpawner = new BulletSpawner({
      bulletFactory,
      bulletDefinitions: bulletList,
      onSpawn: (bullet) => {
        this.bullets.push(bullet);
        this.renderLayers.world.addChild(bullet.view);
      },
    });
    this.player = new Player({
      view: this.playerView.playerDisplay,
      playerShotController: new PlayerShotController({
        bulletSpawner: this.bulletSpawner,
      }),
    });
    this.playerView.bind(this.player.statusController);

    /* Enemy */
    const enemyFactory = new EnemyFactory({
      assetManager: this.assetManager,
    });
    this.enemySpawner = new EnemySpawner({
      enemyFactory,
      enemyDefinitions: enemyList,
      target: this.player,
      onSpawn: (enemy) => {
        this.enemies.push(enemy);
        this.renderLayers.world.addChild(enemy.view);
      },
    });
    this.waveController = new WaveController({
      waves: waveList,
      enemySpawner: this.enemySpawner,
      spawnPositionResolver: new SpawnPositionResolver(),
      getViewport: () => ({
        width: this.width,
        height: this.height,
      }),
      onTimeChanged: (remainingTime) => {
        this.hud.setRemainingTime(remainingTime);
      },
      onCompleted: () => {
        this.gameResultController.clear();
      },
    });

    this.renderLayers.world.addChild(this.player.view);
    this.renderLayers.combatFeedback.addChild(this.combatFeedbackView.view);
    this.renderLayers.hud.addChild(this.playerView.hudView, this.hud.view);
    this.renderLayers.result.addChild(this.gameResultView.view);
    this.renderLayers.menu.addChild(this.pauseMenuView.view);
    this.layout();
  }

  /**
   * ゲームオブジェクトを毎フレーム更新する
   * @param deltaTime 前フレームからの経過時間
   */
  tick(deltaTime) {
    if (this.gameResultController.result !== null || this.pauseMenuController.isPaused) {
      return;
    }

    this.waveController?.tick(deltaTime);
    if (this.gameResultController.result !== null) {
      return;
    }

    this.player?.tick(deltaTime);
    this.player?.lateTick(deltaTime);
    for (const bullet of this.bullets) {
      bullet.tick(deltaTime);
      bullet.lateTick(deltaTime);
    }
    for (const enemy of this.enemies) {
      enemy.tick(deltaTime);
      enemy.lateTick(deltaTime);
    }

    const combatResult = this.combatCollisionController.resolve({
      player: this.player,
      enemies: this.enemies,
      bullets: this.bullets,
    });
    this.defeatedEnemies += combatResult.defeatedEnemies;
    this.score += combatResult.scoreGained;
    this.hud.setDefeatedEnemies(this.defeatedEnemies);
    this.hud.setScore(this.score);
    this.playerView?.sync(deltaTime);
    this.combatFeedbackView.tick(deltaTime);

    if (this.player.statusController.health <= 0) {
      this.gameResultController.gameOver();
    }

    this.bullets = this.bullets.filter((bullet) => !bullet.destroyed);
    this.enemies = this.enemies.filter((enemy) => !enemy.destroyed);
  }

  /**
   * シーン内のオブジェクトを破棄する
   */
  exit() {
    this.#removeReturnListeners();
    this.hud?.destroy();
    this.player?.destroy();
    this.playerView?.destroy();
    this.combatFeedbackView.destroy();
    this.pauseMenuView?.dispose();
    for (const bullet of this.bullets) {
      bullet.destroy();
    }
    for (const enemy of this.enemies) {
      enemy.destroy();
    }

    this.hud = null;
    this.renderLayers = null;
    this.player = null;
    this.playerView = null;
    this.bulletSpawner = null;
    this.enemySpawner = null;
    this.waveController = null;
    this.gameResultView = null;
    this.pauseMenuView = null;
    this.bullets = [];
    this.enemies = [];
    this.defeatedEnemies = 0;
    this.score = 0;
  }

  /**
   * シーンの表示領域を変更する
   * @param width 表示幅
   * @param height 表示高さ
   */
  resize(width, height) {
    super.resize(width, height);
    this.layout();
  }

  /**
   * HUDとプレイヤーを現在の表示領域へ配置する
   */
  layout() {
    if (this.hud === null || this.playerView === null) {
      return;
    }

    this.hud.transform.x = 0;
    this.hud.transform.y = 0;
    this.hud.layout(this.width);

    this.player.transform.x = this.width / 2;
    this.player.transform.y = this.height / 2;
    this.playerView.layout(this.width);
    this.gameResultView?.layout(this.width, this.height);
    this.pauseMenuView?.layout(this.width, this.height);
  }

  /**
   * ゲーム終了結果を表示してタイトルへ戻る入力を受け付ける
   * @param result ゲーム終了結果
   */
  #showResult(result) {
    this.gameResultView.show(result);
    this.gameResultView.layout(this.width, this.height);
    window.addEventListener("mousedown", this.returnToTitleHandler);
    window.addEventListener("keydown", this.returnToTitleHandler);
  }

  /**
   * タイトルへ戻る入力の監視を解除する
   */
  #removeReturnListeners() {
    window.removeEventListener("mousedown", this.returnToTitleHandler);
    window.removeEventListener("keydown", this.returnToTitleHandler);
  }
}
