import { describe, expect, it } from "vite-plus/test";
import { CircleColliderComponent } from "../domain/ColliderComponent.js";
import { GameObject } from "../domain/GameObject.js";
import { CollisionSystem } from "./CollisionSystem.js";

function createCollidable(x, radius = 5) {
  const gameObject = new GameObject();
  gameObject.transform.x = x;
  gameObject.addComponent(new CircleColliderComponent({ radius }));
  return gameObject;
}

describe("CollisionSystem", () => {
  it("有効なGameObjectのコライダー交差を検出する", () => {
    const first = createCollidable(0);
    const touching = createCollidable(10);
    const separated = createCollidable(11);

    expect(CollisionSystem.intersects(first, touching)).toBe(true);
    expect(CollisionSystem.intersects(first, separated)).toBe(false);
  });

  it("無効または破棄済みのGameObjectを除外する", () => {
    const first = createCollidable(0);
    const inactive = createCollidable(0);
    const destroyed = createCollidable(0);
    inactive.setActive(false);
    destroyed.destroy();

    expect(CollisionSystem.intersects(first, inactive)).toBe(false);
    expect(CollisionSystem.intersects(first, destroyed)).toBe(false);
  });
});
