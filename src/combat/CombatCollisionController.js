import { CollisionSystem } from "../engine/index.js";

/** プレイヤー、敵、弾の衝突結果を戦闘ルールへ変換する */
export class CombatCollisionController {
  constructor({
    onPlayerBulletHit = () => {},
    onPlayerHit = () => {},
    onEnemyHit = () => {},
    onEnemyDefeated = () => {},
  } = {}) {
    this.onPlayerBulletHit = onPlayerBulletHit;
    this.onPlayerHit = onPlayerHit;
    this.onEnemyHit = onEnemyHit;
    this.onEnemyDefeated = onEnemyDefeated;
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

    // プレイヤーと敵の接触判定を行う
    if (!player?.destroyed) {
      this.#resolveEnemyContacts(player, enemies);
    }

    // 弾の衝突判定を行う
    for (const bullet of bullets) {
      // すでに破壊されている弾は無視する
      if (bullet.destroyed) {
        continue;
      }

      // 弾の所有者に応じて衝突判定を行う
      if (bullet.status.owner === "player") {
        this.#resolvePlayerBullet(bullet, player, enemies, result);
      } else if (bullet.status.owner === "enemy" && !player?.destroyed) {
        this.#resolveEnemyBullet(bullet, player);
      }
    }

    return result;
  }

  /**
   * プレイヤーと敵の接触を解決する
   * @param player
   * @param enemies
   */
  #resolveEnemyContacts(player, enemies) {
    // プレイヤーと敵の接触判定を行う
    for (const enemy of enemies) {
      // すでに破壊されている敵は無視する
      if (!enemy.destroyed && CollisionSystem.intersects(player, enemy)) {
        // プレイヤーが敵の攻撃を受ける
        if (player.statusController.takeHit(enemy.status.attack)) {
          this.onPlayerHit({
            x: player.transform.x,
            y: player.transform.y,
            damage: enemy.status.attack,
          });
          enemy.destroy();
        }
      }
    }
  }

  /**
   * プレイヤーの弾と敵の衝突を解決する
   * @param bullet
   * @param player
   * @param enemies
   * @param result
   */
  #resolvePlayerBullet(bullet, player, enemies, result) {
    // プレイヤーの弾が敵に接触しているかどうかを判定する
    for (const enemy of enemies) {
      // すでに破壊されている敵、または弾が当たらない敵は無視する
      if (
        enemy.destroyed ||
        !bullet.status.canHit(enemy) ||
        !CollisionSystem.intersects(bullet, enemy)
      ) {
        continue;
      }

      // 弾が敵に接触した場合の処理
      bullet.status.recordHit(enemy);
      enemy.status.damage(bullet.status.damage);
      enemy.playHitFeedback();
      this.onPlayerBulletHit({
        x: enemy.transform.x,
        y: enemy.transform.y,
        damage: bullet.status.damage,
      });

      // 敵のHPが0以下になった場合、経験値とスコアを加算し、敵を倒す
      if (enemy.status.hp <= 0) {
        player.statusController.addExperience(enemy.status.experience);
        result.defeatedEnemies += 1;
        result.scoreGained += enemy.status.score;
        this.onEnemyDefeated();
        enemy.defeat();
      } else {
        this.onEnemyHit();
      }

      // 弾が貫通しない場合は弾を破壊する
      if (!bullet.status.piercing) {
        bullet.destroy();
        return;
      }
    }
  }

  /**
   * 敵の弾とプレイヤーの衝突を解決する
   * @param bullet
   * @param player
   */
  #resolveEnemyBullet(bullet, player) {
    // 敵の弾がプレイヤーに接触しているかどうかを判定する
    if (!bullet.status.canHit(player) || !CollisionSystem.intersects(bullet, player)) {
      return;
    }

    // 弾がプレイヤーに接触した場合の処理
    bullet.status.recordHit(player);
    if (player.statusController.takeHit(bullet.status.damage)) {
      this.onPlayerHit({
        x: player.transform.x,
        y: player.transform.y,
        damage: bullet.status.damage,
      });
    }

    // 敵弾はプレイヤーへ接触した時点で必ず消滅させる
    bullet.destroy();
  }
}
