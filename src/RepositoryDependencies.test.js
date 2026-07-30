import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vite-plus/test";

describe("repository dependencies", () => {
  it("does not depend on packages outside the repository", async () => {
    const packageJsonUrl = new URL("../package.json", import.meta.url);
    const packageJson = JSON.parse(await readFile(packageJsonUrl, "utf8"));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    for (const [name, version] of Object.entries(dependencies)) {
      expect(version, `${name} must be installable without a sibling repository`).not.toMatch(
        /^file:\.\.[/\\]/,
      );
    }
  });
});
