import { describe, expect, it } from "vite-plus/test";

import { commonUpgradeList } from "./commonUpgradeList.js";

describe("commonUpgradeList", () => {
  it("全キャラクター向けの基礎ステータス強化を定義する", () => {
    expect(commonUpgradeList.map(({ effect }) => effect.type)).toEqual([
      "moveSpeedMultiplier",
      "shotIntervalMultiplier",
      "shotRangeMultiplier",
      "maxHealth",
    ]);
    expect(new Set(commonUpgradeList.map(({ id }) => id)).size).toBe(commonUpgradeList.length);
  });
});
