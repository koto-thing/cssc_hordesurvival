import { describe, expect, it, vi } from "vite-plus/test";
import { GameResultController } from "./GameResultController.js";

describe("GameResultController", () => {
  it("ゲームオーバーを一度だけ通知する", () => {
    const onResultChanged = vi.fn();
    const controller = new GameResultController({ onResultChanged });

    expect(controller.gameOver()).toBe(true);
    expect(controller.gameOver()).toBe(false);
    expect(controller.clear()).toBe(false);
    expect(onResultChanged).toHaveBeenCalledOnce();
    expect(onResultChanged).toHaveBeenCalledWith("gameOver");
  });

  it("クリアを通知し、入力後にタイトル遷移を要求する", () => {
    const onResultChanged = vi.fn();
    const onReturnRequested = vi.fn();
    const controller = new GameResultController({ onResultChanged, onReturnRequested });

    expect(controller.requestReturn()).toBe(false);
    expect(controller.clear()).toBe(true);
    expect(controller.requestReturn()).toBe(true);
    expect(onResultChanged).toHaveBeenCalledWith("clear");
    expect(onReturnRequested).toHaveBeenCalledOnce();
  });
});
