import { describe, expect, it } from "vite-plus/test";
import { BulletSpawner } from "./bulletSpawner.js";

describe("BulletSpawner", () => {
  it("弾の定義を使って生成し、生成先へ通知する", () => {
    const definition = { speed: 500 };
    const bullet = {};
    const created = [];
    const spawned = [];
    const spawner = new BulletSpawner({
      bulletDefinitions: { normal: definition },
      bulletFactory: {
        create(options) {
          created.push(options);
          return bullet;
        },
      },
      onSpawn(spawnedBullet) {
        spawned.push(spawnedBullet);
      },
    });

    const result = spawner.spawn({
      bulletId: "normal",
      position: { x: 10, y: 20 },
      angle: 1,
      owner: "player",
      range: null,
    });

    expect(result).toBe(bullet);
    expect(created).toEqual([
      {
        definition,
        position: { x: 10, y: 20 },
        angle: 1,
        owner: "player",
        range: null,
      },
    ]);
    expect(spawned).toEqual([bullet]);
  });

  it("未定義の弾IDを拒否する", () => {
    const spawner = new BulletSpawner({
      bulletDefinitions: {},
      bulletFactory: { create() {} },
      onSpawn() {},
    });

    expect(() =>
      spawner.spawn({
        bulletId: "missing",
        position: { x: 0, y: 0 },
        angle: 0,
        owner: "player",
      }),
    ).toThrow("Unknown bullet ID: missing");
  });

  it("キャラクター固有の射程をファクトリへ渡す", () => {
    const created = [];
    const spawner = new BulletSpawner({
      bulletDefinitions: { normal: { speed: 500 } },
      bulletFactory: {
        create(options) {
          created.push(options);
          return {};
        },
      },
      onSpawn() {},
    });

    spawner.spawn({
      bulletId: "normal",
      position: { x: 0, y: 0 },
      angle: 0,
      owner: "player",
      range: 800,
    });

    expect(created[0].range).toBe(800);
  });
});
