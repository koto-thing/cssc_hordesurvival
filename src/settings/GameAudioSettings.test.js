import { describe, expect, it, vi } from "vite-plus/test";
import { GameAudioSettings } from "./GameAudioSettings.js";

describe("GameAudioSettings", () => {
  it("loads and applies the saved volume", () => {
    const sound = { volume: 0 };
    const storage = { getItem: vi.fn(() => "0.35"), setItem: vi.fn() };

    const settings = new GameAudioSettings({ sound, storage });

    expect(settings.volume).toBe(0.35);
    expect(sound.volume).toBe(0.35);
  });

  it("clamps, applies, and saves changed volume", () => {
    const sound = { volume: 0 };
    const storage = { getItem: vi.fn(() => null), setItem: vi.fn() };
    const settings = new GameAudioSettings({ sound, storage });

    settings.setVolume(2);

    expect(settings.volume).toBe(1);
    expect(sound.volume).toBe(1);
    expect(storage.setItem).toHaveBeenCalledWith("cssc-horde-survival:game-volume", "1");
  });

  it("continues when storage is unavailable", () => {
    const sound = { volume: 0 };
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("unavailable");
      }),
      setItem: vi.fn(() => {
        throw new Error("unavailable");
      }),
    };
    const settings = new GameAudioSettings({ sound, storage });

    expect(() => settings.setVolume(0.5)).not.toThrow();
    expect(sound.volume).toBe(0.5);
  });
});
