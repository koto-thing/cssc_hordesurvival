import { describe, expect, it } from "vite-plus/test";
import { GameObject } from "../engine/index.js";
import { EnemyShotController, resolveInterceptPosition } from "./EnemyShotController.js";

describe("EnemyShotController", () => {
  it("発射時点のPlayer位置へ通常弾を撃つ", () => {
    const spawned = [];
    const target = new GameObject();
    target.transform.position = { x: 30, y: 40 };
    const enemy = new GameObject();
    enemy.addComponent(
      new EnemyShotController({
        bulletSpawner: {
          spawn(options) {
            spawned.push(options);
          },
        },
        bulletId: "enemyNormal",
        target,
        shotInterval: 2,
        aimType: "direct",
        bulletSpeed: 220,
      }),
    );

    enemy.tick(2);

    expect(spawned).toHaveLength(1);
    expect(spawned[0]).toMatchObject({
      bulletId: "enemyNormal",
      position: { x: 0, y: 0 },
      owner: "enemy",
    });
    expect(spawned[0].angle).toBeCloseTo(Math.atan2(40, 30));
  });

  it("移動中のPlayerとの迎撃点へ偏差射撃する", () => {
    const spawned = [];
    const target = new GameObject();
    target.transform.position = { x: 100, y: 0 };
    target.moveController = { velocityX: 0, velocityY: 10 };
    const enemy = new GameObject();
    enemy.addComponent(
      new EnemyShotController({
        bulletSpawner: {
          spawn(options) {
            spawned.push(options);
          },
        },
        bulletId: "enemyPredictive",
        target,
        shotInterval: 1,
        aimType: "predictive",
        bulletSpeed: 50,
      }),
    );

    enemy.tick(1);

    expect(spawned[0].angle).toBeGreaterThan(0);
    expect(spawned[0].angle).toBeCloseTo(Math.asin(10 / 50));
  });
});

describe("resolveInterceptPosition", () => {
  it("弾が追いつけない場合はPlayerの現在位置へフォールバックする", () => {
    const position = resolveInterceptPosition({
      shooterPosition: { x: 0, y: 0 },
      targetPosition: { x: 100, y: 0 },
      targetVelocity: { x: 100, y: 0 },
      projectileSpeed: 50,
    });

    expect(position).toEqual({ x: 100, y: 0 });
  });
});
