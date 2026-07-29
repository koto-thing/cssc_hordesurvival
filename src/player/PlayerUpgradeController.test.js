import { describe, expect, it, vi } from "vite-plus/test";

import { Player } from "./player.js";
import { PlayerMoveController } from "./playerMoveController.js";
import { PlayerShotController } from "./playerShotController.js";
import { PlayerUpgradeController } from "./PlayerUpgradeController.js";

describe("PlayerUpgradeController", () => {
  it("選択した強化を適用して待機数を減らす", () => {
    const player = new Player({
      moveController: new PlayerMoveController({ moveSpeed: 100 }),
    });
    const controller = new PlayerUpgradeController({
      player,
      upgrades: [
        {
          id: "speed",
          name: "速度",
          description: "速くなる",
          effect: { type: "moveSpeedMultiplier", value: 1.2 },
        },
      ],
    });

    controller.enqueue(2);
    expect(controller.select("speed")).toBe(true);
    expect(player.moveController.moveSpeed).toBeCloseTo(120);
    expect(controller.pendingSelections).toBe(1);
    expect(controller.getChoices()[0].rank).toBe(1);
  });

  it("複数レベル分の選択が終わるまで選択状態を維持する", () => {
    const controller = new PlayerUpgradeController({
      player: new Player(),
      upgrades: [
        {
          id: "rate",
          effect: { type: "shotIntervalMultiplier", value: 0.9 },
        },
      ],
    });

    controller.enqueue(2);
    controller.select("rate");
    expect(controller.isSelecting).toBe(true);
    controller.select("rate");
    expect(controller.isSelecting).toBe(false);
  });

  it("登録した独自効果ハンドラーで特殊能力を追加できる", () => {
    const applyMineAbility = vi.fn();
    const player = new Player({
      playerShotController: new PlayerShotController(),
    });
    const controller = new PlayerUpgradeController({
      player,
      upgrades: [{ id: "mine", effect: { type: "mineAbility", value: 1 } }],
      effectHandlers: { mineAbility: applyMineAbility },
    });

    controller.enqueue();
    controller.select("mine");

    expect(applyMineAbility).toHaveBeenCalledWith({ type: "mineAbility", value: 1 }, player);
  });

  it("候補プールから重複しない3件だけを抽選する", () => {
    const upgrades = Array.from({ length: 6 }, (_, index) => ({
      id: `upgrade-${index}`,
      effect: { type: "moveSpeedMultiplier", value: 1.01 },
    }));
    const controller = new PlayerUpgradeController({
      player: new Player(),
      upgrades,
      random: () => 0,
    });

    controller.enqueue();
    const choices = controller.getChoices();

    expect(choices).toHaveLength(3);
    expect(new Set(choices.map(({ id }) => id)).size).toBe(3);
    expect(controller.select("upgrade-5")).toBe(false);
    expect(controller.pendingSelections).toBe(1);
  });

  it("連続レベルアップでは選択後に次の候補を再抽選する", () => {
    let randomValue = 0;
    const controller = new PlayerUpgradeController({
      player: new Player(),
      upgrades: Array.from({ length: 4 }, (_, index) => ({
        id: `upgrade-${index}`,
        effect: { type: "moveSpeedMultiplier", value: 1.01 },
      })),
      random: () => randomValue,
    });

    controller.enqueue(2);
    const firstChoices = controller.getChoices().map(({ id }) => id);
    randomValue = 0.99;
    controller.select(firstChoices[0]);
    const nextChoices = controller.getChoices().map(({ id }) => id);

    expect(nextChoices).toHaveLength(3);
    expect(nextChoices).not.toEqual(firstChoices);
  });
});
