import { describe, expect, it } from "vite-plus/test";

import { KeyCode } from "../engine/domain/KeyCode.js";
import { Player } from "./player.js";
import { PlayerMoveController } from "./playerMoveController.js";
import { PlayerStatusController } from "./playerStatusController.js";
import { PlayerShotController } from "./playerShotController.js";

function createInputSystem(...heldKeys) {
  const held = new Set(heldKeys);
  return {
    getKey(code) {
      return held.has(code);
    },
  };
}

describe("Player", () => {
  it("composes movement and status components", () => {
    const player = new Player();

    expect(player.getComponent(PlayerMoveController)).toBe(player.moveController);
    expect(player.getComponent(PlayerStatusController)).toBe(player.statusController);
    expect(player.getComponent(PlayerShotController)).toBe(player.playerShotController);
  });

  it("fires toward the cursor when the shot interval elapses", () => {
    const spawned = [];
    const shotController = new PlayerShotController({
      bulletSpawner: {
        spawn(options) {
          spawned.push(options);
        },
      },
      inputSystem: {
        mousePosition: { x: 10, y: 0 },
      },
    });
    const player = new Player({ playerShotController: shotController });

    player.tick(0.1);
    expect(spawned).toEqual([]);

    player.tick(0.1);

    expect(spawned).toEqual([
      {
        bulletId: "normal",
        position: { x: 0, y: 0 },
        angle: 0,
        owner: "player",
        range: null,
      },
    ]);
  });

  it("keeps health processing in PlayerStatusController", () => {
    const player = new Player();
    const status = player.statusController;

    expect(status.health).toBe(3);
    expect(status.maxHealth).toBe(3);
    status.damage(2);
    expect(status.health).toBe(1);
    status.heal(100);
    expect(status.health).toBe(3);
    status.damage(100);
    expect(status.health).toBe(0);
  });

  it("supports character-specific shot intervals and spread angles", () => {
    const spawned = [];
    const shotController = new PlayerShotController({
      bulletSpawner: {
        spawn(options) {
          spawned.push(options);
        },
      },
      bulletId: "piercing",
      shotInterval: 0.5,
      shotAngles: [-0.2, 0, 0.2],
      inputSystem: {
        mousePosition: { x: 10, y: 0 },
      },
    });
    const player = new Player({ playerShotController: shotController });

    player.tick(0.49);
    expect(spawned).toEqual([]);
    player.tick(0.01);

    expect(spawned.map(({ bulletId, angle }) => ({ bulletId, angle }))).toEqual([
      { bulletId: "piercing", angle: -0.2 },
      { bulletId: "piercing", angle: 0 },
      { bulletId: "piercing", angle: 0.2 },
    ]);
  });

  it("passes the character-specific range to every spawned bullet", () => {
    const spawned = [];
    const player = new Player({
      playerShotController: new PlayerShotController({
        bulletSpawner: {
          spawn(options) {
            spawned.push(options);
          },
        },
        shotRange: 1200,
        inputSystem: {
          mousePosition: { x: 10, y: 0 },
        },
      }),
    });

    player.tick(0.2);

    expect(spawned[0].range).toBe(1200);
  });

  it("keeps experience processing in PlayerStatusController", () => {
    const statusController = new PlayerStatusController();
    const player = new Player({ statusController });

    player.statusController.setExperience(120, 80);

    expect(player.statusController.experience).toBe(80);
    expect(player.statusController.experienceToNextLevel).toBe(80);
  });

  it("levels up while preserving experience above the threshold", () => {
    const status = new PlayerStatusController({
      experience: 90,
      experienceToNextLevel: 100,
    });

    status.addExperience(25);

    expect(status.experience).toBe(15);
    expect(status.level).toBe(2);
  });

  it("updates movement components through GameObject.tick", () => {
    const moveController = new PlayerMoveController({
      moveSpeed: 100,
      inputSystem: createInputSystem(KeyCode.D),
    });
    const player = new Player({ moveController });

    player.tick(0.5);

    expect(player.transform.position).toEqual({ x: 50, y: 0 });
    expect(player.moveController.velocityX).toBe(100);
    expect(player.moveController.velocityY).toBe(0);
  });

  it("supports arrow keys and normalizes diagonal movement", () => {
    const moveController = new PlayerMoveController({
      moveSpeed: 100,
      inputSystem: createInputSystem(KeyCode.ArrowRight, KeyCode.ArrowDown),
    });
    const player = new Player({ moveController });

    player.tick(1);

    expect(Math.hypot(player.transform.x, player.transform.y)).toBeCloseTo(100);
    expect(player.transform.x).toBeCloseTo(player.transform.y);
  });

  it("does not move when opposite inputs cancel each other", () => {
    const moveController = new PlayerMoveController({
      moveSpeed: 100,
      inputSystem: createInputSystem(KeyCode.A, KeyCode.D),
    });
    const player = new Player({ moveController });

    player.tick(1);

    expect(player.transform.position).toEqual({ x: 0, y: 0 });
    expect(player.moveController.velocityX).toBe(0);
    expect(player.moveController.velocityY).toBe(0);
  });
});
