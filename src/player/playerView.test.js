import { describe, expect, it } from "vite-plus/test";
import { calculateHurtHeartColor } from "./playerView.js";

describe("calculateHurtHeartColor", () => {
  it("演出の進行に合わせて紫から黒へ変化する", () => {
    expect(calculateHurtHeartColor(0)).toBe("#904ad6");
    expect(calculateHurtHeartColor(0.5)).toBe("#48256b");
    expect(calculateHurtHeartColor(1)).toBe("#000000");
  });

  it("演出範囲外の経過率を端の色へ制限する", () => {
    expect(calculateHurtHeartColor(-1)).toBe("#904ad6");
    expect(calculateHurtHeartColor(2)).toBe("#000000");
  });
});
