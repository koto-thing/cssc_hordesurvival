/**
 * レベルアップ強化の待機状態とPlayerへの適用を管理する
 *
 * effectHandlersへ効果タイプを登録することで、地雷設置などの特殊能力も
 * 選択UIやレベル進行を変更せず追加できる
 */
export class PlayerUpgradeController {
  constructor({ player, upgrades, effectHandlers = {}, choiceCount = 3, random = Math.random }) {
    this.player = player;
    this.upgrades = [...upgrades];
    this.choiceCount = Math.max(1, Math.floor(choiceCount));
    this.random = random;
    this.pendingSelections = 0;
    this.ranks = new Map();
    this.currentChoices = [];
    this.effectHandlers = {
      moveSpeedMultiplier: (effect) => {
        this.player.moveController.moveSpeed *= effect.value;
      },
      shotIntervalMultiplier: (effect) => {
        this.player.playerShotController.bulletShotInterval = Math.max(
          0.01,
          this.player.playerShotController.bulletShotInterval * effect.value,
        );
      },
      shotRangeMultiplier: (effect) => {
        const shotController = this.player.playerShotController;
        if (shotController.shotRange !== null) {
          shotController.shotRange *= effect.value;
        }
      },
      addOuterShots: (effect) => {
        const angles = this.player.playerShotController.shotAngles;
        const outerAngle = Math.max(...angles.map((angle) => Math.abs(angle))) + effect.value;
        this.player.playerShotController.shotAngles = [-outerAngle, ...angles, outerAngle];
      },
      maxHealth: (effect) => {
        this.player.statusController.maxHealth += effect.value;
        this.player.statusController.heal(effect.value);
      },
      ...effectHandlers,
    };
  }

  /**
   * 獲得したレベル数だけ強化選択を予約する
   * @param count 獲得レベル数
   */
  enqueue(count = 1) {
    this.pendingSelections += Math.max(0, Math.floor(count));
    if (this.currentChoices.length === 0 && this.pendingSelections > 0) {
      this.#drawChoices();
    }
  }

  /**
   * 現在選択可能な強化を返す
   */
  getChoices() {
    return this.currentChoices.map((upgrade) => ({
      ...upgrade,
      rank: this.ranks.get(upgrade.id) ?? 0,
    }));
  }

  /**
   * 強化をPlayerへ適用し、待機中の選択を1つ完了する
   * @param upgradeId 適用する強化ID
   * @returns {boolean} 適用できた場合はtrue
   */
  select(upgradeId) {
    if (this.pendingSelections <= 0) {
      return false;
    }

    const upgrade = this.currentChoices.find(({ id }) => id === upgradeId);
    const handler = upgrade && this.effectHandlers[upgrade.effect.type];
    if (!upgrade || !handler) {
      return false;
    }

    handler(upgrade.effect, this.player);
    this.ranks.set(upgrade.id, (this.ranks.get(upgrade.id) ?? 0) + 1);
    this.pendingSelections -= 1;
    this.currentChoices = [];
    if (this.pendingSelections > 0) {
      this.#drawChoices();
    }
    return true;
  }

  /**
   * 現在強化選択待機中か
   * @returns {boolean}
   */
  get isSelecting() {
    return this.pendingSelections > 0;
  }

  /**
   * 候補プールから重複なしで指定枚数を抽選する
   */
  #drawChoices() {
    const pool = [...this.upgrades];
    const count = Math.min(this.choiceCount, pool.length);

    // Fisher-Yatesの先頭部分だけを入れ替えて必要枚数を抽選
    for (let index = 0; index < count; index += 1) {
      const remaining = pool.length - index;
      const offset = Math.floor(this.random() * remaining);
      const selectedIndex = index + Math.min(remaining - 1, Math.max(0, offset));
      [pool[index], pool[selectedIndex]] = [pool[selectedIndex], pool[index]];
    }

    this.currentChoices = pool.slice(0, count);
  }
}
