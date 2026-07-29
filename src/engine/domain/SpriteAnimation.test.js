import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { GameObject } from "./GameObject.js";
import { SpriteAnimation } from "./SpriteAnimation.js";

class Bitmap {
  constructor(image) {
    this.image = image;
  }
}

class Rectangle {
  constructor(x, y, width, height) {
    Object.assign(this, { x, y, width, height });
  }
}

beforeEach(() => {
  globalThis.createjs = { Bitmap, Rectangle };
});

describe("SpriteAnimation", () => {
  it("横一列のフレームを指定FPSでループ再生する", () => {
    const animation = new SpriteAnimation({
      clips: {
        run: {
          image: { width: 96, height: 32 },
          frameWidth: 32,
          frameHeight: 32,
          frameRate: 10,
        },
      },
      initialClip: "run",
    });
    const object = new GameObject();
    object.addComponent(animation);

    object.tick(0.2);
    expect(animation.currentFrame).toBe(2);
    expect(animation.sprite.sourceRect).toEqual(new Rectangle(64, 0, 32, 32));

    object.tick(0.1);
    expect(animation.currentFrame).toBe(0);
  });

  it("単発クリップは最終フレームで停止して完了を通知する", () => {
    const onComplete = vi.fn();
    const animation = new SpriteAnimation({
      clips: {
        die: {
          image: { width: 64, height: 32 },
          frameWidth: 32,
          frameHeight: 32,
          frameRate: 10,
          loop: false,
        },
      },
    });
    const object = new GameObject();
    object.addComponent(animation);

    animation.play("die", { onComplete });
    object.tick(0.2);

    expect(animation.currentFrame).toBe(1);
    expect(animation.playing).toBe(false);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("画像幅からフレーム数を自動計算する", () => {
    const animation = new SpriteAnimation({
      clips: {
        run: {
          image: { naturalWidth: 192, naturalHeight: 32 },
          frameWidth: 32,
          frameHeight: 32,
        },
      },
      initialClip: "run",
    });

    expect(animation.clips.get("run").frameCount).toBe(6);
  });
});
