/**
 * 敵の種類とそのパラメータを定義するオブジェクト
 * @type {{slime: {animation: {initialClip: string, clips: {run: {imageId: string, frameWidth: number, frameHeight: number, frameRate: number, loop: boolean}, die: {imageId: string, frameWidth: number, frameHeight: number, frameRate: number, loop: boolean}}}, hp: number, speed: number, attack: number, experience: number, score: number, movementType: string}, fastSlime: {imageId: string, hp: number, speed: number, attack: number, experience: number, score: number, movementType: string}, shooterSlime: {imageId: string, fallbackColor: string, hp: number, speed: number, attack: number, experience: number, score: number, movementType: string, shooting: {bulletId: string, bulletSpeed: number, interval: number, aimType: string}}, predictiveShooterSlime: {imageId: string, fallbackColor: string, hp: number, speed: number, attack: number, experience: number, score: number, movementType: string, shooting: {bulletId: string, bulletSpeed: number, interval: number, aimType: string}}}}
 */
export const enemyList = {
  slime: {
    animation: {
      initialClip: "run",
      clips: {
        run: {
          imageId: "slimeRun",
          frameWidth: 32,
          frameHeight: 32,
          frameRate: 10,
          loop: true,
        },
        die: {
          imageId: "slimeDie",
          frameWidth: 32,
          frameHeight: 32,
          frameRate: 10,
          loop: false,
        },
      },
    },
    hp: 10,
    speed: 80,
    attack: 1,
    experience: 10,
    score: 100,
    movementType: "chase",
  },

  fastSlime: {
    imageId: "fastSlime",
    hp: 5,
    speed: 150,
    attack: 1,
    experience: 15,
    score: 150,
    movementType: "chase",
  },

  shooterSlime: {
    imageId: "shooterSlime",
    fallbackColor: "#ff9f43",
    hp: 15,
    speed: 50,
    attack: 1,
    experience: 20,
    score: 250,
    movementType: "chase",
    shooting: {
      bulletId: "enemyNormal",
      bulletSpeed: 220,
      interval: 2,
      aimType: "direct",
    },
  },

  predictiveShooterSlime: {
    imageId: "predictiveShooterSlime",
    fallbackColor: "#9b59ff",
    hp: 30,
    speed: 65,
    attack: 2,
    experience: 40,
    score: 500,
    movementType: "chase",
    shooting: {
      bulletId: "enemyPredictive",
      bulletSpeed: 260,
      interval: 1.5,
      aimType: "predictive",
    },
  },
};
