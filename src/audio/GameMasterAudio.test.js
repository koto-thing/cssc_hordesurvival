import { describe, expect, it, vi } from "vite-plus/test";
import { GameMasterAudio } from "./GameMasterAudio.js";

function createAudioGraph() {
  const outputNode = {};
  const masterGainNode = {
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
  const meterNode = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    destroy: vi.fn(),
    latestMeasurement: { momentary: { value: -18, validity: "valid" } },
  };
  const context = { sampleRate: 48_000 };
  const sound = {
    activePlugin: {
      context,
      gainNode: masterGainNode,
      dynamicsCompressorNode: outputNode,
    },
  };

  return { context, masterGainNode, meterNode, outputNode, sound };
}

describe("GameMasterAudio", () => {
  it("inserts an enabled stereo meter and limiter into the CreateJS master output", async () => {
    const graph = createAudioGraph();
    const createMeterNode = vi.fn().mockResolvedValue(graph.meterNode);
    const masterAudio = new GameMasterAudio({ sound: graph.sound, createMeterNode });

    await masterAudio.initialize();

    expect(createMeterNode).toHaveBeenCalledWith(graph.context, {
      channelLayout: "stereo",
      analysisEnabled: true,
      limiterEnabled: true,
      limiter: {
        ceilingDbtp: -1,
        lookaheadMs: 5,
        releaseMs: 100,
      },
    });
    expect(graph.masterGainNode.disconnect).toHaveBeenCalledWith(graph.outputNode);
    expect(graph.masterGainNode.connect).toHaveBeenCalledWith(graph.meterNode);
    expect(graph.meterNode.connect).toHaveBeenCalledWith(graph.outputNode);
    expect(masterAudio.latestMeasurement).toEqual(graph.meterNode.latestMeasurement);
  });

  it("initializes only once", async () => {
    const graph = createAudioGraph();
    const createMeterNode = vi.fn().mockResolvedValue(graph.meterNode);
    const masterAudio = new GameMasterAudio({ sound: graph.sound, createMeterNode });

    await masterAudio.initialize();
    await masterAudio.initialize();

    expect(createMeterNode).toHaveBeenCalledOnce();
  });

  it("restores the CreateJS graph when destroyed", async () => {
    const graph = createAudioGraph();
    const masterAudio = new GameMasterAudio({
      sound: graph.sound,
      createMeterNode: vi.fn().mockResolvedValue(graph.meterNode),
    });
    await masterAudio.initialize();

    masterAudio.destroy();

    expect(graph.masterGainNode.disconnect).toHaveBeenCalledWith(graph.meterNode);
    expect(graph.meterNode.disconnect).toHaveBeenCalledWith(graph.outputNode);
    expect(graph.masterGainNode.connect).toHaveBeenLastCalledWith(graph.outputNode);
    expect(graph.meterNode.destroy).toHaveBeenCalledOnce();
    expect(masterAudio.latestMeasurement).toBeNull();
  });

  it("rejects non-Web-Audio CreateJS plugins", async () => {
    const createMeterNode = vi.fn();
    const masterAudio = new GameMasterAudio({
      sound: { activePlugin: {} },
      createMeterNode,
    });

    await expect(masterAudio.initialize()).rejects.toThrow(
      "CreateJS WebAudioPlugin is required for master loudness processing",
    );
    expect(createMeterNode).not.toHaveBeenCalled();
  });
});
