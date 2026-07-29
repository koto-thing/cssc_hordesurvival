import { describe, expect, it } from "vite-plus/test";
import { Camera } from "./Camera.js";
import { CameraExtension } from "./CameraExtension.js";
import { GameObject } from "./GameObject.js";

function createView() {
  return {
    x: 0,
    y: 0,
    regX: 0,
    regY: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    visible: true,
    removeAllEventListeners() {},
  };
}

function createRig(extensionOptions = {}) {
  const world = createView();
  const gameObject = new GameObject("Camera Rig", createView());
  const camera = gameObject.addComponent(
    new Camera({ target: world, viewportWidth: 800, viewportHeight: 600 }),
  );
  const extension = gameObject.addComponent(new CameraExtension(extensionOptions));
  return { camera, extension, gameObject, world };
}

function update(gameObject, deltaTime) {
  gameObject.tick(deltaTime);
  gameObject.lateTick(deltaTime);
}

describe("CameraExtension", () => {
  it("finds and controls the Camera on the same GameObject", () => {
    const target = { x: 100, y: 50 };
    const { extension, gameObject, world } = createRig({
      target,
      offset: { x: 20, y: -10 },
    });

    update(gameObject, 1 / 60);

    expect(extension.camera).toBe(gameObject.getComponent(Camera));
    expect(gameObject.transform.position).toEqual({ x: 120, y: 40 });
    expect(world.regX).toBe(120);
    expect(world.regY).toBe(40);
  });

  it("uses independent damping values for each axis", () => {
    const target = { x: 0, y: 0 };
    const { extension, gameObject } = createRig({
      target,
      damping: { x: 2, y: 4 },
      snapOnEnable: false,
    });
    extension.resetTracking();
    target.x = 100;
    target.y = 100;

    update(gameObject, 0.5);

    expect(gameObject.transform.x).toBeCloseTo(100 * (1 - Math.exp(-1)));
    expect(gameObject.transform.y).toBeCloseTo(100 * (1 - Math.exp(-2)));
  });

  it("keeps the target inside a dead zone before moving", () => {
    const target = { x: 40, y: 20 };
    const { gameObject } = createRig({
      target,
      deadZone: { width: 100, height: 60 },
      damping: 0,
      snapOnEnable: false,
    });

    update(gameObject, 1 / 60);
    expect(gameObject.transform.position).toEqual({ x: 0, y: 0 });

    target.x = 80;
    target.y = -50;
    update(gameObject, 1 / 60);
    expect(gameObject.transform.position).toEqual({ x: 30, y: -20 });
  });

  it("looks ahead in the target movement direction with a distance limit", () => {
    const target = { x: 0, y: 0 };
    const { gameObject } = createRig({
      target,
      damping: 0,
      lookAheadTime: 1,
      lookAheadSmoothing: 0,
      maxLookAheadDistance: 30,
      snapOnEnable: false,
    });

    target.x = 10;
    update(gameObject, 0.1);

    expect(gameObject.transform.x).toBe(40);
    expect(gameObject.transform.y).toBe(0);
  });

  it("rotates toward its target using the shortest angle", () => {
    const target = { x: 0, y: -100 };
    const { gameObject } = createRig({
      target,
      damping: 0,
      deadZone: { width: 1000, height: 1000 },
      lookAt: true,
      rotationDamping: 0,
      snapOnEnable: false,
    });

    update(gameObject, 1 / 60);

    expect(gameObject.transform.rotation).toBeCloseTo(-90);
  });

  it("handles target warps without creating look-ahead velocity", () => {
    const target = { x: 10, y: 20 };
    const { extension, gameObject } = createRig({
      target,
      lookAheadTime: 1,
      lookAheadSmoothing: 0,
    });
    update(gameObject, 1 / 60);

    target.x += 1000;
    target.y -= 500;
    extension.onTargetWarped(1000, -500);
    update(gameObject, 1 / 60);

    expect(gameObject.transform.position).toEqual({ x: 1010, y: -480 });
  });
});
