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
  drawRoundRect() {
    return this;
  }
}

class Container {
  constructor() {
    this.children = [];
    this.handlers = {};
  }
  addChild(...children) {
    this.children.push(...children);
  }
  on(type, listener, scope) {
    this.handlers[type] = listener.bind(scope);
  }
  cache() {}
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
  getMeasuredHeight() {
    return 24;
  }
}

let Button;

beforeAll(async () => {
  globalThis.createjs = { Container, Shape, Text: CreateText };
  ({ Button } = await import("./Button.js"));
});

describe("Button", () => {
  it("centers text vertically using its measured height", () => {
    const button = new Button({ height: 64 });

    expect(button.textView.y).toBe(20);
  });
});
