import { beforeEach, describe, expect, it } from "vite-plus/test";
import { Bullet } from "./bullet.js";
import { BulletFactory } from "./bulletFactory.js";
import { BulletStatus } from "./BulletStatus.js";
import { StraightBulletMoveController } from "./StraightBulletMoveController.js";

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

  cache(x, y, width, height) {
    this.cacheBounds = { x, y, width, height };
  }
}

class Bitmap {
  constructor(image) {
    this.image = image;
  }
}

beforeEach(() => {
  globalThis.createjs = { Bitmap, Shape };
});

describe("Bullet", () => {
  it("設定された速度と角度に従って移動する", () => {
    const bullet = new Bullet({
      moveController: new StraightBulletMoveController({
        angle: 0,
        speed: 100,
      }),
    });

    bullet.tick(0.5);

    expect(bullet.transform.x).toBe(50);
    expect(bullet.transform.y).toBe(0);
  });

  it("生存時間を過ぎると破棄される", () => {
    const bullet = new Bullet({
      status: new BulletStatus({ lifetime: 1 }),
    });

    bullet.tick(1);

    expect(bullet.destroyed).toBe(true);
  });
});

describe("BulletFactory", () => {
  const definition = {
    speed: 100,
    damage: 1,
    lifetime: 2,
    movementType: "straight",
  };
  const options = {
    position: { x: 10, y: 20 },
    angle: 0,
    owner: "player",
  };

  it("画像を取得できる場合はBitmapを生成する", () => {
    const image = {};
    const factory = new BulletFactory({
      assetManager: { get: () => image },
    });

    const bullet = factory.create({
      ...options,
      definition: { ...definition, imageId: "normalBullet" },
    });

    expect(bullet.view).toBeInstanceOf(Bitmap);
    expect(bullet.view.image).toBe(image);
  });

  it("imageIdがない場合はピンク色の円を生成する", () => {
    const factory = new BulletFactory({
      assetManager: { get: () => null },
    });

    const bullet = factory.create({ ...options, definition });

    expect(bullet.view).toBeInstanceOf(Shape);
    expect(bullet.view.graphics.fillColor).toBe("#ff4fa3");
    expect(bullet.view.graphics.circle).toEqual({ x: 0, y: 0, radius: 8 });
    expect(bullet.view.cacheBounds).toEqual({ x: -8, y: -8, width: 16, height: 16 });
  });

  it("画像取得に失敗した場合もピンク色の円を生成する", () => {
    const factory = new BulletFactory({
      assetManager: {
        get() {
          throw new Error("Asset not found");
        },
      },
    });

    const bullet = factory.create({
      ...options,
      definition: { ...definition, imageId: "missingBullet" },
    });

    expect(bullet.view).toBeInstanceOf(Shape);
    expect(bullet.view.graphics.fillColor).toBe("#ff4fa3");
  });
});
