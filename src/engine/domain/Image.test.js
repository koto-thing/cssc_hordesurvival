import { beforeAll, describe, expect, it } from "vite-plus/test";

class Graphics {
  clear() {
    return this;
  }

  beginFill() {
    return this;
  }

  beginStroke() {
    return this;
  }

  setStrokeStyle() {
    return this;
  }

  drawCircle() {
    this.drewCircle = true;
    return this;
  }

  drawRect() {
    return this;
  }
}

class Container {
  constructor() {
    this.children = [];
    this.mouseEnabled = true;
  }

  addChild(child) {
    this.children.push(child);
  }
}

class Bitmap {
  constructor(image) {
    this.image = image;
    this.filters = null;
    this.alpha = 1;
  }

  cache() {}

  uncache() {}
}

class Shape {
  constructor() {
    this.graphics = new Graphics();
  }

  cache(x, y, width, height) {
    this.cacheBounds = { x, y, width, height };
  }

  uncache() {
    this.cacheBounds = null;
  }
}

let Image;

beforeAll(async () => {
  globalThis.createjs = {
    Bitmap,
    ColorFilter: class {},
    Container,
    Shape,
  };

  ({ Image } = await import("./Image.js"));
});

describe("Image", () => {
  const source = { naturalWidth: 200, naturalHeight: 100 };

  it("stretches an image in simple mode", () => {
    const image = new Image({ source, width: 100, height: 100 });

    expect(image.bitmap.scaleX).toBe(0.5);
    expect(image.bitmap.scaleY).toBe(1);
  });

  it("preserves aspect ratio in fit mode", () => {
    const image = new Image({ source, width: 100, height: 100, imageType: "fit" });

    expect(image.bitmap.scaleX).toBe(0.5);
    expect(image.bitmap.scaleY).toBe(0.5);
    expect(image.bitmap.y).toBe(25);
  });

  it("crops an image in fill mode", () => {
    const image = new Image({ source, width: 100, height: 100, imageType: "fill" });

    expect(image.bitmap.scaleX).toBe(1);
    expect(image.bitmap.x).toBe(-50);
    expect(image.bitmap.mask).toBe(image.clipMask);
  });

  it("can switch to the source's native size", () => {
    const image = new Image({ source, width: 10, height: 10 });

    image.setNativeSize();

    expect(image.uiWidth).toBe(200);
    expect(image.uiHeight).toBe(100);
  });

  it("supports tint, alpha, and raycast target", () => {
    const image = new Image({
      source,
      color: "#ff8000",
      alpha: 0.4,
      raycastTarget: false,
    });

    expect(image.bitmap.filters).toHaveLength(1);
    expect(image.bitmap.alpha).toBe(0.4);
    expect(image.mouseEnabled).toBe(false);
  });

  it("shows a circular fallback when no source is available", () => {
    const image = new Image({
      width: 48,
      height: 48,
      fallback: {
        shape: "circle",
        fillColor: "#5dd6ff",
      },
    });

    expect(image.bitmap.visible).toBe(false);
    expect(image.fallbackShape.visible).toBe(true);
    expect(image.fallbackShape.graphics.drewCircle).toBe(true);
    expect(image.fallbackShape.cacheBounds).toEqual({
      x: 0,
      y: 0,
      width: 48,
      height: 48,
    });
  });
});
