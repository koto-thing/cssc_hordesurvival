import { describe, expect, it } from "vite-plus/test";
import { calculateCreditButtonPosition } from "./titleScene.js";

describe("calculateCreditButtonPosition", () => {
  it("anchors the credit button to the bottom-left", () => {
    expect(calculateCreditButtonPosition(768, 52)).toEqual({
      x: 24,
      y: 692,
    });
  });

  it("keeps the button inside a short viewport", () => {
    expect(calculateCreditButtonPosition(40, 52)).toEqual({
      x: 24,
      y: 0,
    });
  });
});
