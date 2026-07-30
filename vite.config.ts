import { defineConfig, type Plugin } from "vite-plus";
import { readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const base = "/cssc_horde_survival/";
const loudnessRoute = `${base}loudness-meter/`;
const loudnessDist = fileURLToPath(
  new URL("./node_modules/@loudness-meter/web/dist/", import.meta.url),
);
const loudnessRuntimeAssets = [
  "loudness-meter-processor.js",
  "protocol.js",
  "wasm/loudness_web.js",
  "wasm/loudness_web_bg.wasm",
];

export default defineConfig({
  base,
  plugins: [serveLoudnessProcessor(), copyLoudnessProcessor()],
  test: {
    setupFiles: ["./src/testSetup.js"],
  },
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});

/**
 * Keeps the AudioWorklet module, its imports, and WASM binary together
 */
function serveLoudnessProcessor(): Plugin {
  return {
    name: "loudness-processor-assets",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestPath = request.url?.split("?")[0];
        if (!requestPath?.startsWith(loudnessRoute)) {
          next();
          return;
        }

        try {
          const relativePath = requestPath.slice(loudnessRoute.length);
          const requestedFile = join(loudnessDist, relativePath);
          if (relative(loudnessDist, requestedFile).startsWith("..")) {
            next();
            return;
          }
          const source = await readFile(requestedFile);
          response.setHeader("Content-Type", contentType(relativePath));
          response.end(source);
        } catch {
          next();
        }
      });
    },
  };
}

/**
 * Copies the processor dependency tree into the production build
 */
function copyLoudnessProcessor(): Plugin {
  return {
    name: "loudness-processor-build-assets",
    apply: "build",
    async buildStart() {
      for (const relativePath of loudnessRuntimeAssets) {
        this.emitFile({
          type: "asset",
          fileName: `loudness-meter/${relativePath}`,
          source: await readFile(join(loudnessDist, relativePath)),
        });
      }
    },
  };
}

/**
 * Returns the response type needed by AudioWorklet and WebAssembly
 */
function contentType(path: string): string {
  switch (extname(path)) {
    case ".js":
      return "text/javascript";
    case ".wasm":
      return "application/wasm";
    case ".json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}
