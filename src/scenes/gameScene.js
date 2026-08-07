import { bulletList } from "../assets/bulletList.js";
import { characterList } from "../assets/characterList.js";
import { commonUpgradeList } from "../assets/commonUpgradeList.js";
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
import { GameBackgroundView } from "../gameScene/GameBackgroundView.js";
import { GameRenderLayers } from "../gameScene/GameRenderLayers.js";
import { GameSceneMusic } from "../gameScene/GameSceneMusic.js";
import { GameResultController } from "../gameScene/GameResultController.js";
import { GameResultInputController } from "../gameScene/GameResultInputController.js";
import { GameResultView } from "../gameScene/GameResultView.js";
import { LevelUpView } from "../gameScene/LevelUpView.js";
import { PauseMenuController } from "../gameScene/PauseMenuController.js";
import { PauseMenuView } from "../gameScene/PauseMenuView.js";
import { Player } from "../player/player.js";
import { PlayerMoveController } from "../player/playerMoveController.js";
import { PlayerShotController } from "../player/playerShotController.js";
import { PlayerStatusController } from "../player/playerStatusController.js";
import { PlayerUpgradeController } from "../player/PlayerUpgradeController.js";
import { PlayerView } from "../player/playerView.js";
import { SpawnPositionResolver } from "../wave/spawnPositionResolver.js";
import { WaveController } from "../wave/waveController.js";

export class GameScene extends Scene {
  constructor({ sceneManager, assetManager, audioSettings, soundEffects, gameSetup }) {
    super();

    this.sceneManager = sceneManager;
    this.assetManager = assetManager;
    this.audioSettings = audioSettings;
    this.soundEffects = soundEffects;
    this.gameSetup = gameSetup;
    this.renderLayers = null;
    this.backgroundView = null;
    this.music = new GameSceneMusic();
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
      onPlayerHit: () => {
        this.playerView?.playHitFeedback();
        this.soundEffects.playPlayerHit();
      },
      onEnemyHit: () => this.soundEffects.playEnemyHit(),
      onEnemyDefeated: () => this.soundEffects.playEnemyDefeated(),
    });
    this.gameResultController = new GameResultController({
      onResultChanged: (result) => this.#showResult(result),
      onReturnRequested: () => this.sceneManager.changeScene("title"),
    });
    this.gameResultView = null;
    this.pauseMenuView = null;
    this.levelUpView = null;
    this.playerUpgradeController = null;
    this.pauseMenuController = new PauseMenuController({
      onStateChanged: (state) => this.pauseMenuView?.show(state),
      onReturnToTitle: () => this.sceneManager.changeScene("title"),
    });
    this.gameResultInputController = new GameResultInputController({
      onReturnRequested: () => this.gameResultController.requestReturn(),
    });
  }

  /**
   * シーン開始時にゲームオブジェクトを初期化する
   */
  initialize() {
    this.music.play();
    this.renderLayers = new GameRenderLayers();
    this.renderLayers.attachTo(this.root);
    this.backgroundView = new GameBackgroundView();
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
    this.levelUpView = new LevelUpView({
      onSelected: (upgradeId) => this.#selectUpgrade(upgradeId),
    });

    /* HUD */
    this.hud.setDefeatedEnemies(0);
    this.hud.setScore(0);

    /* Player and bullets */
    const character =
      characterList.find(({ id }) => id === this.gameSetup.characterId) ?? characterList[0];
    const characterGameplay = character.gameplay;
    this.playerView = new PlayerView({
      color: character.color,
      hurtBreakIconSource: this.assetManager.get("hurtBreakIcon"),
    });
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
        bulletId: characterGameplay.bulletId,
        shotInterval: characterGameplay.shotInterval,
        shotAngles: characterGameplay.shotAngles,
        shotRange: characterGameplay.shotRange,
      }),
      moveController: new PlayerMoveController({
        moveSpeed: characterGameplay.moveSpeed,
      }),
      statusController: new PlayerStatusController({
        health: characterGameplay.maxHealth,
        maxHealth: characterGameplay.maxHealth,
      }),
    });
    this.playerView.bind(this.player.statusController);
    this.playerUpgradeController = new PlayerUpgradeController({
      player: this.player,
      upgrades: [...character.upgrades, ...commonUpgradeList],
    });

    /* Enemy */
    const enemyFactory = new EnemyFactory({
      assetManager: this.assetManager,
      bulletSpawner: this.bulletSpawner,
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
      // ChallengeはWave構成を繰り返し、周回ごとに敵の出現頻度を上げる
      repeats: this.gameSetup.stageId === "challenge",
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

    // レイヤーにゲームオブジェクトを追加する
    this.renderLayers.background.addChild(this.backgroundView.view);
    this.renderLayers.world.addChild(this.player.view);
    this.renderLayers.combatFeedback.addChild(this.combatFeedbackView.view);
    this.renderLayers.hud.addChild(this.playerView.hudView, this.hud.view);
    this.renderLayers.result.addChild(this.gameResultView.view);
    this.renderLayers.menu.addChild(this.pauseMenuView.view);
    this.renderLayers.menu.addChild(this.levelUpView.view);
    this.layout();
  }

  /**
   * ゲームオブジェクトを毎フレーム更新する
   * @param deltaTime 前フレームからの経過時間
   */
  tick(deltaTime) {
    // HUD、ゲーム結果、ポーズメニュー、強化選択の表示を更新する
    this.levelUpView?.tick(deltaTime);
    this.playerView?.tickPresentation(deltaTime);

    // ゲーム終了、ポーズ、強化選択中はゲーム進行を停止する
    if (
      this.gameResultController.result !== null ||
      this.pauseMenuController.isPaused ||
      this.playerUpgradeController?.isSelecting
    ) {
      return;
    }

    // WaveControllerを更新し、必要に応じて敵を出現させる
    this.waveController?.tick(deltaTime);
    if (this.gameResultController.result !== null) {
      return;
    }

    // プレイヤー、弾、敵の状態を更新する
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

    // 戦闘の衝突判定を行い、結果を反映する
    const levelBeforeCombat = this.player.statusController.level;
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
    const gainedLevels = this.player.statusController.level - levelBeforeCombat;
    if (gainedLevels > 0) {
      this.soundEffects.playLevelUp();
      this.playerUpgradeController.enqueue(gainedLevels);
      this.playerView.playLevelUpFeedback();
      this.levelUpView.showAfterLevelUp(this.playerUpgradeController.getChoices());
    }

    // プレイヤーの体力が0以下になった場合、ゲームオーバーを表示する
    if (this.player.statusController.health <= 0) {
      this.gameResultController.gameOver();
    }

    // 破棄されたオブジェクトを配列から削除する
    this.bullets = this.bullets.filter((bullet) => !bullet.destroyed);
    this.enemies = this.enemies.filter((enemy) => !enemy.destroyed);
  }

  /**
   * シーン内のオブジェクトを破棄する
   */
  exit() {
    this.music.stop();
    this.gameResultInputController.disable();
    this.hud?.destroy();
    this.player?.destroy();
    this.playerView?.destroy();
    this.combatFeedbackView.destroy();
    this.pauseMenuView?.dispose();
    this.levelUpView?.dispose();
    for (const bullet of this.bullets) {
      bullet.destroy();
    }
    for (const enemy of this.enemies) {
      enemy.destroy();
    }

    this.hud = null;
    this.renderLayers = null;
    this.backgroundView = null;
    this.player = null;
    this.playerView = null;
    this.bulletSpawner = null;
    this.enemySpawner = null;
    this.waveController = null;
    this.gameResultView = null;
    this.pauseMenuView = null;
    this.levelUpView = null;
    this.playerUpgradeController = null;
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

    this.backgroundView?.layout(this.width, this.height);
    this.gameResultView?.layout(this.width, this.height);
    this.pauseMenuView?.layout(this.width, this.height);
    this.levelUpView?.layout(this.width, this.height);
  }

  /**
   * 選択した強化を適用し、残りの選択またはゲーム再開へ進める
   * @param upgradeId 選択した強化ID
   */
  #selectUpgrade(upgradeId) {
    if (!this.playerUpgradeController?.select(upgradeId)) {
      return;
    }

    if (this.playerUpgradeController.isSelecting) {
      this.levelUpView.show(this.playerUpgradeController.getChoices());
      return;
    }

    this.levelUpView.hide();
  }

  /**
   * ゲーム終了結果を表示してタイトルへ戻る入力を受け付ける
   * @param result ゲーム終了結果
   */
  #showResult(result) {
    if (result === "clear") {
      this.soundEffects.playGameClear();
    } else {
      this.soundEffects.playGameOver();
    }

    this.gameResultView.show(result);
    this.gameResultView.layout(this.width, this.height);
    this.gameResultInputController.enable();
  }
}
