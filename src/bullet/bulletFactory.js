import { Bullet } from "./bullet.js";
import { BulletStatus } from "./BulletStatus.js";
import { StraightBulletMoveController } from "./StraightBulletMoveController.js";
import { WaveBulletMoveController } from "./WaveBulletMoveController.js";

const FALLBACK_BULLET_COLOR = "#ff4fa3";
const FALLBACK_BULLET_RADIUS = 8;

/**
 * 弾の定義から弾オブジェクトを組み立てるファクトリ
 */
export class BulletFactory {
  constructor({ assetManager }) {
    this.assetManager = assetManager;
  }

  /**
   * @param options
   * @param options.definition bulletListに登録された弾の定義
   * @param options.position 弾の生成座標
   * @param options.angle 弾を飛ばす角度
   * @param options.owner 弾を発射した陣営
   * @returns {Bullet}
   */
  create({ definition, position, angle, owner }) {
    const view = this.#createView(definition.imageId);
    const bullet = new Bullet({
      view,
      status: new BulletStatus({
        damage: definition.damage,
        lifetime: definition.lifetime,
        owner,
      }),
      moveController: createMoveController(definition, angle),
    });

    bullet.transform.x = position.x;
    bullet.transform.y = position.y;
    bullet.transform.rotation = angle;

    return bullet;
  }

  /**
   * 画像が利用できない場合はピンク色の円を生成する
   * @param imageId 弾画像のアセットID
   * @returns {createjs.DisplayObject}
   */
  #createView(imageId) {
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
    fallback.graphics.beginFill(FALLBACK_BULLET_COLOR).drawCircle(0, 0, FALLBACK_BULLET_RADIUS);
    // StageGLはベクターShapeを直接描画できないためテクスチャとしてキャッシュする
    fallback.cache(
      -FALLBACK_BULLET_RADIUS,
      -FALLBACK_BULLET_RADIUS,
      FALLBACK_BULLET_RADIUS * 2,
      FALLBACK_BULLET_RADIUS * 2,
    );
    return fallback;
  }
}

/**
 * 弾の定義に対応する移動コンポーネントを生成する
 * @param definition 弾の定義
 * @param angle 弾を飛ばす角度
 * @returns {import("../engine/domain/Component.js").Component}
 */
function createMoveController(definition, angle) {
  switch (definition.movementType) {
    case "wave":
      return new WaveBulletMoveController({
        angle,
        speed: definition.speed,
        amplitude: definition.amplitude,
        frequency: definition.frequency,
      });

    case "straight":
    default:
      return new StraightBulletMoveController({
        angle,
        speed: definition.speed,
      });
  }
}
