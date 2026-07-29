import { describe, expect, it, vi } from "vite-plus/test";
import { PauseMenuController } from "./PauseMenuController.js";

describe("PauseMenuController", () => {
  it("pauses while the menu or options are open and resumes when closed", () => {
    const states = [];
    const controller = new PauseMenuController({
      onStateChanged: (state) => states.push(state),
    });

    controller.open();
    expect(controller.isPaused).toBe(true);
    controller.openOptions();
    expect(controller.isPaused).toBe(true);
    controller.returnToMenu();
    controller.resume();

    expect(controller.isPaused).toBe(false);
    expect(states).toEqual(["menu", "options", "menu", "closed"]);
  });

  it("requests a title transition only while open", () => {
    const onReturnToTitle = vi.fn();
    const controller = new PauseMenuController({ onReturnToTitle });

    controller.returnToTitle();
    controller.open();
    controller.returnToTitle();

    expect(onReturnToTitle).toHaveBeenCalledOnce();
  });
});
