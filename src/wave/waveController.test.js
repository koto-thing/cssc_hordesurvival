import { describe, expect, it } from "vite-plus/test";
import { WaveController } from "./waveController.js";

function createController({
  waves = [
    {
      startTime: 0,
      duration: 5,
      spawns: [
        {
          enemyId: "slime",
          interval: 2,
          count: 3,
          positionType: "screenEdge",
        },
      ],
    },
  ],
  repeats = false,
  difficultyIncreasePerCycle = 0.1,
} = {}) {
  const spawned = [];
  const remainingTimes = [];
  let completedCount = 0;
  const position = { x: 10, y: 20 };

  const controller = new WaveController({
    waves,
    enemySpawner: {
      spawn(options) {
        spawned.push(options);
      },
    },
    spawnPositionResolver: {
      resolve(positionType, viewport) {
        expect(positionType).toBe("screenEdge");
        expect(viewport).toEqual({ width: 800, height: 600 });
        return position;
      },
    },
    repeats,
    difficultyIncreasePerCycle,
    getViewport: () => ({ width: 800, height: 600 }),
    onTimeChanged: (time) => remainingTimes.push(time),
    onCompleted: () => {
      completedCount += 1;
    },
  });

  return {
    controller,
    spawned,
    remainingTimes,
    getCompletedCount: () => completedCount,
    position,
  };
}

describe("WaveController", () => {
  it("Wave開始直後に最初の敵を生成し、指定間隔で追加する", () => {
    const { controller, spawned, position } = createController();

    controller.tick(0);
    expect(spawned).toEqual([{ enemyId: "slime", position }]);

    controller.tick(1.9);
    expect(spawned).toHaveLength(1);

    controller.tick(0.1);
    expect(spawned).toHaveLength(2);
  });

  it("大きなdeltaTimeでも出現予定の敵を取りこぼさず上限を超えない", () => {
    const { controller, spawned } = createController();

    controller.tick(100);
    controller.tick(100);

    expect(spawned).toHaveLength(3);
  });

  it("時間経過によって次のWaveへ進む", () => {
    const { controller, spawned } = createController({
      waves: [
        {
          startTime: 0,
          duration: 2,
          spawns: [
            {
              enemyId: "slime",
              interval: 2,
              count: 1,
              positionType: "screenEdge",
            },
          ],
        },
        {
          startTime: 2,
          duration: 2,
          spawns: [
            {
              enemyId: "fastSlime",
              interval: 2,
              count: 1,
              positionType: "screenEdge",
            },
          ],
        },
      ],
    });

    controller.tick(0);
    controller.tick(2);

    expect(spawned.map((spawn) => spawn.enemyId)).toEqual(["slime", "fastSlime"]);
  });

  it("残り時間を通知し、全Wave完了を一度だけ通知する", () => {
    const { controller, remainingTimes, getCompletedCount } = createController();

    expect(remainingTimes).toEqual([5]);

    controller.tick(2);
    controller.tick(3);
    controller.tick(1);

    expect(remainingTimes).toEqual([5, 3, 0]);
    expect(getCompletedCount()).toBe(1);
  });

  it("出現間隔が0以下の定義を拒否する", () => {
    expect(() =>
      createController({
        waves: [
          {
            startTime: 0,
            duration: 1,
            spawns: [
              {
                enemyId: "slime",
                interval: 0,
                count: 1,
                positionType: "screenEdge",
              },
            ],
          },
        ],
      }),
    ).toThrow("Enemy spawn interval must be greater than zero");
  });

  it("繰り返し設定では全Wave完了後も次の周回を開始する", () => {
    const { controller, spawned, remainingTimes, getCompletedCount } = createController({
      repeats: true,
    });

    controller.tick(5);

    expect(spawned).toHaveLength(4);
    expect(remainingTimes).toEqual([5, 5]);
    expect(getCompletedCount()).toBe(0);
  });

  it("周回ごとに出現間隔を短縮して敵の数を増やす", () => {
    const { controller, spawned } = createController({
      waves: [
        {
          startTime: 0,
          duration: 4,
          spawns: [
            {
              enemyId: "slime",
              interval: 2,
              count: 2,
              positionType: "screenEdge",
            },
          ],
        },
      ],
      repeats: true,
      difficultyIncreasePerCycle: 0.5,
    });

    controller.tick(7.9);

    expect(spawned).toHaveLength(5);
  });
});
