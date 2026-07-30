import { describe, expect, it } from "vite-plus/test";

import { bulletList } from "./assetList.js";

describe("assetList", () => {
  it("ブラウザ標準のURLとしてすべてのアセットを解決する", () => {
    expect(bulletList).toHaveLength(14);

    for (const asset of bulletList) {
      const url = new URL(asset.src);

      expect(["file:", "http:", "https:"]).toContain(url.protocol);
      expect(url.pathname).toContain("/src/assets/static/");
    }
  });
});
