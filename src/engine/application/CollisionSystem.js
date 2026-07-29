import { ColliderComponent } from "../domain/ColliderComponent.js";

/** GameObject同士のコライダー交差を判定するアプリケーションサービス */
export class CollisionSystem {
  /**
   * 2つのGameObjectが衝突しているかを判定する
   * @param first 判定対象A
   * @param second 判定対象B
   * @returns {boolean} 有効なコライダー同士が交差している場合はtrue
   */
  static intersects(first, second) {
    if (
      !first?.active ||
      first.destroyed ||
      !second?.active ||
      second.destroyed ||
      first === second
    ) {
      return false;
    }

    const firstColliders = first
      .getComponents(ColliderComponent)
      .filter((collider) => collider.enabled);
    const secondColliders = second
      .getComponents(ColliderComponent)
      .filter((collider) => collider.enabled);

    return firstColliders.some((firstCollider) =>
      secondColliders.some((secondCollider) => firstCollider.intersects(secondCollider)),
    );
  }
}
