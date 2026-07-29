/**
 * 選択可能なキャラクター定義
 *
 * キャラクターを追加するときはこの配列へ定義を追加する
 */
export const characterList = [
  {
    id: "crimson",
    name: "Crimson",
    color: "#e65353",
    description: "貫通弾を使う\n攻撃間隔が遅い\n射程が一番長い",
    gameplay: {
      bulletId: "piercing",
      shotInterval: 0.45,
      shotAngles: [0],
      maxHealth: 3,
      moveSpeed: 200,
      shotRange: 1200,
    },
    upgrades: [
      {
        id: "crimson-range",
        name: "深紅の射程",
        description: "貫通弾の射程が20%上昇",
        effect: { type: "shotRangeMultiplier", value: 1.2 },
      },
      {
        id: "crimson-fire-rate",
        name: "連なる深紅",
        description: "攻撃間隔が10%短縮",
        effect: { type: "shotIntervalMultiplier", value: 0.9 },
      },
      {
        id: "crimson-mobility",
        name: "狙撃手の足運び",
        description: "移動速度が8%上昇",
        effect: { type: "moveSpeedMultiplier", value: 1.08 },
      },
    ],
  },
  {
    id: "azure",
    name: "Azure",
    color: "#4d83e6",
    description: "攻撃間隔が早い\n通常弾を使う\n移動速度が一番速い",
    gameplay: {
      bulletId: "normal",
      shotInterval: 0.14,
      shotAngles: [0],
      maxHealth: 3,
      moveSpeed: 240,
      shotRange: 1000,
    },
    upgrades: [
      {
        id: "azure-fire-rate",
        name: "蒼穹の速射",
        description: "攻撃間隔が12%短縮",
        effect: { type: "shotIntervalMultiplier", value: 0.88 },
      },
      {
        id: "azure-mobility",
        name: "追い風",
        description: "移動速度が12%上昇",
        effect: { type: "moveSpeedMultiplier", value: 1.12 },
      },
      {
        id: "azure-range",
        name: "風切る弾丸",
        description: "通常弾の射程が12%上昇",
        effect: { type: "shotRangeMultiplier", value: 1.12 },
      },
    ],
  },
  {
    id: "emerald",
    name: "Emerald",
    color: "#42b878",
    description: "散弾を使う\n体力が高い\n移動速度が一番遅い\n射程が一番短い",
    gameplay: {
      bulletId: "normal",
      shotInterval: 0.32,
      shotAngles: [-0.2, 0, 0.2],
      maxHealth: 5,
      moveSpeed: 160,
      shotRange: 800,
    },
    upgrades: [
      {
        id: "emerald-spread",
        name: "翠の散華",
        description: "散弾の左右へ弾を1発ずつ追加",
        effect: { type: "addOuterShots", value: 0.2 },
      },
      {
        id: "emerald-vitality",
        name: "常緑の生命",
        description: "最大体力が1上昇し、体力を1回復",
        effect: { type: "maxHealth", value: 1 },
      },
      {
        id: "emerald-mobility",
        name: "根走り",
        description: "移動速度が10%上昇",
        effect: { type: "moveSpeedMultiplier", value: 1.1 },
      },
    ],
  },
];
