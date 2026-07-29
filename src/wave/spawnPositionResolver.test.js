import { describe, expect, it } from "vite-plus/test";
import { SpawnPositionResolver } from "./spawnPositionResolver.js";

describe("SpawnPositionResolver", () => {
  const viewport = { width: 800, height: 600 };

  it.each([
    [0, { x: 400, y: -32 }],
    [0.25, { x: 832, y: 300 }],
    [0.5, { x: 400, y: 632 }],
    [0.75, { x: -32, y: 300 }],
  ])("画面の上下左右へ敵を配置する", (sideRandom, expected) => {
    const randomValues = [sideRandom, 0.5];
    const resolver = new SpawnPositionResolver({
      random: () => randomValues.shift(),
    });

    expect(resolver.resolve("screenEdge", viewport)).toEqual(expected);
  });

  it("不明な出現形式を拒否する", () => {
    const resolver = new SpawnPositionResolver();

    expect(() => resolver.resolve("unknown", viewport)).toThrow("Unknown position type: unknown");
  });
});
