import { describe, expect, it } from "vite-plus/test";
import {
  CircleColliderComponent,
  ColliderComponent,
  EllipseColliderComponent,
  RectangleColliderComponent,
} from "./ColliderComponent.js";
import { GameObject } from "./GameObject.js";

function attach(collider, x = 0, y = 0, rotation = 0) {
  const gameObject = new GameObject();
  gameObject.transform.position = { x, y };
  gameObject.transform.rotation = rotation;
  gameObject.addComponent(collider);
  return collider;
}

describe("ColliderComponent edge cases", () => {
  it("uses offsets even when the collider is unattached", () => {
    const collider = new ColliderComponent({ offsetX: -3, offsetY: 4 });

    expect(collider.center).toEqual({ x: -3, y: 4 });
    expect(collider.intersects(null)).toBe(false);
  });

  it("requires every shape dimension", () => {
    expect(() => new CircleColliderComponent()).toThrow("requires a radius");
    expect(() => new RectangleColliderComponent({ width: 1 })).toThrow("requires width and height");
    expect(() => new EllipseColliderComponent({ radiusX: 1 })).toThrow(
      "requires radiusX and radiusY",
    );
  });

  it("treats externally touching circles as intersecting", () => {
    const first = attach(new CircleColliderComponent({ radius: 5 }));
    const touching = attach(new CircleColliderComponent({ radius: 5 }), 10, 0);
    const separated = attach(new CircleColliderComponent({ radius: 5 }), 10.001, 0);

    expect(first.intersects(touching)).toBe(true);
    expect(first.intersects(separated)).toBe(false);
  });

  it("treats touching rectangle edges and corners as intersecting", () => {
    const first = attach(new RectangleColliderComponent({ width: 10, height: 10 }));
    const edge = attach(new RectangleColliderComponent({ width: 10, height: 10 }), 10, 0);
    const corner = attach(new RectangleColliderComponent({ width: 10, height: 10 }), 10, 10);

    expect(first.intersects(edge)).toBe(true);
    expect(first.intersects(corner)).toBe(true);
  });

  it("detects a circle touching a rectangle corner symmetrically", () => {
    const rectangle = attach(new RectangleColliderComponent({ width: 10, height: 10 }));
    const circle = attach(new CircleColliderComponent({ radius: Math.SQRT2 }), 6, 6);

    expect(circle.intersects(rectangle)).toBe(true);
    expect(rectangle.intersects(circle)).toBe(true);
  });

  it("applies GameObject rotation to ellipse-circle intersections", () => {
    const ellipse = attach(new EllipseColliderComponent({ radiusX: 10, radiusY: 2 }), 0, 0, 90);
    const circle = attach(new CircleColliderComponent({ radius: 0 }), 0, 9);

    expect(ellipse.intersects(circle)).toBe(true);
    expect(circle.intersects(ellipse)).toBe(true);
  });

  it("includes collider offsets in mixed-shape intersections", () => {
    const ellipse = attach(new EllipseColliderComponent({ radiusX: 2, radiusY: 1, offsetX: 5 }));
    const rectangle = attach(new RectangleColliderComponent({ width: 2, height: 2, offsetX: 8 }));

    expect(ellipse.intersects(rectangle)).toBe(true);
    expect(rectangle.intersects(ellipse)).toBe(true);
  });
});
