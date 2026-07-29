import { Enemy } from "./enemy.js";
import { EnemyStatusController } from "./enemyStatusController.js";
import { EnemyView } from "./EnemyView.js";
import { ChasePlayerMoveController } from "./chasePlayerMoveController.js";

const FALLBACK_ENEMY_COLOR = "#ff4fa3";
const FALLBACK_ENEMY_RADIUS = 16;

/**
 * 敵をどう作るかを決めるクラス
 */
export class EnemyFactory {
  constructor({ assetManager }) {
    this.assetManager = assetManager;
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
    const status = new EnemyStatusController({
      hp: definition.hp,
      attack: definition.attack,
      experience: definition.experience,
      score: definition.score,
    });
    const enemyView = new EnemyView({
      sprite: this.#createSprite(definition.imageId),
      maxHp: status.maxHp,
    });

    const enemy = new Enemy({
      view: enemyView.view,
      enemyView,
      status,
      moveController: this.#createMoveController({
        definition,
        target,
      }),
    });

    enemy.transform.x = position.x;
    enemy.transform.y = position.y;

    return enemy;
  }

  /**
   * 敵の表示オブジェクトを生成する
   * @param imageId 画像のID
   * @returns {createjs.DisplayObject}
   */
  #createSprite(imageId) {
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

    const fallback = new createjs.Shape();
    fallback.graphics.beginFill(FALLBACK_ENEMY_COLOR).drawCircle(0, 0, FALLBACK_ENEMY_RADIUS);
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
      case "chase":
        return new ChasePlayerMoveController({
          target,
          speed: definition.speed,
        });

      default:
        throw new Error(`Unknown movement type ${definition.movementType}`);
    }
  }
}
