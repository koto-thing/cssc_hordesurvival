import { describe, expect, it } from "vite-plus/test";

import { resolveBulletLifetime } from "./bulletFactory.js";

describe("resolveBulletLifetime", () => {
  it("指定射程を弾速に応じた生存時間へ変換する", () => {
    expect(resolveBulletLifetime({ speed: 500, lifetime: 2 }, 1200)).toBe(2.4);
    expect(resolveBulletLifetime({ speed: 250, lifetime: 3 }, 800)).toBe(3.2);
  });

  it("射程が指定されていない場合は弾定義の生存時間を使う", () => {
    expect(resolveBulletLifetime({ speed: 500, lifetime: 2 }, null)).toBe(2);
  });
});
