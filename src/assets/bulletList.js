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
