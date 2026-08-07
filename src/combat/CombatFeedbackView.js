import { Text } from "../engine/index.js";

const FEEDBACK_DURATION = 0.55;
const PARTICLE_COUNT = 8;

/**
 * ダメージ数値と弾命中パーティクルをワールド座標上へ表示する
 */
export class CombatFeedbackView {
  constructor() {
    this.view = new createjs.Container();
    this.entries = [];
    this.view.mouseEnabled = false;
  }

  /**
   * 指定位置へPlayer弾の命中演出を生成する
   */
  showPlayerHit({ x, y, damage }) {
    const container = new createjs.Container();
    container.x = x;
    container.y = y;

    const damageText = new Text({
      text: String(damage),
      font: "700 20px sans-serif",
      color: "#b22222",
    });
    damageText.x = -damageText.uiWidth / 2;
    damageText.y = -38;
    container.addChild(damageText);

    // パーティクルを生成する
    const particles = [];
    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const angle = (Math.PI * 2 * index) / PARTICLE_COUNT;
      const particle = new createjs.Shape();
      particle.graphics.beginFill("#d2691e").drawCircle(0, 0, 2);
      particle.cache(-2, -2, 4, 4);
      container.addChild(particle);
      particles.push({
        view: particle,
        velocityX: Math.cos(angle) * 70,
        velocityY: Math.sin(angle) * 70,
      });
    }

    // 演出を管理するエントリを追加する
    this.view.addChild(container);
    this.entries.push({ container, damageText, particles, age: 0 });
  }

  /**
   * 浮遊する数値とパーティクルを更新する
   */
  tick(deltaTime) {
    const dt = Math.max(0, Number(deltaTime) || 0);

    // 古い順に逆ループして破棄する
    for (let index = this.entries.length - 1; index >= 0; index -= 1) {
      const entry = this.entries[index];
      entry.age += dt;
      const progress = Math.min(1, entry.age / FEEDBACK_DURATION);
      entry.damageText.y -= 28 * dt;
      entry.container.alpha = 1 - progress;

      for (const particle of entry.particles) {
        particle.view.x += particle.velocityX * dt;
        particle.view.y += particle.velocityY * dt;
      }

      if (entry.age >= FEEDBACK_DURATION) {
        this.view.removeChild(entry.container);
        this.entries.splice(index, 1);
      }
    }
  }

  /**
   * 残っている演出を破棄する
   */
  destroy() {
    this.entries = [];
    this.view.removeAllChildren();
  }
}
