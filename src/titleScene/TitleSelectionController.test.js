import { describe, expect, it, vi } from "vite-plus/test";
import { TitleSelectionController } from "./TitleSelectionController.js";

describe("TitleSelectionController", () => {
  it("allows starting only after a character and stage are selected", () => {
    const controller = new TitleSelectionController();

    expect(controller.canStart).toBe(false);
    controller.selectCharacter("crimson");
    expect(controller.canStart).toBe(false);
    controller.selectStage("easy");
    expect(controller.canStart).toBe(true);
    expect(controller.validateStart()).toBe(true);
  });

  it("reports both missing selections", () => {
    const onValidationFailed = vi.fn();
    const controller = new TitleSelectionController({ onValidationFailed });

    expect(controller.validateStart()).toBe(false);
    expect(onValidationFailed).toHaveBeenCalledWith("キャラクターとステージを選択してください");
  });

  it("reports the remaining missing selection", () => {
    const onValidationFailed = vi.fn();
    const controller = new TitleSelectionController({ onValidationFailed });

    controller.selectCharacter("azure");
    controller.validateStart();
    expect(onValidationFailed).toHaveBeenLastCalledWith("ステージを選択してください");

    controller.selectStage("hard");
    controller.characterId = null;
    controller.validateStart();
    expect(onValidationFailed).toHaveBeenLastCalledWith("キャラクターを選択してください");
  });
});
