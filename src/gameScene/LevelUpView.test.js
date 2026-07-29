import { describe, expect, it } from "vite-plus/test";

import { formatUpgradeCardText, wrapText } from "./LevelUpView.js";

describe("LevelUpView", () => {
  it("長い説明文をカード幅に収まる長さへ折り返す", () => {
    expect(wrapText("最大体力が1上昇し、体力を1回復", 11)).toBe("最大体力が1上昇し、体\n力を1回復");
  });

  it("強化名・次のランク・折り返した説明をカードへ表示する", () => {
    const text = formatUpgradeCardText({
      name: "体力強化",
      rank: 2,
      description: "最大体力が1上昇し、体力を1回復",
    });

    expect(text).toBe("体力強化\n\nLv.3\n\n最大体力が1上昇し、体\n力を1回復");
  });
});
