import { describe, expect, it } from "vite-plus/test";
import { UI_BUTTON_COLORS, UI_THEME } from "./uiTheme.js";

describe("UI theme", () => {
  it("uses antique white as the main background color", () => {
    expect(UI_THEME.background).toBe("#faebd7");
  });

  it("provides complete interaction colors for every button role", () => {
    for (const colors of Object.values(UI_BUTTON_COLORS)) {
      expect(colors).toEqual({
        normal: expect.stringMatching(/^#[\da-f]{6}$/i),
        hover: expect.stringMatching(/^#[\da-f]{6}$/i),
        pressed: expect.stringMatching(/^#[\da-f]{6}$/i),
      });
    }
  });
});
