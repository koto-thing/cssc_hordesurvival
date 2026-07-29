import { Component, MathUtil } from "../engine/index.js";

const ENEMY_DEFAULT_HP = 10;

/**
 * 敵の戦闘ステータスを管理するコンポーネント
 */
export class EnemyStatusController extends Component {
  /**
   * @param options
   * @param options.hp 敵の最大HP
   * @param options.attack 敵の攻撃力
   */
  constructor({ hp = ENEMY_DEFAULT_HP, attack = 1 } = {}) {
    super();

    this.maxHp = MathUtil.positiveInteger(hp, ENEMY_DEFAULT_HP);
    this.hp = this.maxHp;
    this.attack = MathUtil.nonNegativeInteger(attack);
  }

  /**
   * 敵のHPを設定する
   * @param health 設定するHP
   */
  setHealth(health) {
    this.hp = MathUtil.clampInteger(health, 0, this.maxHp);
  }

  /**
   * 敵にダメージを与える
   * @param amount ダメージ量
   */
  damage(amount = 1) {
    this.setHealth(this.hp - MathUtil.nonNegativeInteger(amount));
  }
}
