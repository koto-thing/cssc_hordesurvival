import { Slider } from "../engine/index.js";

const HEALTH_BAR_WIDTH = 40;
const HEALTH_BAR_HEIGHT = 6;
const HEALTH_BAR_Y = -30;
const HIT_FLASH_DURATION = 0.18;

/**
 * 敵本体と頭上のHPバーをまとめて表示する
 */
export class EnemyView {
  constructor({ sprite, maxHp }) {
    this.view = new createjs.Container();
    this.sprite = sprite;
    this.flashRemaining = 0;
    this.healthBar = new Slider({
      minValue: 0,
      maxValue: maxHp,
      value: maxHp,
      wholeNumbers: true,
      width: HEALTH_BAR_WIDTH,
      height: HEALTH_BAR_HEIGHT,
      handleSize: 0,
      trackThickness: 4,
      backgroundColor: "#321f2b",
      fillColor: "#5ee173",
    });

    this.healthBar.x = -HEALTH_BAR_WIDTH / 2;
    this.healthBar.y = HEALTH_BAR_Y;
    this.healthBar.mouseEnabled = false;
    this.view.addChild(this.sprite, this.healthBar);
  }

  /**
   * 死亡演出中はHPバーを非表示にする
   */
  beginDeath() {
    this.flashRemaining = 0;
    this.sprite.alpha = 1;
    this.healthBar.visible = false;
  }

  /**
   * 現在HPをバーへ反映する
   */
  setHealth(health) {
    this.healthBar.setValueWithoutNotify(health);
  }

  /**
   * 被弾時の点滅を開始する
   */
  flash() {
    this.flashRemaining = HIT_FLASH_DURATION;
  }

  /**
   * 点滅表示を更新する
   */
  tick(deltaTime) {
    this.flashRemaining = Math.max(0, this.flashRemaining - Math.max(0, deltaTime));
    this.sprite.alpha =
      this.flashRemaining > 0 && Math.floor(this.flashRemaining * 60) % 2 === 0 ? 0.25 : 1;
  }
}
