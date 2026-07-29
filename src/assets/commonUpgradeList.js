/**
 * 全キャラクターが取得できる基礎ステータス強化
 *
 * キャラクター固有強化と同じ形式にすることで、同じ抽選・適用処理を利用する
 */
export const commonUpgradeList = [
  {
    id: "common-move-speed",
    name: "脚力強化",
    description: "移動速度が5%上昇",
    effect: { type: "moveSpeedMultiplier", value: 1.05 },
  },
  {
    id: "common-fire-rate",
    name: "連射強化",
    description: "攻撃間隔が5%短縮",
    effect: { type: "shotIntervalMultiplier", value: 0.95 },
  },
  {
    id: "common-shot-range",
    name: "射程強化",
    description: "弾の射程が10%上昇",
    effect: { type: "shotRangeMultiplier", value: 1.1 },
  },
  {
    id: "common-vitality",
    name: "体力強化",
    description: "最大体力が1上昇し、体力を1回復",
    effect: { type: "maxHealth", value: 1 },
  },
];
