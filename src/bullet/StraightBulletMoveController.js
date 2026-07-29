import { Component } from "../engine/index.js";

/**
 * 直線的に弾を移動させるコンポーネント
 */
export class StraightBulletMoveController extends Component {
  constructor({ angle, speed }) {
    super();

    this.angle = angle;
    this.speed = speed;
  }

  tick(deltaTime) {
    this.transform.translate(
      Math.cos(this.angle) * this.speed * deltaTime,
      Math.sin(this.angle) * this.speed * deltaTime,
    );
  }
}
