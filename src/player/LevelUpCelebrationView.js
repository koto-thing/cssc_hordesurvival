import { Text } from "../engine/index.js";

const EFFECT_DURATION = 1.05;
const RING_SIZE = 180;
const SPARK_COUNT = 18;

/**
 * レベルアップ時にプレイヤーの周囲へ表示するワールド演出
 */
export class LevelUpCelebrationView {
  constructor() {
    this.view = new createjs.Container();
    this.rays = new createjs.Shape();
    this.innerRing = createRing("#fff2a8", 4);
    this.outerRing = createRing("#5df4ff", 3);
    this.sparks = [];
    this.elapsed = EFFECT_DURATION;

    this.label = new Text({
      text: "LEVEL UP!",
      width: 240,
      height: 52,
      font: "900 34px sans-serif",
      color: "#fff2a8",
      textAlign: "center",
      verticalAlign: "middle",
      outlineColor: "#1a1714",
      outlineWidth: 2,
    });
    this.label.x = -120;
    this.label.y = -105;

    drawRays(this.rays);
    this.rays.cache(-RING_SIZE, -RING_SIZE, RING_SIZE * 2, RING_SIZE * 2);
    this.#createSparks();
    this.view.addChild(this.rays, this.outerRing, this.innerRing, ...this.sparks, this.label);
    this.view.compositeOperation = "lighter";
    this.view.mouseEnabled = false;
    this.view.visible = false;
  }

  /**
   * 演出を先頭から再生する
   */
  play() {
    this.elapsed = 0;
    this.view.visible = true;
    this.view.alpha = 1;
    this.label.alpha = 0;
    this.label.y = -78;
  }

  /**
   * 演出時間を進める
   * @param deltaTime 前フレームからの経過時間
   */
  tick(deltaTime) {
    if (!this.view.visible) {
      return;
    }

    // 経過時間を加算して演出の進行度を計算する
    this.elapsed = Math.min(EFFECT_DURATION, this.elapsed + Math.max(0, Number(deltaTime) || 0));
    const progress = this.elapsed / EFFECT_DURATION;
    const burst = easeOutCubic(Math.min(1, progress * 2.4));
    const fade = 1 - easeInCubic(Math.max(0, (progress - 0.68) / 0.32));

    // 演出の各要素を進行度に応じて変化させる
    this.rays.rotation = progress * 38;
    this.rays.scaleX = this.rays.scaleY = 0.25 + burst * 0.95;
    this.rays.alpha = fade * (1 - progress * 0.35);
    this.innerRing.scaleX = this.innerRing.scaleY = 0.25 + burst * 0.65;
    this.outerRing.scaleX = this.outerRing.scaleY = 0.15 + burst * 1.15;
    this.innerRing.alpha = fade;
    this.outerRing.alpha = fade * 0.85;

    // ラベルの表示を進行度に応じて変化させる
    const labelIn = easeOutCubic(Math.min(1, progress / 0.24));
    this.label.y = -78 - labelIn * 42 - Math.max(0, progress - 0.7) * 28;
    this.label.scaleX = this.label.scaleY = 0.72 + labelIn * 0.28;
    this.label.alpha = Math.min(labelIn, fade);

    // スパークの位置・回転・透明度・縦方向の拡大率を進行度に応じて変化させる
    this.sparks.forEach((spark, index) => {
      const angle = (index / SPARK_COUNT) * Math.PI * 2 + progress * 0.35;
      const distance = 28 + burst * (72 + (index % 4) * 11);
      spark.x = Math.cos(angle) * distance;
      spark.y = Math.sin(angle) * distance - progress * 28;
      spark.rotation = (angle * 180) / Math.PI + 90;
      spark.alpha = fade * (0.55 + (index % 3) * 0.2);
      spark.scaleY = 0.7 + burst * 1.4;
    });

    // 演出が終了したら非表示にする
    if (this.elapsed >= EFFECT_DURATION) {
      this.view.visible = false;
    }
  }

  destroy() {
    this.view.removeAllChildren();
    this.view.parent?.removeChild(this.view);
    this.sparks = [];
  }

  /**
   * スパークの表示要素を作成する
   */
  #createSparks() {
    for (let index = 0; index < SPARK_COUNT; index += 1) {
      const spark = new createjs.Shape();
      const color = index % 2 === 0 ? "#fff2a8" : "#5df4ff";
      spark.graphics.beginFill(color).drawRoundRect(-2, -9, 4, 18, 2);
      spark.cache(-3, -10, 6, 20);
      this.sparks.push(spark);
    }
  }
}

/**
 * 0から1の値を勢いよく立ち上がる補間値へ変換する
 */
export function easeOutCubic(value) {
  const ratio = Math.min(1, Math.max(0, Number(value) || 0));
  return 1 - (1 - ratio) ** 3;
}

/**
 * 0から1の値をゆっくり立ち上がる補間値へ変換する
 * @param value 0から1の値
 * @returns {number}
 */
function easeInCubic(value) {
  const ratio = Math.min(1, Math.max(0, Number(value) || 0));
  return ratio ** 3;
}

/**
 * 指定した色と線の太さでリングを作成する
 * @param color 指定色
 * @param thickness 線の太さ
 * @returns {createjs.Shape}
 */
function createRing(color, thickness) {
  const ring = new createjs.Shape();
  ring.graphics
    .setStrokeStyle(thickness)
    .beginStroke(color)
    .drawCircle(0, 0, RING_SIZE / 2);
  ring.cache(-RING_SIZE / 2 - 5, -RING_SIZE / 2 - 5, RING_SIZE + 10, RING_SIZE + 10);
  return ring;
}

/**
 * 指定したShapeに放射状の光線を描画する
 * @param shape 光線を描画するShape
 */
function drawRays(shape) {
  const rayCount = 12;
  for (let index = 0; index < rayCount; index += 1) {
    const angle = (index / rayCount) * Math.PI * 2;
    const inner = 42;
    const outer = index % 2 === 0 ? 145 : 112;
    const width = 0.035;
    shape.graphics
      .beginFill(index % 2 === 0 ? "#fff2a8" : "#5df4ff")
      .moveTo(Math.cos(angle - width) * inner, Math.sin(angle - width) * inner)
      .lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer)
      .lineTo(Math.cos(angle + width) * inner, Math.sin(angle + width) * inner)
      .closePath();
  }
}
