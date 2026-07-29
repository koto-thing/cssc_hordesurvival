import { describe, expect, it } from "vite-plus/test";
import { GameRenderLayers } from "./GameRenderLayers.js";

describe("GameRenderLayers", () => {
  it("keeps HUD in front of game objects and menu UI at the very front", () => {
    const root = new createjs.Container();
    const layers = new GameRenderLayers();

    layers.attachTo(root);

    expect(root.children).toEqual([
      layers.background,
      layers.world,
      layers.combatFeedback,
      layers.hud,
      layers.result,
      layers.menu,
    ]);
  });

  it("keeps newly spawned game objects behind HUD and result layers", () => {
    const root = new createjs.Container();
    const layers = new GameRenderLayers();
    const enemy = new createjs.Container();
    const bullet = new createjs.Container();
    layers.attachTo(root);

    layers.world.addChild(enemy, bullet);

    expect(root.children.at(-3)).toBe(layers.hud);
    expect(root.children.at(-2)).toBe(layers.result);
    expect(root.children.at(-1)).toBe(layers.menu);
    expect(layers.world.children).toEqual([enemy, bullet]);
  });
});
