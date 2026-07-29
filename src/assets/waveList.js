export const waveList = [
  // Wave 1
  {
    startTime: 0,
    duration: 30,
    spawns: [
      {
        enemyId: "slime",
        interval: 2,
        count: 15,
        positionType: "screenEdge",
      },
    ],
  },

  // Wave 2
  {
    startTime: 30,
    duration: 30,
    spawns: [
      {
        enemyId: "slime",
        interval: 1,
        count: 30,
        positionType: "screenEdge",
      },
      {
        enemyId: "fastSlime",
        interval: 3,
        count: 30,
        positionType: "screenEdge",
      },
    ],
  },
];
