import { Component } from "./Component.js";

/**
 * 横一列の連番画像をフレーム単位で再生するコンポーネント
 */
export class SpriteAnimation extends Component {
  constructor({ clips, initialClip = null } = {}) {
    super();

    if (!clips || Object.keys(clips).length === 0) {
      throw new Error("SpriteAnimation requires at least one clip.");
    }

    this.clips = new Map(
      Object.entries(clips).map(([name, clip]) => [name, normalizeClip(name, clip)]),
    );
    this.sprite = new createjs.Bitmap(null);
    this.currentClipName = null;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.playing = false;
    this.onComplete = null;

    if (initialClip !== null) {
      this.play(initialClip);
    }
  }

  /**
   * 指定したクリップを先頭から再生する
   * @param name クリップ名
   * @param options 再生オプション
   * @param options.onComplete 単発再生の完了時に呼び出す処理
   */
  play(name, { onComplete = null } = {}) {
    const clip = this.clips.get(name);
    if (!clip) {
      throw new Error(`Unknown animation clip: "${name}"`);
    }

    this.currentClipName = name;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.playing = true;
    this.onComplete = onComplete;
    this.#applyFrame(clip);
  }

  /**
   * 現在のクリップを経過時間に応じて進める
   * @param deltaTime 前フレームからの経過秒数
   */
  tick(deltaTime) {
    if (!this.playing || deltaTime <= 0) {
      return;
    }

    const clip = this.clips.get(this.currentClipName);
    const frameDuration = 1 / clip.frameRate;
    this.elapsedTime += deltaTime;

    while (this.elapsedTime >= frameDuration && this.playing) {
      this.elapsedTime -= frameDuration;
      this.#advanceFrame(clip);
    }
  }

  /**
   * 次のフレームへ進める
   * @param clip 現在のクリップ
   */
  #advanceFrame(clip) {
    if (this.currentFrame < clip.frameCount - 1) {
      this.currentFrame += 1;
      this.#applyFrame(clip);
      return;
    }

    if (clip.loop) {
      this.currentFrame = 0;
      this.#applyFrame(clip);
      return;
    }

    this.playing = false;
    const completion = this.onComplete;
    this.onComplete = null;
    completion?.();
  }

  /**
   * 現在フレームの切り抜き範囲をBitmapへ反映する
   * @param clip 現在のクリップ
   */
  #applyFrame(clip) {
    this.sprite.image = clip.image;
    this.sprite.sourceRect = new createjs.Rectangle(
      this.currentFrame * clip.frameWidth,
      0,
      clip.frameWidth,
      clip.frameHeight,
    );
    this.sprite.regX = clip.frameWidth / 2;
    this.sprite.regY = clip.frameHeight / 2;
  }
}

/**
 * クリップ定義を検証して正規化する
 * @param name クリップ名
 * @param clip クリップ定義
 */
function normalizeClip(name, clip) {
  const frameWidth = clip?.frameWidth;
  const frameHeight = clip?.frameHeight;
  const imageWidth = clip?.image?.naturalWidth ?? clip?.image?.width ?? 0;

  if (
    !clip?.image ||
    !Number.isInteger(frameWidth) ||
    frameWidth <= 0 ||
    !Number.isInteger(frameHeight) ||
    frameHeight <= 0
  ) {
    throw new Error(`Animation clip "${name}" requires an image and positive frame size.`);
  }

  const frameCount = clip.frameCount ?? imageWidth / frameWidth;
  if (!Number.isInteger(frameCount) || frameCount <= 0) {
    throw new Error(`Animation clip "${name}" has an invalid frame count.`);
  }

  const frameRate = clip.frameRate ?? 10;
  if (!Number.isFinite(frameRate) || frameRate <= 0) {
    throw new Error(`Animation clip "${name}" has an invalid frame rate.`);
  }

  return {
    image: clip.image,
    frameWidth,
    frameHeight,
    frameCount,
    frameRate,
    loop: clip.loop ?? true,
  };
}
