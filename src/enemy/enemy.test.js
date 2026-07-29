import { beforeEach, describe, expect, it } from "vite-plus/test";
import { GameObject } from "../engine/index.js";
import { ChasePlayerMoveController } from "./chasePlayerMoveController.js";
import { EnemyFactory } from "./enemyFactory.js";

class Bitmap {
  constructor(image) {
    this.image = image;
  }

  removeAllEventListeners() {}
}

class Graphics {
  beginFill(color) {
    this.fillColor = color;
    return this;
  }

  drawCircle(x, y, radius) {
    this.circle = { x, y, radius };
    return this;
  }
}

class Shape {
  constructor() {
    this.graphics = new Graphics();
  }

  removeAllEventListeners() {}
}

beforeEach(() => {
  globalThis.createjs = { Bitmap, Shape };
});

describe("ChasePlayerMoveController", () => {
  it("対象へ向かって指定速度で移動する", () => {
    const target = new GameObject();
    target.transform.x = 30;
    target.transform.y = 40;

    const enemy = new GameObject();
    enemy.addComponent(new ChasePlayerMoveController({ target, speed: 10 }));
    enemy.tick(1);

    expect(enemy.transform.x).toBe(6);
    expect(enemy.transform.y).toBe(8);
  });
});

describe("EnemyFactory", () => {
  it("敵定義から表示、ステータス、移動処理を組み立てる", () => {
    const image = {};
    const target = new GameObject();
    const factory = new EnemyFactory({
      assetManager: { get: () => image },
    });

    const enemy = factory.create({
      definition: {
        imageId: "slime",
        hp: 10,
        attack: 2,
        speed: 80,
        movementType: "chase",
      },
      position: { x: 100, y: 200 },
      target,
    });

    expect(enemy.view).toBeInstanceOf(Bitmap);
    expect(enemy.view.image).toBe(image);
    expect(enemy.transform.x).toBe(100);
    expect(enemy.transform.y).toBe(200);
    expect(enemy.status.hp).toBe(10);
    expect(enemy.status.attack).toBe(2);
    expect(enemy.moveController).toBeInstanceOf(ChasePlayerMoveController);
  });

  it("画像アセットが未登録の場合はピンク色の円を生成する", () => {
    const factory = new EnemyFactory({
      assetManager: {
        get() {
          throw new Error("Asset not found");
        },
      },
    });

    const enemy = factory.create({
      definition: {
        imageId: "missingEnemy",
        hp: 10,
        attack: 1,
        speed: 80,
        movementType: "chase",
      },
      position: { x: 0, y: 0 },
      target: new GameObject(),
    });

    expect(enemy.view).toBeInstanceOf(Shape);
    expect(enemy.view.graphics.fillColor).toBe("#ff4fa3");
    expect(enemy.view.graphics.circle).toEqual({ x: 0, y: 0, radius: 16 });
  });
});
