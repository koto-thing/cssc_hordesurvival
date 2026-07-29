import { Component } from "../engine/index.js";

/**
 * 敵のステータス変化を表示へ反映する
 */
export class EnemyPresentationController extends Component {
  constructor({ enemyView, status }) {
    super();
    this.enemyView = enemyView;
    this.status = status;
  }

  /**
   * HP表示と被弾点滅を更新する
   */
  tick(deltaTime) {
    this.enemyView.setHealth(this.status.hp);
    this.enemyView.tick(deltaTime);
  }

  /**
   * Player弾が命中した際の点滅を開始する
   */
  playHitFeedback() {
    this.enemyView.setHealth(this.status.hp);
    this.enemyView.flash();
  }

  /**
   * 死亡演出用の表示へ切り替える
   */
  beginDeath() {
    this.enemyView.beginDeath();
  }
}
