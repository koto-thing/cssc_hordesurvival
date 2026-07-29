import { describe, expect, it, vi } from "vite-plus/test";
import { Component } from "./Component.js";
import { GameObject } from "./GameObject.js";
import { Transform } from "./Transform.js";

class TestComponent extends Component {
  constructor() {
    super();
    this.initialize = vi.fn();
    this.tick = vi.fn();
    this.lateTick = vi.fn();
    this.onDestroy = vi.fn();
  }
}

function createView() {
  return {
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    visible: true,
    removeAllEventListeners: vi.fn(),
  };
}

describe("GameObject edge cases", () => {
  it("rejects a component that is already attached", () => {
    const first = new GameObject();
    const second = new GameObject();
    const component = first.addComponent(new TestComponent());

    expect(() => second.addComponent(component)).toThrow("already attached");
  });

  it("rejects components after destruction", () => {
    const gameObject = new GameObject("Destroyed");
    gameObject.destroy();

    expect(() => gameObject.addComponent(new TestComponent())).toThrow(
      'Cannot add component to destroyed GameObject: "Destroyed"',
    );
  });

  it("does not remove its required Transform", () => {
    const gameObject = new GameObject();

    expect(() => gameObject.removeComponent(Transform)).toThrow("Transform cannot be removed");
    expect(gameObject.transform.gameObject).toBe(gameObject);
    expect(gameObject.getComponent(Transform)).toBe(gameObject.transform);
  });

  it("defers components added during a tick until the next tick", () => {
    const gameObject = new GameObject();
    const added = new TestComponent();
    const adding = new TestComponent();
    adding.tick.mockImplementationOnce(() => gameObject.addComponent(added));
    gameObject.addComponent(adding);

    gameObject.tick(0.1);

    expect(added.tick).not.toHaveBeenCalled();
    gameObject.tick(0.1);
    expect(added.tick).toHaveBeenCalledOnce();
  });

  it("skips all updates while inactive and resumes afterward", () => {
    const gameObject = new GameObject();
    const component = gameObject.addComponent(new TestComponent());
    gameObject.setActive(false);

    gameObject.tick(0.1);
    gameObject.lateTick(0.1);

    expect(component.tick).not.toHaveBeenCalled();
    expect(component.lateTick).not.toHaveBeenCalled();
    gameObject.setActive(true);
    gameObject.tick(0.1);
    gameObject.lateTick(0.1);
    expect(component.tick).toHaveBeenCalledOnce();
    expect(component.lateTick).toHaveBeenCalledOnce();
  });

  it("destroys components once even when destroy is called repeatedly", () => {
    const view = createView();
    const gameObject = new GameObject("Disposable", view);
    const component = gameObject.addComponent(new TestComponent());

    gameObject.destroy();
    gameObject.destroy();

    expect(component.onDestroy).toHaveBeenCalledOnce();
    expect(view.removeAllEventListeners).toHaveBeenCalledOnce();
    expect(component.gameObject).toBeNull();
    expect(gameObject.components).toHaveLength(0);
  });
});

describe("Component and Transform edge cases", () => {
  it("returns null for an unattached component transform", () => {
    expect(new Component().transform).toBeNull();
  });

  it("uses the x scale for both axes when y is omitted", () => {
    const gameObject = new GameObject();

    gameObject.transform.setScale(0);
    gameObject.transform.translate(-5, 7);

    expect(gameObject.transform.scaleX).toBe(0);
    expect(gameObject.transform.scaleY).toBe(0);
    expect(gameObject.transform.position).toEqual({ x: -5, y: 7 });
  });
});
