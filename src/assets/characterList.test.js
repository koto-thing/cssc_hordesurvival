import { describe, expect, it } from "vite-plus/test";

import { characterList } from "./characterList.js";

function gameplayOf(characterId) {
  return characterList.find(({ id }) => id === characterId).gameplay;
}

describe("characterList", () => {
  it("Azureが最速でEmeraldが最遅になる", () => {
    const crimson = gameplayOf("crimson");
    const azure = gameplayOf("azure");
    const emerald = gameplayOf("emerald");

    expect(azure.moveSpeed).toBeGreaterThan(crimson.moveSpeed);
    expect(crimson.moveSpeed).toBeGreaterThan(emerald.moveSpeed);
  });

  it("Crimsonが最長射程でEmeraldが最短射程になる", () => {
    const crimson = gameplayOf("crimson");
    const azure = gameplayOf("azure");
    const emerald = gameplayOf("emerald");

    expect(crimson.shotRange).toBeGreaterThan(azure.shotRange);
    expect(azure.shotRange).toBeGreaterThan(emerald.shotRange);
  });

  it("各キャラクターに固有の強化候補が割り当てられている", () => {
    for (const character of characterList) {
      expect(character.upgrades).toHaveLength(3);
      expect(new Set(character.upgrades.map(({ id }) => id)).size).toBe(3);
      expect(character.upgrades.every(({ effect }) => effect.type)).toBe(true);
    }
  });
});
