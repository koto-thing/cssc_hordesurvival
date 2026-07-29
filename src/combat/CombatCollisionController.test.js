import { describe, expect, it, vi } from "vite-plus/test";
import { Bullet } from "../bullet/bullet.js";
import { BulletStatus } from "../bullet/BulletStatus.js";
import { Enemy } from "../enemy/enemy.js";
import { EnemyStatusController } from "../enemy/enemyStatusController.js";
import { Player } from "../player/player.js";
import { PlayerStatusController } from "../player/playerStatusController.js";
import { CombatCollisionController } from "./CombatCollisionController.js";

function placeAtOrigin(...objects) {
  for (const object of objects) {
    object.transform.position = { x: 0, y: 0 };
  }
}

describe("CombatCollisionController", () => {
  it("敵との接触でattack分のダメージを受け、接触した敵が消滅する", () => {
    const onPlayerHit = vi.fn();
    const controller = new CombatCollisionController({ onPlayerHit });
    const player = new Player({
      statusController: new PlayerStatusController({ health: 10, maxHealth: 10 }),
    });
    const enemy = new Enemy({
      status: new EnemyStatusController({ attack: 3 }),
    });
    placeAtOrigin(player, enemy);

    controller.resolve({ player, enemies: [enemy], bullets: [] });
    expect(player.statusController.health).toBe(7);
    expect(enemy.destroyed).toBe(true);
    expect(onPlayerHit).toHaveBeenCalledWith({ x: 0, y: 0, damage: 3 });
  });

  it("敵を倒すと敵に設定された経験値を獲得する", () => {
    const onEnemyHit = vi.fn();
    const onEnemyDefeated = vi.fn();
    const controller = new CombatCollisionController({ onEnemyHit, onEnemyDefeated });
    const player = new Player({
      statusController: new PlayerStatusController({
        experience: 95,
        experienceToNextLevel: 100,
      }),
    });
    const enemy = new Enemy({
      status: new EnemyStatusController({ hp: 1, experience: 10, score: 250 }),
    });
    const bullet = new Bullet({
      status: new BulletStatus({ owner: "player", damage: 1 }),
    });
    placeAtOrigin(player, enemy, bullet);
    player.transform.x = 100;

    const result = controller.resolve({ player, enemies: [enemy], bullets: [bullet] });

    expect(enemy.destroyed).toBe(true);
    expect(player.statusController.experience).toBe(5);
    expect(player.statusController.level).toBe(2);
    expect(result).toEqual({ defeatedEnemies: 1, scoreGained: 250 });
    expect(onEnemyDefeated).toHaveBeenCalledOnce();
    expect(onEnemyHit).not.toHaveBeenCalled();
  });

  it("通常のプレイヤー弾は敵へダメージを与えて消滅する", () => {
    const onPlayerBulletHit = vi.fn();
    const onEnemyHit = vi.fn();
    const onEnemyDefeated = vi.fn();
    const controller = new CombatCollisionController({
      onPlayerBulletHit,
      onEnemyHit,
      onEnemyDefeated,
    });
    const player = new Player();
    const enemy = new Enemy({ status: new EnemyStatusController({ hp: 3 }) });
    const bullet = new Bullet({
      status: new BulletStatus({ owner: "player", damage: 2, piercing: false }),
    });
    placeAtOrigin(player, enemy, bullet);
    player.transform.x = 100;

    controller.resolve({ player, enemies: [enemy], bullets: [bullet] });

    expect(enemy.status.hp).toBe(1);
    expect(bullet.destroyed).toBe(true);
    expect(onPlayerBulletHit).toHaveBeenCalledWith({ x: 0, y: 0, damage: 2 });
    expect(onEnemyHit).toHaveBeenCalledOnce();
    expect(onEnemyDefeated).not.toHaveBeenCalled();
  });

  it("貫通弾は複数の敵へ一度ずつ命中する", () => {
    const controller = new CombatCollisionController();
    const player = new Player();
    const enemies = [
      new Enemy({ status: new EnemyStatusController({ hp: 3 }) }),
      new Enemy({ status: new EnemyStatusController({ hp: 3 }) }),
    ];
    const bullet = new Bullet({
      status: new BulletStatus({ owner: "player", damage: 1, piercing: true }),
    });
    placeAtOrigin(player, bullet, ...enemies);
    player.transform.x = 100;

    controller.resolve({ player, enemies, bullets: [bullet] });
    controller.resolve({ player, enemies, bullets: [bullet] });

    expect(enemies.map((enemy) => enemy.status.hp)).toEqual([2, 2]);
    expect(bullet.destroyed).toBe(false);
  });

  it("敵弾はプレイヤーだけに命中する", () => {
    const onPlayerHit = vi.fn();
    const controller = new CombatCollisionController({ onPlayerHit });
    const player = new Player();
    const enemy = new Enemy();
    const bullet = new Bullet({
      status: new BulletStatus({ owner: "enemy", damage: 2 }),
    });
    placeAtOrigin(player, enemy, bullet);
    enemy.transform.x = 100;

    controller.resolve({ player, enemies: [enemy], bullets: [bullet] });

    expect(player.statusController.health).toBe(1);
    expect(enemy.status.hp).toBe(enemy.status.maxHp);
    expect(bullet.destroyed).toBe(true);
    expect(onPlayerHit).toHaveBeenCalledWith({ x: 0, y: 0, damage: 2 });
  });

  it("無敵時間中の敵弾では被弾演出を通知しない", () => {
    const onPlayerHit = vi.fn();
    const controller = new CombatCollisionController({ onPlayerHit });
    const player = new Player();
    const bullets = [
      new Bullet({ status: new BulletStatus({ owner: "enemy", damage: 1 }) }),
      new Bullet({ status: new BulletStatus({ owner: "enemy", damage: 1 }) }),
    ];
    placeAtOrigin(player, ...bullets);

    controller.resolve({ player, enemies: [], bullets });

    expect(player.statusController.health).toBe(2);
    expect(onPlayerHit).toHaveBeenCalledTimes(1);
  });

  it("貫通設定の敵弾もプレイヤーへ接触すると消滅する", () => {
    const controller = new CombatCollisionController();
    const player = new Player();
    const bullet = new Bullet({
      status: new BulletStatus({ owner: "enemy", damage: 1, piercing: true }),
    });
    placeAtOrigin(player, bullet);

    controller.resolve({ player, enemies: [], bullets: [bullet] });

    expect(player.statusController.health).toBe(2);
    expect(bullet.destroyed).toBe(true);
  });
});
