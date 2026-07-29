import { Component } from "./Component.js";
import { VFXShader } from "../infrastructure/VFXShader.js";
import * as MathUtil from "../math/MathUtils.js";

const DEFAULT_OPTIONS = Object.freeze({
  maxParticles: 256,
  emissionRate: 30,
  startLifetime: 1,
  startSpeed: 80,
  startSize: 12,
  endSize: 0,
  startAlpha: 1,
  endAlpha: 0,
  startColor: "#ffffff",
  emissionAngle: [0, 360],
  emissionRadius: 0,
  gravity: { x: 0, y: 0 },
  bounds: { x: -256, y: -256, width: 512, height: 512 },
  blendMode: "lighter",
  autoPlay: true,
  random: Math.random,
});

/**
 * パーティクルの生成・更新・描画と、VFX全体へのShader適用を管理するコンポーネント
 */
export class VFXComponent extends Component {
  /**
   * @param {{
   *   maxParticles?: number,
   *   emissionRate?: number,
   *   startLifetime?: number|number[],
   *   startSpeed?: number|number[],
   *   startSize?: number|number[],
   *   endSize?: number|number[]|null,
   *   startAlpha?: number,
   *   endAlpha?: number,
   *   startColor?: string,
   *   emissionAngle?: number[],
   *   emissionRadius?: number|number[],
   *   gravity?: {x?: number, y?: number},
   *   bounds?: {x: number, y: number, width: number, height: number},
   *   blendMode?: string|null,
   *   shader?: VFXShader|object|null,
   *   autoPlay?: boolean,
   *   random?: function
   * }} options
   */
  constructor(options = {}) {
    super();

    const settings = { ...DEFAULT_OPTIONS, ...options };
    this.maxParticles = Math.max(0, Math.floor(settings.maxParticles));
    this.emissionRate = Math.max(0, settings.emissionRate);
    this.startLifetime = settings.startLifetime;
    this.startSpeed = settings.startSpeed;
    this.startSize = settings.startSize;
    this.endSize = settings.endSize;
    this.startAlpha = settings.startAlpha;
    this.endAlpha = settings.endAlpha;
    this.startColor = settings.startColor;
    this.emissionAngle = settings.emissionAngle;
    this.emissionRadius = settings.emissionRadius;
    this.gravity = { ...DEFAULT_OPTIONS.gravity, ...settings.gravity };
    this.bounds = { ...DEFAULT_OPTIONS.bounds, ...settings.bounds };
    this.blendMode = settings.blendMode;
    this.random = settings.random;

    this.shader =
      settings.shader instanceof VFXShader
        ? settings.shader
        : settings.shader
          ? new VFXShader(settings.shader)
          : null;

    this.view = new createjs.Container();
    this.view.compositeOperation = this.blendMode;
    this.particles = [];
    this.playing = settings.autoPlay;
    this._emissionAccumulator = 0;
    this._attached = false;
    this._cacheInitialized = false;
  }

  get particleCount() {
    return this.particles.length;
  }

  initialize() {
    if (this._attached) {
      return;
    }

    if (!this.gameObject?.view?.addChild) {
      throw new Error("VFXComponent requires a GameObject view that can contain display objects");
    }

    this.gameObject.view.addChild(this.view);
    this._attached = true;
  }

  /**
   * 自動生成を開始する
   */
  play() {
    this.playing = true;
  }

  /**
   * 自動生成を停止する。既存パーティクルは寿命まで残る
   */
  stop() {
    this.playing = false;
    this._emissionAccumulator = 0;
  }

  /**
   * 指定数のパーティクルを即座に生成する
   * @param {number} count
   * @returns {number} 実際に生成した数
   */
  emit(count = 1) {
    const amount = Math.min(
      Math.max(0, Math.floor(count)),
      Math.max(0, this.maxParticles - this.particles.length),
    );

    for (let index = 0; index < amount; index += 1) {
      this._spawnParticle();
    }

    return amount;
  }

  /**
   * 全パーティクルを破棄する
   */
  clear() {
    for (const particle of this.particles) {
      particle.view.uncache();
      this.view.removeChild(particle.view);
    }

    this.particles.length = 0;
    this._emissionAccumulator = 0;
    this._updateShaderCache();
  }

  tick(deltaTime) {
    const dt = Math.max(0, Number(deltaTime) || 0);

    if (this.playing && this.emissionRate > 0) {
      this._emissionAccumulator += dt * this.emissionRate;
      const count = Math.floor(this._emissionAccumulator);
      if (count > 0) {
        this._emissionAccumulator -= count;
        this.emit(count);
      }
    }

    for (let index = this.particles.length - 1; index >= 0; index -= 1) {
      const particle = this.particles[index];
      particle.age += dt;

      if (particle.age >= particle.lifetime) {
        particle.view.uncache();
        this.view.removeChild(particle.view);
        this.particles.splice(index, 1);
        continue;
      }

      particle.velocityX += this.gravity.x * dt;
      particle.velocityY += this.gravity.y * dt;
      particle.view.x += particle.velocityX * dt;
      particle.view.y += particle.velocityY * dt;

      const progress = particle.age / particle.lifetime;
      const size = MathUtil.lerp(particle.startSize, particle.endSize, progress);
      particle.view.scaleX = size;
      particle.view.scaleY = size;
      particle.view.alpha = MathUtil.lerp(this.startAlpha, this.endAlpha, progress);
    }

    this.shader?.tick(dt);
    this._updateShaderCache();
  }

  onDestroy() {
    this.clear();
    this.view.uncache();
    this.view.filters = null;
    this.view.parent?.removeChild(this.view);
    this._cacheInitialized = false;
    this._attached = false;
  }

  /**
   * @private
   */
  _spawnParticle() {
    const angle = (sampleRange(this.emissionAngle, this.random) * Math.PI) / 180;
    const radius = sampleRange(this.emissionRadius, this.random);
    const speed = sampleRange(this.startSpeed, this.random);
    const startSize = sampleRange(this.startSize, this.random);
    const endSize =
      this.endSize === null || this.endSize === undefined
        ? startSize
        : sampleRange(this.endSize, this.random);
    const lifetime = Math.max(0.0001, sampleRange(this.startLifetime, this.random));

    const view = new createjs.Shape();
    view.graphics.beginFill(this.startColor).drawCircle(0, 0, 0.5);
    view.cache(-0.5, -0.5, 1, 1, 32); // StageGLはベクターを直接描けないぽい、単位円を高解像度で一度だけキャッシュ
    view.x = Math.cos(angle) * radius;
    view.y = Math.sin(angle) * radius;
    view.scaleX = startSize;
    view.scaleY = startSize;
    view.alpha = this.startAlpha;

    this.view.addChild(view);
    this.particles.push({
      view,
      age: 0,
      lifetime,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      startSize,
      endSize,
    });
  }

  /**
   * Shader使用時はVFX全体をStageGLのRenderTextureへ描き、Filterを適用する
   * Stageへ追加される前はキャッシュを遅延する
   * @private
   */
  _updateShaderCache() {
    if (!this.shader) {
      return;
    }

    if (!this._cacheInitialized) {
      const stage = this.view.getStage?.();
      if (!stage || !(stage instanceof createjs.StageGL)) {
        return;
      }

      this.view.filters = [this.shader];
      this.view.cache(
        this.bounds.x,
        this.bounds.y,
        Math.max(1, this.bounds.width),
        Math.max(1, this.bounds.height),
        1,
        { useGL: "stage" },
      );

      this._cacheInitialized = true;

      return;
    }

    this.view.updateCache();
  }
}

/**
 * サンプル値が配列の場合は範囲内のランダム値を返す。単一値の場合はそのまま返す
 * @param value {number|number[]} 単一値または範囲を表す配列
 * @param random {function} 乱数生成関数
 * @returns {number} 単一値または範囲内のランダム値
 */
function sampleRange(value, random) {
  if (!Array.isArray(value)) {
    return Number(value) || 0;
  }

  const min = Number(value[0]) || 0;
  const max = value.length > 1 ? Number(value[1]) || 0 : min;
  return min + (max - min) * random();
}
