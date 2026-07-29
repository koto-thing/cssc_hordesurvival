import { bulletList } from "../assets/bulletList.js";
import { enemyList } from "../assets/enemyList.js";
import { BulletFactory } from "../bullet/bulletFactory.js";
import { BulletSpawner } from "../bullet/bulletSpawner.js";
import { EnemyFactory } from "../enemy/enemyFactory.js";
import { EnemySpawner } from "../enemy/enemySpawner.js";
import { Scene } from "../engine/index.js";
import { HUDUIView } from "../gameScene/HUDUIView.js";
import { Player } from "../player/player.js";
import { PlayerShotController } from "../player/playerShotController.js";
import { PlayerView } from "../player/playerView.js";

export class GameScene extends Scene {
  constructor({ sceneManager, assetManager }) {
    super();

    this.sceneManager = sceneManager;
    this.assetManager = assetManager;
    this.hud = null;
    this.player = null;
    this.playerView = null;
    this.bulletSpawner = null;
    this.bullets = [];
    this.enemies = [];
  }

  /**
   * シーン開始時にゲームオブジェクトを初期化する
   */
  initialize() {
    this.hud = new HUDUIView({
      menuIconSource: this.assetManager.get("menuIcon"),
    });

    /* HUD */
    this.hud.setRemainingTime(180);
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
        this.root.addChild(bullet.view);
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
        this.root.addChild(enemy.view);
      },
    });
    this.enemySpawner.spawn({
      enemyId: "slime",
      position: { x: 0, y: 200 },
    });

    this.root.addChild(this.player.view, this.playerView.hudView, this.hud.view);
    this.layout();
  }

  /**
   * ゲームオブジェクトを毎フレーム更新する
   * @param deltaTime 前フレームからの経過時間
   */
  tick(deltaTime) {
    this.player?.tick(deltaTime);
    this.player?.lateTick(deltaTime);
    this.playerView?.sync();

    for (const bullet of this.bullets) {
      bullet.tick(deltaTime);
      bullet.lateTick(deltaTime);
    }
    this.bullets = this.bullets.filter((bullet) => !bullet.destroyed);

    for (const enemy of this.enemies) {
      enemy.tick(deltaTime);
      enemy.lateTick(deltaTime);
    }
    this.enemies = this.enemies.filter((enemy) => !enemy.destroyed);
  }

  /**
   * シーン内のオブジェクトを破棄する
   */
  exit() {
    this.hud?.destroy();
    this.player?.destroy();
    this.playerView?.destroy();
    for (const bullet of this.bullets) {
      bullet.destroy();
    }
    for (const enemy of this.enemies) {
      enemy.destroy();
    }

    this.hud = null;
    this.player = null;
    this.playerView = null;
    this.bulletSpawner = null;
    this.bullets = [];
    this.enemies = [];
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
  }
}
