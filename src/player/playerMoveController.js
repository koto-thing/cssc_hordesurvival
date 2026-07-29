import { Component, KeyCode, InputSystem } from "../engine/index.js";

const DEFAULT_MOVE_SPEED = 200;

/**
 * 入力に応じてゲームオブジェクトを移動するコンポーネント
 */
export class PlayerMoveController extends Component {
  /**
   * @param options
   * @param options.moveSpeed 1秒あたりの移動量
   * @param options.inputSystem 入力取得に使用するシステム
   */
  constructor({ moveSpeed = DEFAULT_MOVE_SPEED, inputSystem = InputSystem } = {}) {
    super();

    this.moveSpeed = moveSpeed;
    this.inputSystem = inputSystem;
    this.velocityX = 0;
    this.velocityY = 0;
  }

  /**
   * 現在の入力をTransformへ反映する
   * @param deltaTime {number} 前フレームからの経過時間
   */
  tick(deltaTime) {
    const horizontal =
      Number(this.#isHeld(KeyCode.D, KeyCode.ArrowRight)) -
      Number(this.#isHeld(KeyCode.A, KeyCode.ArrowLeft));
    const vertical =
      Number(this.#isHeld(KeyCode.S, KeyCode.ArrowDown)) -
      Number(this.#isHeld(KeyCode.W, KeyCode.ArrowUp));

    this.velocityX = 0;
    this.velocityY = 0;
    if (horizontal === 0 && vertical === 0) {
      return;
    }

    // 斜め移動でも速度が速くならないよう入力ベクトルを正規化
    const length = Math.hypot(horizontal, vertical);
    this.velocityX = (horizontal / length) * this.moveSpeed;
    this.velocityY = (vertical / length) * this.moveSpeed;
    this.transform.translate(
      this.velocityX * Math.max(0, deltaTime),
      this.velocityY * Math.max(0, deltaTime),
    );
  }

  /**
   * 指定したいずれかのキーが押されているか確認する
   * @param primary {string} 主入力
   * @param alternate {string} 代替入力
   * @returns {boolean}
   */
  #isHeld(primary, alternate) {
    return this.inputSystem.getKey(primary) || this.inputSystem.getKey(alternate);
  }
}
