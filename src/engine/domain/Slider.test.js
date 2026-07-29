import { beforeAll, describe, expect, it, vi } from "vite-plus/test";

class Graphics {
  constructor() {
    this.roundRects = [];
    this.circles = [];
  }
  clear() {
    this.roundRects = [];
    this.circles = [];
    return this;
  }
  beginFill() {
    return this;
  }
  drawRect() {
    return this;
  }
  drawRoundRect(...args) {
    this.roundRects.push(args);
    return this;
  }
  drawCircle(...args) {
    this.circles.push(args);
    return this;
  }
}

class Container {
  constructor() {
    this.children = [];
    this.handlers = {};
    this.mouseEnabled = true;
  }
  addChild(...children) {
    this.children.push(...children);
  }
  on(type, listener, scope) {
    this.handlers[type] = listener.bind(scope);
  }
  globalToLocal(x, y) {
    return { x, y };
  }
}

class Shape {
  constructor() {
    this.graphics = new Graphics();
    this.cacheCalls = [];
  }
  cache(...args) {
    this.cacheCalls.push(args);
  }
}

let Slider;

beforeAll(async () => {
  globalThis.createjs = { Container, Shape };
  ({ Slider } = await import("./Slider.js"));
});

describe("Slider", () => {
  it("clamps values and supports whole numbers", () => {
    const slider = new Slider({ minValue: 10, maxValue: 20, value: 14, wholeNumbers: true });
    slider.value = 18.7;
    expect(slider.value).toBe(19);
    slider.value = 100;
    expect(slider.value).toBe(20);
  });

  it("notifies only when its value changes", () => {
    const slider = new Slider({ value: 0.25 });
    const listener = vi.fn();
    slider.onValueChanged(listener);
    slider.value = 0.75;
    slider.value = 0.75;
    slider.setValueWithoutNotify(0.5);
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(0.75);
  });

  it("updates from track clicks and dragging", () => {
    const slider = new Slider({ width: 200, value: 0 });
    slider.handlers.mousedown({ stageX: 56, stageY: 16 });
    expect(slider.value).toBe(0.25);
    slider.handlers.pressmove({ stageX: 144, stageY: 16 });
    expect(slider.value).toBe(0.75);
  });

  it("supports reversed and vertical directions", () => {
    const reversed = new Slider({ width: 200, direction: "rightToLeft" });
    reversed.handlers.mousedown({ stageX: 56, stageY: 16 });
    expect(reversed.value).toBe(0.75);

    const vertical = new Slider({ width: 32, height: 200, direction: "bottomToTop" });
    vertical.handlers.mousedown({ stageX: 16, stageY: 56 });
    expect(vertical.value).toBe(0.75);
  });

  it("ignores pointer input when disabled", () => {
    const slider = new Slider({ value: 0.5 });
    slider.setInteractable(false);
    slider.handlers.mousedown({ stageX: 200, stageY: 16 });
    expect(slider.value).toBe(0.5);
  });

  it("caches redrawn shapes for StageGL rendering", () => {
    const slider = new Slider({ width: 200, height: 32, value: 0.5 });

    expect(slider.background.cacheCalls.at(-1)).toEqual([0, 0, 200, 32]);
    expect(slider.fill.cacheCalls.at(-1)).toEqual([0, 0, 200, 32]);
  });

  it("does not draw zero-sized fill or handle artifacts", () => {
    const slider = new Slider({ value: 0, handleSize: 0 });

    expect(slider.fill.graphics.roundRects).toEqual([]);
    expect(slider.handle.graphics.circles).toEqual([]);
  });

  it("limits the fill radius to its animated size", () => {
    const horizontal = new Slider({
      width: 200,
      height: 32,
      trackThickness: 16,
      handleSize: 0,
      value: 0.01,
    });
    const vertical = new Slider({
      width: 32,
      height: 200,
      trackThickness: 16,
      handleSize: 0,
      direction: "bottomToTop",
      value: 0.01,
    });

    expect(horizontal.fill.graphics.roundRects.at(-1)).toEqual([0, 8, 2, 16, 1]);
    expect(vertical.fill.graphics.roundRects.at(-1)).toEqual([8, 198, 16, 2, 1]);
  });

  it("keeps the handle inside its drawing bounds at both endpoints", () => {
    const slider = new Slider({ width: 200, handleSize: 24, value: 1 });

    expect(slider.handle.graphics.circles.at(-1)).toEqual([188, 16, 12]);
    slider.value = 0;
    expect(slider.handle.graphics.circles.at(-1)).toEqual([12, 16, 12]);
  });
});
