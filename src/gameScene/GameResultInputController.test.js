import { describe, expect, it, vi } from "vite-plus/test";
import { GameResultInputController } from "./GameResultInputController.js";

describe("GameResultInputController", () => {
  it("クリックしたときだけタイトル遷移を要求する", () => {
    const eventTarget = new EventTarget();
    const onReturnRequested = vi.fn();
    const controller = new GameResultInputController({ eventTarget, onReturnRequested });

    controller.enable();
    eventTarget.dispatchEvent(new Event("keydown"));
    expect(onReturnRequested).not.toHaveBeenCalled();

    eventTarget.dispatchEvent(new Event("mousedown"));
    expect(onReturnRequested).toHaveBeenCalledOnce();
  });

  it("監視の重複を避け、解除後はクリックを無視する", () => {
    const eventTarget = new EventTarget();
    const onReturnRequested = vi.fn();
    const controller = new GameResultInputController({ eventTarget, onReturnRequested });

    controller.enable();
    controller.enable();
    eventTarget.dispatchEvent(new Event("mousedown"));
    expect(onReturnRequested).toHaveBeenCalledOnce();

    controller.disable();
    eventTarget.dispatchEvent(new Event("mousedown"));
    expect(onReturnRequested).toHaveBeenCalledOnce();
  });
});
