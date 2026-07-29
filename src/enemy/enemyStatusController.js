import { Component, MathUtil } from "../engine/index.js";

const ENEMY_DEFAULT_HP = 10;
const ENEMY_DEFAULT_EXPERIENCE = 1;
const ENEMY_DEFAULT_SCORE = 0;

/**
 * 敵の戦闘ステータスを管理するコンポーネント
 */
export class EnemyStatusController extends Component {
  /**
   * @param options
   * @param options.hp 敵の最大HP
   * @param options.attack 敵の攻撃力
   * @param options.experience 倒したプレイヤーへ付与する経験値
   * @param options.score 倒したときに獲得するスコア
   */
  constructor({
    hp = ENEMY_DEFAULT_HP,
    attack = 1,
    experience = ENEMY_DEFAULT_EXPERIENCE,
    score = ENEMY_DEFAULT_SCORE,
  } = {}) {
    super();

    this.maxHp = MathUtil.positiveInteger(hp, ENEMY_DEFAULT_HP);
    this.hp = this.maxHp;
    this.attack = MathUtil.nonNegativeInteger(attack);
    this.experience = MathUtil.nonNegativeInteger(experience);
    this.score = MathUtil.nonNegativeInteger(score);
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
