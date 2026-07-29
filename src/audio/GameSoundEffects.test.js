import { describe, expect, it, vi } from "vite-plus/test";
import { GameSoundEffects } from "./GameSoundEffects.js";

describe("GameSoundEffects", () => {
  it.each([
    ["playLevelUp", "levelUpSound"],
    ["playPlayerHit", "playerHitSound"],
    ["playEnemyDefeated", "enemyDefeatedSound"],
    ["playButtonClick", "buttonClickSound"],
    ["playGameOver", "gameOverSound"],
    ["playGameClear", "gameClearSound"],
  ])("maps %s to the preloaded sound ID", (method, soundId) => {
    const sound = { play: vi.fn() };
    const effects = new GameSoundEffects({ sound });

    effects[method]();

    expect(sound.play).toHaveBeenCalledWith(soundId, undefined);
  });

  it("plays enemy hit feedback at 30% volume", () => {
    const sound = { play: vi.fn() };
    const effects = new GameSoundEffects({ sound });

    effects.playEnemyHit();

    expect(sound.play).toHaveBeenCalledWith("enemyHitSound", { volume: 0.3 });
  });
});
