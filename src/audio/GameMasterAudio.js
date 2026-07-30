const DEFAULT_LIMITER = Object.freeze({
  ceilingDbtp: -1,
  lookaheadMs: 5,
  releaseMs: 100,
});

/**
 * Connects the game's CreateJS master output to loudness analysis and limiting
 */
export class GameMasterAudio {
  /**
   * @param options
   * @param options.sound CreateJS Sound API
   * @param options.createMeterNode Loudness meter node factory
   */
  constructor({ sound = createjs.Sound, createMeterNode = createDefaultMeterNode } = {}) {
    this.sound = sound;
    this.createMeterNode = createMeterNode;
    this.meterNode = null;
    this.masterGainNode = null;
    this.outputNode = null;
  }

  /**
   * Inserts the loudness processor after CreateJS master gain
   * @returns {Promise<GameMasterAudio>}
   */
  async initialize() {
    if (this.meterNode !== null) {
      return this;
    }

    const plugin = this.sound?.activePlugin;
    assertWebAudioPlugin(plugin);

    const meterNode = await this.createMeterNode(plugin.context, {
      channelLayout: "stereo",
      analysisEnabled: true,
      limiterEnabled: true,
      limiter: DEFAULT_LIMITER,
    });

    try {
      // Preserve CreateJS volume control while processing the complete master mix
      plugin.gainNode.disconnect(plugin.dynamicsCompressorNode);
      plugin.gainNode.connect(meterNode);
      meterNode.connect(plugin.dynamicsCompressorNode);
    } catch (error) {
      // Restore the original graph if inserting either connection fails
      plugin.gainNode.disconnect();
      plugin.gainNode.connect(plugin.dynamicsCompressorNode);
      meterNode.destroy();
      throw error;
    }

    this.meterNode = meterNode;
    this.masterGainNode = plugin.gainNode;
    this.outputNode = plugin.dynamicsCompressorNode;
    return this;
  }

  /**
   * Returns the most recent measurement emitted by the processor
   */
  get latestMeasurement() {
    return this.meterNode?.latestMeasurement ?? null;
  }

  /**
   * Removes the processor and restores the original CreateJS graph
   */
  destroy() {
    if (this.meterNode === null) {
      return;
    }

    this.masterGainNode.disconnect(this.meterNode);
    this.meterNode.disconnect(this.outputNode);
    this.masterGainNode.connect(this.outputNode);
    this.meterNode.destroy();
    this.meterNode = null;
    this.masterGainNode = null;
    this.outputNode = null;
  }
}

/**
 * Creates the Web Audio adapter lazily so non-Web-Audio test environments can load this module
 * @param {AudioContext} context
 * @param {import("@loudness-meter/web").LoudnessMeterNodeOptions} options
 */
async function createDefaultMeterNode(context, options) {
  const { LoudnessMeterNode } = await import("@loudness-meter/web");
  const processorModuleUrl = new URL(
    `${import.meta.env.BASE_URL}loudness-meter/loudness-meter-processor.js`,
    globalThis.location.origin,
  );
  return LoudnessMeterNode.create(context, { ...options, processorModuleUrl });
}

/**
 * Ensures CreateJS selected the WebAudioPlugin required for graph access
 * @param plugin CreateJS active sound plugin
 */
function assertWebAudioPlugin(plugin) {
  if (
    plugin?.context === undefined ||
    plugin?.gainNode === undefined ||
    plugin?.dynamicsCompressorNode === undefined
  ) {
    throw new Error("CreateJS WebAudioPlugin is required for master loudness processing");
  }
}
