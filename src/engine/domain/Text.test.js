import { beforeAll, describe, expect, it } from "vite-plus/test";

class Graphics {
  clear() {
    return this;
  }

  beginFill() {
    return this;
  }

  drawRect() {
    return this;
  }
}

class Container {
  constructor() {
    this.children = [];
    this.cacheCalls = [];
  }

  addChild(...children) {
    this.children.push(...children);
  }

  cache(...args) {
    this.cacheCalls.push(args);
  }
}

class Shape {
  constructor() {
    this.graphics = new Graphics();
  }
}

class CreateText {
  constructor(text, font, color) {
    this.text = text;
    this.font = font;
    this.color = color;
  }

  getMeasuredWidth() {
    return this.text.length * 10;
  }

  getMeasuredHeight() {
    return 20;
  }
}

let Text;

beforeAll(async () => {
  globalThis.createjs = { Container, Shape, Text: CreateText };
  ({ Text } = await import("./Text.js"));
});

describe("Text", () => {
  it("draws an outline behind the fill and keeps its content synchronized", () => {
    const text = new Text({
      text: "HUD",
      width: 100,
      height: 40,
      outlineColor: "#000000",
      outlineWidth: 5,
    });

    expect(text.children[0]).toBe(text.outlineView);
    expect(text.outlineView.outline).toBe(5);
    expect(text.outlineView.color).toBe("#000000");
    expect(text.cacheCalls.at(-1)).toEqual([-5, -5, 110, 50]);

    text.setText("SCORE");

    expect(text.outlineView.text).toBe("SCORE");
    expect(text.textView.text).toBe("SCORE");
  });
});
