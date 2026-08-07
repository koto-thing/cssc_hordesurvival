import { Component } from "../engine/index.js";

/**
 * 進行方向に対して左右へ波打ちながら弾を移動させるコンポーネント
 */
export class WaveBulletMoveController extends Component {
  constructor({ angle, speed, amplitude = 0, frequency = 0 }) {
    super();

    this.angle = angle;
    this.speed = speed;
    this.amplitude = amplitude;
    this.frequency = frequency;
    this.elapsedTime = 0;
  }

  /**
   * 弾を進行方向に対して左右へ波打ちながら移動させる
   * @param deltaTime
   */
  tick(deltaTime) {
    const previousOffset = Math.sin(this.elapsedTime * this.frequency) * this.amplitude;
    this.elapsedTime += deltaTime;
    const currentOffset = Math.sin(this.elapsedTime * this.frequency) * this.amplitude;
    const lateralDistance = currentOffset - previousOffset;
    const forwardDistance = this.speed * deltaTime;

    this.transform.translate(
      Math.cos(this.angle) * forwardDistance - Math.sin(this.angle) * lateralDistance,
      Math.sin(this.angle) * forwardDistance + Math.cos(this.angle) * lateralDistance,
    );
  }
}
