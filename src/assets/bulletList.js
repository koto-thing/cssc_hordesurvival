/**
 * 弾の種類とその特性を定義するオブジェクト
 * @type {{normal: {imageId: string, speed: number, damage: number, lifetime: number, piercing: boolean, movementType: string}, piercing: {imageId: string, speed: number, damage: number, lifetime: number, piercing: boolean, movementType: string}, slowPower: {imageId: string, speed: number, damage: number, lifetime: number, piercing: boolean, movementType: string}, wave: {imageId: string, speed: number, damage: number, lifetime: number, piercing: boolean, movementType: string, amplitude: number, frequency: number}, enemyNormal: {imageId: string, speed: number, damage: number, lifetime: number, piercing: boolean, movementType: string}, enemyPredictive: {imageId: string, speed: number, damage: number, lifetime: number, piercing: boolean, movementType: string}}}
 */
export const bulletList = {
  normal: {
    imageId: "normalBullet",
    speed: 500,
    damage: 1,
    lifetime: 2,
    piercing: false,
    movementType: "straight",
  },

  piercing: {
    imageId: "normalBullet",
    speed: 450,
    damage: 1,
    lifetime: 2.5,
    piercing: true,
    movementType: "straight",
  },

  slowPower: {
    imageId: "powerBullet",
    speed: 250,
    damage: 5,
    lifetime: 3,
    piercing: false,
    movementType: "straight",
  },

  wave: {
    imageId: "waveBullet",
    speed: 350,
    damage: 2,
    lifetime: 4,
    piercing: true,
    movementType: "wave",
    amplitude: 30,
    frequency: 8,
  },

  enemyNormal: {
    imageId: "enemyBullet",
    speed: 220,
    damage: 1,
    lifetime: 5,
    piercing: false,
    movementType: "straight",
  },

  enemyPredictive: {
    imageId: "enemyPredictiveBullet",
    speed: 260,
    damage: 2,
    lifetime: 5,
    piercing: false,
    movementType: "straight",
  },
};
