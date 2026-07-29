import { describe, expect, it, vi } from "vite-plus/test";
import { GameSceneMusic } from "./GameSceneMusic.js";

describe("GameSceneMusic", () => {
  it("plays the game scene music in an infinite loop", () => {
    const instance = { stop: vi.fn() };
    const sound = {
      play: vi.fn(() => instance),
    };
    const music = new GameSceneMusic({ sound });

    music.play();

    expect(sound.play).toHaveBeenCalledWith("gameSceneMusic", { loop: -1 });
  });

  it("stops the music when leaving the scene", () => {
    const instance = { stop: vi.fn() };
    const sound = {
      play: vi.fn(() => instance),
    };
    const music = new GameSceneMusic({ sound });
    music.play();

    music.stop();

    expect(instance.stop).toHaveBeenCalledOnce();
  });

  it("stops an existing instance before starting again", () => {
    const firstInstance = { stop: vi.fn() };
    const secondInstance = { stop: vi.fn() };
    const sound = {
      play: vi.fn().mockReturnValueOnce(firstInstance).mockReturnValueOnce(secondInstance),
    };
    const music = new GameSceneMusic({ sound });
    music.play();

    music.play();

    expect(firstInstance.stop).toHaveBeenCalledOnce();
    expect(sound.play).toHaveBeenCalledTimes(2);
  });
});
