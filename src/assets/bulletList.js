export const bulletList = {
  normal: {
    imageId: "normalBullet",
    speed: 500,
    damage: 1,
    lifetime: 2,
    piercing: false,
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
};
