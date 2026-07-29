import { describe, expect, it } from "vite-plus/test";
import { Camera } from "./Camera.js";
import { GameObject } from "./GameObject.js";

function createView(properties = {}) {
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
    ...properties,
  };
}

function createCamera(options = {}) {
  const world = createView();
  const gameObject = new GameObject("Main Camera", createView());
  const camera = gameObject.addComponent(
    new Camera({ target: world, viewportWidth: 800, viewportHeight: 600, ...options }),
  );
  return { camera, gameObject, world };
}

describe("Camera", () => {
  it("applies the inverse camera transform to its world", () => {
    const { camera, gameObject, world } = createCamera({ zoom: 2 });
    gameObject.transform.position = { x: 100, y: 50 };
    gameObject.transform.rotation = 30;

    camera.apply();

    expect(world.regX).toBe(100);
    expect(world.regY).toBe(50);
    expect(world.x).toBe(400);
    expect(world.y).toBe(300);
    expect(world.rotation).toBe(-30);
    expect(world.scaleX).toBe(2);
    expect(world.scaleY).toBe(2);
  });

  it("round-trips between world and screen coordinates with rotation and zoom", () => {
    const { camera, gameObject } = createCamera({ zoom: 1.75 });
    gameObject.transform.position = { x: 80, y: -20 };
    gameObject.transform.rotation = 40;
    const point = { x: 123, y: 57 };

    const result = camera.screenToWorld(camera.worldToScreen(point));

    expect(result.x).toBeCloseTo(point.x);
    expect(result.y).toBeCloseTo(point.y);
  });

  it("supports normalized split-screen viewports and resizing", () => {
    const { camera, world } = createCamera({ viewport: { x: 0.5, y: 0, width: 0.5, height: 1 } });

    expect(camera.pixelRect).toEqual({ x: 400, y: 0, width: 400, height: 600 });
    expect(world.x).toBe(600);
    camera.setViewportSize(1000, 400);
    expect(camera.pixelRect).toEqual({ x: 500, y: 0, width: 500, height: 400 });
    expect(world.x).toBe(750);
    expect(world.y).toBe(200);
  });

  it("follows a target with frame-rate independent damping", () => {
    const { camera, gameObject } = createCamera();
    camera.follow({ x: 100, y: 50 }, { offsetX: 20, damping: 4 });

    gameObject.tick(0.25);
    gameObject.lateTick(0.25);

    const expectedAmount = 1 - Math.exp(-1);
    expect(gameObject.transform.x).toBeCloseTo(120 * expectedAmount);
    expect(gameObject.transform.y).toBeCloseTo(50 * expectedAmount);
  });

  it("clamps the rendered camera position to world bounds", () => {
    const { camera, gameObject, world } = createCamera({
      viewportWidth: 200,
      viewportHeight: 100,
      bounds: { x: 0, y: 0, width: 1000, height: 500 },
    });
    gameObject.transform.position = { x: -100, y: 1000 };

    camera.apply();

    expect(world.regX).toBe(100);
    expect(world.regY).toBe(450);
  });

  it("restores the target transform when removed", () => {
    const world = createView({ x: 12, y: 34, rotation: 5, scaleX: 3, scaleY: 4 });
    const gameObject = new GameObject("Main Camera", createView());
    const camera = gameObject.addComponent(
      new Camera({ target: world, viewportWidth: 800, viewportHeight: 600 }),
    );

    gameObject.tick(0);
    gameObject.removeComponent(camera);

    expect(world).toMatchObject({ x: 12, y: 34, rotation: 5, scaleX: 3, scaleY: 4 });
  });
});
