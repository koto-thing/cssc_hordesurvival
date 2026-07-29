import { beforeEach, describe, expect, it } from "vite-plus/test";
import { GameObject } from "../engine/index.js";
import { ChasePlayerMoveController } from "./chasePlayerMoveController.js";
import { EnemyFactory } from "./enemyFactory.js";
import { EnemyShotController } from "./EnemyShotController.js";

class Bitmap {
  constructor(image) {
    this.image = image;
  }

  removeAllEventListeners() {}
}

class Container {
  constructor() {
    this.children = [];
  }

  addChild(...children) {
    this.children.push(...children);
  }

  removeAllEventListeners() {}
}

class Rectangle {
  constructor(x, y, width, height) {
    Object.assign(this, { x, y, width, height });
  }
}

class Graphics {
  clear() {
    return this;
  }

  beginFill(color) {
    this.fillColor = color;
    return this;
  }

  drawCircle(x, y, radius) {
    this.circle = { x, y, radius };
    return this;
  }

  drawRect() {
    return this;
  }

  drawRoundRect() {
    return this;
  }
}

class Shape {
  constructor() {
    this.graphics = new Graphics();
  }

  cache(x, y, width, height) {
    this.cacheBounds = { x, y, width, height };
  }

  removeAllEventListeners() {}
}

beforeEach(() => {
  globalThis.createjs = { Bitmap, Container, Rectangle, Shape };
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
        experience: 25,
        score: 200,
        speed: 80,
        movementType: "chase",
      },
      position: { x: 100, y: 200 },
      target,
    });

    expect(enemy.view).toBeInstanceOf(Container);
    expect(enemy.presentationController.enemyView.sprite).toBeInstanceOf(Bitmap);
    expect(enemy.presentationController.enemyView.sprite.image).toBe(image);
    expect(enemy.transform.x).toBe(100);
    expect(enemy.transform.y).toBe(200);
    expect(enemy.status.hp).toBe(10);
    expect(enemy.status.attack).toBe(2);
    expect(enemy.status.experience).toBe(25);
    expect(enemy.status.score).toBe(200);
    expect(enemy.moveController).toBeInstanceOf(ChasePlayerMoveController);
  });

  it("ダメージをHPバーへ反映し、被弾時に敵を点滅させる", () => {
    const factory = new EnemyFactory({
      assetManager: { get: () => ({}) },
    });
    const enemy = factory.create({
      definition: {
        imageId: "slime",
        hp: 10,
        attack: 1,
        speed: 80,
        movementType: "chase",
      },
      position: { x: 0, y: 0 },
      target: new GameObject(),
    });

    enemy.status.damage(4);
    enemy.playHitFeedback();
    enemy.tick(0.01);

    expect(enemy.presentationController.enemyView.healthBar.value).toBe(6);
    expect(enemy.presentationController.enemyView.sprite.alpha).toBe(0.25);
  });

  it("死亡時は戦闘機能を停止し、死亡アニメーション完了後に破棄する", () => {
    const images = {
      slimeRun: { width: 192, height: 32 },
      slimeDie: { width: 160, height: 32 },
    };
    const factory = new EnemyFactory({
      assetManager: { get: (id) => images[id] },
    });
    const enemy = factory.create({
      definition: {
        hp: 10,
        attack: 1,
        speed: 80,
        movementType: "chase",
        animation: {
          initialClip: "run",
          clips: {
            run: {
              imageId: "slimeRun",
              frameWidth: 32,
              frameHeight: 32,
              frameRate: 10,
              loop: true,
            },
            die: {
              imageId: "slimeDie",
              frameWidth: 32,
              frameHeight: 32,
              frameRate: 10,
              loop: false,
            },
          },
        },
      },
      position: { x: 0, y: 0 },
      target: new GameObject(),
    });

    enemy.defeat();

    expect(enemy.isDying).toBe(true);
    expect(enemy.moveController.enabled).toBe(false);
    expect(enemy.collider.enabled).toBe(false);
    expect(enemy.presentationController.enemyView.healthBar.visible).toBe(false);
    expect(enemy.destroyed).toBe(false);
    expect(enemy.animation.currentClipName).toBe("die");

    enemy.tick(0.5);
    expect(enemy.destroyed).toBe(true);
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

    const sprite = enemy.presentationController.enemyView.sprite;
    expect(sprite).toBeInstanceOf(Shape);
    expect(sprite.graphics.fillColor).toBe("#ff4fa3");
    expect(sprite.graphics.circle).toEqual({ x: 0, y: 0, radius: 16 });
    expect(sprite.cacheBounds).toEqual({
      x: -16,
      y: -16,
      width: 32,
      height: 32,
    });
  });

  it("射撃定義から偏差射撃コンポーネントを組み立てる", () => {
    const bulletSpawner = { spawn() {} };
    const factory = new EnemyFactory({
      assetManager: { get: () => ({}) },
      bulletSpawner,
    });
    const target = new GameObject();

    const enemy = factory.create({
      definition: {
        imageId: "predictiveShooterSlime",
        hp: 30,
        attack: 2,
        speed: 65,
        movementType: "chase",
        shooting: {
          bulletId: "enemyPredictive",
          bulletSpeed: 260,
          interval: 1.5,
          aimType: "predictive",
        },
      },
      position: { x: 0, y: 0 },
      target,
    });

    expect(enemy.shotController).toBeInstanceOf(EnemyShotController);
    expect(enemy.shotController.bulletSpawner).toBe(bulletSpawner);
    expect(enemy.shotController.target).toBe(target);
    expect(enemy.shotController.aimType).toBe("predictive");
  });
});
