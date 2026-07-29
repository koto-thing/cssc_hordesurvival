import { describe, expect, it } from "vite-plus/test";

import { MathUtil } from "./MathUtil.js";

describe("MathUtil", () => {
  it("converts a positive finite value to an integer", () => {
    expect(MathUtil.positiveInteger(3.9, 1)).toBe(3);
    expect(MathUtil.positiveInteger(0, 1)).toBe(1);
    expect(MathUtil.positiveInteger(Number.POSITIVE_INFINITY, 1)).toBe(1);
  });

  it("converts a value to a non-negative integer", () => {
    expect(MathUtil.nonNegativeInteger(3.9)).toBe(3);
    expect(MathUtil.nonNegativeInteger(-1)).toBe(0);
    expect(MathUtil.nonNegativeInteger(Number.NaN)).toBe(0);
  });

  it("converts a value to an integer within the specified range", () => {
    expect(MathUtil.clampInteger(3.9, 0, 5)).toBe(3);
    expect(MathUtil.clampInteger(-1, 0, 5)).toBe(0);
    expect(MathUtil.clampInteger(10, 0, 5)).toBe(5);
    expect(MathUtil.clampInteger(Number.NaN, 2, 5)).toBe(2);
  });
});
