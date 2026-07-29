import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { UI_THEME } from "../assets/uiTheme.js";
import { GameBackgroundView } from "./GameBackgroundView.js";

describe("GameBackgroundView", () => {
  let originalShape;
  let graphics;

  beforeEach(() => {
    originalShape = createjs.Shape;
    graphics = {
      clear: vi.fn(),
      beginFill: vi.fn(),
      drawRect: vi.fn(),
    };
    graphics.clear.mockReturnValue(graphics);
    graphics.beginFill.mockReturnValue(graphics);
    graphics.drawRect.mockReturnValue(graphics);

    createjs.Shape = class {
      constructor() {
        this.graphics = graphics;
        this.cache = vi.fn();
      }
    };
  });

  afterEach(() => {
    createjs.Shape = originalShape;
  });

  it("タイトル画面と同じ色で表示領域全体を描画する", () => {
    const background = new GameBackgroundView();

    background.layout(1280, 720);

    expect(graphics.beginFill).toHaveBeenCalledWith(UI_THEME.backgroundDeep);
    expect(graphics.drawRect).toHaveBeenCalledWith(0, 0, 1280, 720);
    expect(background.view.cache).toHaveBeenCalledWith(0, 0, 1280, 720);
    expect(background.view.mouseEnabled).toBe(false);
  });
});
