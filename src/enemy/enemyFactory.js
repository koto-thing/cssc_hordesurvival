import { Enemy } from "./enemy.js";
import { EnemyStatusController } from "./enemyStatusController.js";
import { EnemyView } from "./EnemyView.js";
import { ChasePlayerMoveController } from "./chasePlayerMoveController.js";
import { EnemyShotController } from "./EnemyShotController.js";
import { SpriteAnimation } from "../engine/index.js";

const FALLBACK_ENEMY_COLOR = "#ff4fa3";
const FALLBACK_ENEMY_RADIUS = 16;

/**
 * 敵をどう作るかを決めるクラス
 */
export class EnemyFactory {
  constructor({ assetManager, bulletSpawner = null }) {
    this.assetManager = assetManager;
    this.bulletSpawner = bulletSpawner;
  }

  /**
   * 敵の定義から敵を１体生成する
   * @param param0
   * @param param0.definition
   * @param param0.position
   * @param param0.target
   * @returns {Enemy}
   */
  create({ definition, position, target }) {
    // 敵のステータスを生成する
    const status = new EnemyStatusController({
      hp: definition.hp,
      attack: definition.attack,
      experience: definition.experience,
      score: definition.score,
    });
    const animation = this.#createAnimation(definition.animation);
    const enemyView = new EnemyView({
      sprite: animation?.sprite ?? this.#createSprite(definition.imageId, definition.fallbackColor),
      maxHp: status.maxHp,
    });

    // 敵のゲームオブジェクトを生成する
    const enemy = new Enemy({
      view: enemyView.view,
      enemyView,
      status,
      animation,
      moveController: this.#createMoveController({
        definition,
        target,
      }),
      shotController: this.#createShotController({
        definition,
        target,
      }),
    });

    // 敵の位置を設定する
    enemy.transform.x = position.x;
    enemy.transform.y = position.y;

    return enemy;
  }

  /**
   * 敵定義から連番画像アニメーションを生成する
   * @param definition アニメーション定義
   * @returns {SpriteAnimation|null}
   */
  #createAnimation(definition) {
    if (!definition) {
      return null;
    }

    // 連番画像アニメーションのクリップを生成する
    const clips = Object.fromEntries(
      Object.entries(definition.clips).map(([name, clip]) => [
        name,
        {
          ...clip,
          image: this.assetManager.get(clip.imageId),
        },
      ]),
    );

    // 連番画像アニメーションを生成する
    return new SpriteAnimation({
      clips,
      initialClip: definition.initialClip,
    });
  }

  /**
   * 敵の表示オブジェクトを生成する
   * @param imageId 画像のID
   * @returns {createjs.DisplayObject}
   */
  #createSprite(imageId, fallbackColor = FALLBACK_ENEMY_COLOR) {
    // 画像IDが指定されている場合は、登録済みの画像を取得してBitmapを生成する
    if (imageId) {
      try {
        const image = this.assetManager.get(imageId);
        if (image) {
          return new createjs.Bitmap(image);
        }
      } catch {
        // 未登録の画像はフォールバック表示へ切り替える
      }
    }

    // フォールバック表示を生成する
    const fallback = new createjs.Shape();
    fallback.graphics.beginFill(fallbackColor).drawCircle(0, 0, FALLBACK_ENEMY_RADIUS);
    // StageGLでShapeを描画できるよう表示範囲をキャッシュする
    fallback.cache(
      -FALLBACK_ENEMY_RADIUS,
      -FALLBACK_ENEMY_RADIUS,
      FALLBACK_ENEMY_RADIUS * 2,
      FALLBACK_ENEMY_RADIUS * 2,
    );
    return fallback;
  }

  /**
   * 敵の移動コントローラーを生成する
   * @param param0
   * @param param0.definition 敵の定義
   * @param param0.target 追従する対象
   * @returns {*}
   */
  #createMoveController({ definition, target }) {
    switch (definition.movementType) {
      // 追従型の移動コントローラーを生成する
      case "chase":
        return new ChasePlayerMoveController({
          target,
          speed: definition.speed,
        });

      // それ以外の移動タイプは未実装
      default:
        throw new Error(`Unknown movement type ${definition.movementType}`);
    }
  }

  /**
   * 射撃定義を持つ敵へ射撃コンポーネントを生成する
   */
  #createShotController({ definition, target }) {
    if (!definition.shooting) {
      return null;
    }

    // 射撃コンポーネントを生成する
    return new EnemyShotController({
      bulletSpawner: this.bulletSpawner,
      bulletId: definition.shooting.bulletId,
      target,
      shotInterval: definition.shooting.interval,
      aimType: definition.shooting.aimType,
      bulletSpeed: definition.shooting.bulletSpeed,
    });
  }
}
