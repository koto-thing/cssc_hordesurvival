import { describe, expect, it } from "vite-plus/test";

import { easeOutCubic } from "./LevelUpCelebrationView.js";

describe("LevelUpCelebrationView", () => {
  it("補間値を0から1の範囲へ制限する", () => {
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875);
    expect(easeOutCubic(2)).toBe(1);
  });
});
