import { CollisionSystem } from "../engine/index.js";

/** プレイヤー、敵、弾の衝突結果を戦闘ルールへ変換する */
export class CombatCollisionController {
  constructor({ onPlayerBulletHit = () => {} } = {}) {
    this.onPlayerBulletHit = onPlayerBulletHit;
  }

  /**
   * 現在の戦闘オブジェクト間の衝突を解決する
   * @param options
   * @param options.player プレイヤー
   * @param options.enemies 敵一覧
   * @param options.bullets 弾一覧
   */
  resolve({ player, enemies, bullets }) {
    const result = {
      defeatedEnemies: 0,
      scoreGained: 0,
    };

    if (!player?.destroyed) {
      this.#resolveEnemyContacts(player, enemies);
    }

    for (const bullet of bullets) {
      if (bullet.destroyed) {
        continue;
      }

      if (bullet.status.owner === "player") {
        this.#resolvePlayerBullet(bullet, player, enemies, result);
      } else if (bullet.status.owner === "enemy" && !player?.destroyed) {
        this.#resolveEnemyBullet(bullet, player);
      }
    }

    return result;
  }

  #resolveEnemyContacts(player, enemies) {
    for (const enemy of enemies) {
      if (!enemy.destroyed && CollisionSystem.intersects(player, enemy)) {
        if (player.statusController.takeHit(enemy.status.attack)) {
          enemy.destroy();
        }
      }
    }
  }

  #resolvePlayerBullet(bullet, player, enemies, result) {
    for (const enemy of enemies) {
      if (
        enemy.destroyed ||
        !bullet.status.canHit(enemy) ||
        !CollisionSystem.intersects(bullet, enemy)
      ) {
        continue;
      }

      bullet.status.recordHit(enemy);
      enemy.status.damage(bullet.status.damage);
      enemy.playHitFeedback();
      this.onPlayerBulletHit({
        x: enemy.transform.x,
        y: enemy.transform.y,
        damage: bullet.status.damage,
      });

      if (enemy.status.hp <= 0) {
        player.statusController.addExperience(enemy.status.experience);
        result.defeatedEnemies += 1;
        result.scoreGained += enemy.status.score;
        enemy.destroy();
      }

      if (!bullet.status.piercing) {
        bullet.destroy();
        return;
      }
    }
  }

  #resolveEnemyBullet(bullet, player) {
    if (!bullet.status.canHit(player) || !CollisionSystem.intersects(bullet, player)) {
      return;
    }

    bullet.status.recordHit(player);
    player.statusController.takeHit(bullet.status.damage);

    // 敵弾はプレイヤーへ接触した時点で必ず消滅させる
    bullet.destroy();
  }
}
