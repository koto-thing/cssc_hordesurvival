import { describe, expect, it } from "vite-plus/test";
import { calculatePauseMenuLayout } from "./PauseMenuView.js";

describe("calculatePauseMenuLayout", () => {
  it("keeps the natural panel size on a large viewport", () => {
    expect(calculatePauseMenuLayout(800, 600)).toEqual({
      scale: 1,
      x: 190,
      y: 105,
    });
  });

  it("scales and centers the panel inside a small viewport", () => {
    const layout = calculatePauseMenuLayout(350, 350);
    const panelWidth = 420 * layout.scale;
    const panelHeight = 390 * layout.scale;

    expect(layout.scale).toBeLessThan(1);
    expect(layout.x).toBeGreaterThanOrEqual(20);
    expect(layout.y).toBeGreaterThanOrEqual(20);
    expect(layout.x + panelWidth).toBeLessThanOrEqual(330);
    expect(layout.y + panelHeight).toBeLessThanOrEqual(330);
  });
});
