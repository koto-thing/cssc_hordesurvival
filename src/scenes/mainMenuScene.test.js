import { describe, expect, it } from "vite-plus/test";
import { calculateCornerControlLayout, calculateMainMenuLayout } from "./mainMenuScene.js";

describe("calculateMainMenuLayout", () => {
  it("centers the selection content at its natural size", () => {
    expect(calculateMainMenuLayout(1280, 768)).toEqual({
      scale: 1,
      x: 40,
      y: 84,
    });
  });

  it("scales the selection content into a small viewport", () => {
    const layout = calculateMainMenuLayout(600, 400);

    expect(layout.scale).toBeLessThan(1);
    expect(layout.x).toBeGreaterThanOrEqual(24);
    expect(layout.y).toBeGreaterThanOrEqual(24);
  });
});

describe("calculateCornerControlLayout", () => {
  it("anchors the arrow to the top-left and the start button to the bottom-right", () => {
    expect(calculateCornerControlLayout(1280, 768, 240, 64)).toEqual({
      back: {
        x: 20,
        y: 20,
      },
      start: {
        x: 1016,
        y: 680,
      },
    });
  });

  it("keeps the start button position inside a smaller viewport", () => {
    expect(calculateCornerControlLayout(200, 50, 240, 64).start).toEqual({
      x: 0,
      y: 0,
    });
  });
});
