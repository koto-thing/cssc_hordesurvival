import { beforeAll, describe, expect, it } from "vite-plus/test";

class Filter {}

class Container {
  constructor() {
    this.children = [];
    this.parent = null;
    this.filters = null;
  }

  addChild(child) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }

  getStage() {
    return null;
  }

  removeAllEventListeners() {}

  uncache() {}
}

class Shape extends Container {
  constructor() {
    super();
    this.graphics = {
      beginFill: () => this.graphics,
      drawCircle: () => this.graphics,
    };
  }

  cache() {}
}

let GameObject;
let VFXComponent;
let VFXShader;

beforeAll(async () => {
  globalThis.createjs = {
    Container,
    Filter,
    Shape,
    StageGL: class extends Container {},
  };

  ({ GameObject } = await import("./GameObject.js"));
  ({ VFXComponent } = await import("./VFXComponent.js"));
  ({ VFXShader } = await import("../infrastructure/VFXShader.js"));
});

describe("VFXComponent", () => {
  it("generates particles up to the limit and removes them after their lifetime", () => {
    const gameObject = new GameObject("VFX", new Container());
    const vfx = gameObject.addComponent(
      new VFXComponent({
        emissionRate: 10,
        maxParticles: 5,
        startLifetime: 1,
        random: () => 0.5,
      }),
    );

    gameObject.tick(0.5);
    expect(vfx.particleCount).toBe(5);
    expect(vfx.emit(10)).toBe(0);

    vfx.stop();
    gameObject.tick(0.5);
    expect(vfx.particleCount).toBe(0);
  });

  it("clears all particles when destroyed", () => {
    const gameObject = new GameObject("VFX", new Container());
    const vfx = gameObject.addComponent(new VFXComponent({ autoPlay: false }));

    expect(vfx.emit(3)).toBe(3);
    gameObject.destroy();

    expect(vfx.particleCount).toBe(0);
    expect(vfx.view.parent).toBeNull();
  });
});

describe("VFXShader", () => {
  it("updates time and custom uniforms", () => {
    const calls = [];
    const gl = {
      getUniformLocation: (_program, name) => name,
      uniform1f: (location, value) => calls.push([location, value]),
    };
    const shader = new VFXShader({
      uniforms: {
        intensity: ({ time }) => time * 2,
      },
    });

    shader.tick(0.25);
    shader.shaderParamSetup(gl, {}, {});

    expect(calls).toContainEqual(["time", 0.25]);
    expect(calls).toContainEqual(["intensity", 0.5]);
  });
});
