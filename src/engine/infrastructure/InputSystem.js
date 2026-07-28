export class InputSystem {
  static #initialized = false;

  static #heldKeys = new Set();
  static #pressedKeys = new Set();
  static #releasedKeys = new Set();

  static #heldMouseButtons = new Set();
  static #pressedMouseButtons = new Set();
  static #releasedMouseButtons = new Set();

  static #mousePosition = {
    x: 0,
    y: 0,
  };

  static #mouseWheelDelta = 0;

  static #canvas = null;

  static #handlers = {};

  /**
   * 初期化
   */
  static initialize(canvas) {
    if (InputSystem.#initialized) {
      console.warn("Inputはすでに初期化されています。");
      return;
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new TypeError("Input.initialize()にはHTMLCanvasElementを渡してください。");
    }

    InputSystem.#canvas = canvas;

    InputSystem.#handlers.keyDown = (event) => {
      const code = event.code;

      if (!InputSystem.#heldKeys.has(code)) {
        InputSystem.#pressedKeys.add(code);
      }

      InputSystem.#heldKeys.add(code);
    };

    InputSystem.#handlers.keyUp = (event) => {
      const code = event.code;

      InputSystem.#heldKeys.delete(code);
      InputSystem.#releasedKeys.add(code);
    };

    InputSystem.#handlers.mouseDown = (event) => {
      const button = event.button;

      if (!InputSystem.#heldMouseButtons.has(button)) {
        InputSystem.#pressedMouseButtons.add(button);
      }

      InputSystem.#heldMouseButtons.add(button);
      InputSystem.#updateMousePosition(event);
    };

    InputSystem.#handlers.mouseUp = (event) => {
      const button = event.button;

      InputSystem.#heldMouseButtons.delete(button);
      InputSystem.#releasedMouseButtons.add(button);
      InputSystem.#updateMousePosition(event);
    };

    InputSystem.#handlers.mouseMove = (event) => {
      InputSystem.#updateMousePosition(event);
    };

    InputSystem.#handlers.wheel = (event) => {
      InputSystem.#mouseWheelDelta += event.deltaY;
    };

    InputSystem.#handlers.blur = () => {
      InputSystem.#resetAllInputs();
    };

    InputSystem.#handlers.contextMenu = (event) => {
      event.preventDefault();
    };

    window.addEventListener("keydown", InputSystem.#handlers.keyDown);
    window.addEventListener("keyup", InputSystem.#handlers.keyUp);

    window.addEventListener("mouseup", InputSystem.#handlers.mouseUp);
    window.addEventListener("blur", InputSystem.#handlers.blur);

    canvas.addEventListener("mousedown", InputSystem.#handlers.mouseDown);
    canvas.addEventListener("mousemove", InputSystem.#handlers.mouseMove);
    canvas.addEventListener("wheel", InputSystem.#handlers.wheel, {
      passive: true,
    });

    canvas.addEventListener("contextmenu", InputSystem.#handlers.contextMenu);

    InputSystem.#initialized = true;
  }

  static tick() {
    if (!InputSystem.#initialized) {
      throw new Error("Please call InputSystem.initialize() first.");
    }
  }

  static lateTick() {
    if (!InputSystem.#initialized) {
      return;
    }

    InputSystem.#pressedKeys.clear();
    InputSystem.#releasedKeys.clear();

    InputSystem.#pressedMouseButtons.clear();
    InputSystem.#releasedMouseButtons.clear();

    InputSystem.#mouseWheelDelta = 0;
  }

  /**
   * キーに何かしらのアクションがあるかどうかをチェックする
   * @param code キーコード
   * @returns {boolean} アクションがあるかどうか
   */
  static getKey(code) {
    return InputSystem.#heldKeys.has(code);
  }

  /**
   * キーが押されているかどうかをチェックする
   * @param code キーコード
   * @returns {boolean} 押されているかどうか
   */
  static getKeyDown(code) {
    return InputSystem.#pressedKeys.has(code);
  }

  /**
   * キーが離されたどうかをチェックする
   * @param code キーコード
   * @returns {boolean} 離されたかどうか
   */
  static getKeyUp(code) {
    return InputSystem.#releasedKeys.has(code);
  }

  /**
   * マウスボタンに何かアクションがあるかどうかをチェックする
   * @param button マウスボタンの種類
   * @returns {boolean} アクションがあるかどうか
   */
  static getMouseButton(button) {
    return InputSystem.#heldMouseButtons.has(button);
  }

  /**
   * マウスボタンが押されているかどうかをチェックする
   * @param button マウスボタンの種類
   * @returns {boolean} 押されているかどうか
   */
  static getMouseButtonDown(button) {
    return InputSystem.#pressedMouseButtons.has(button);
  }

  /**
   * マウスボタンが離されたかどうかをチェックする
   * @param button マウスボタンの種類
   * @returns {boolean} 離されたかどうか
   */
  static getMouseButtonUp(button) {
    return InputSystem.#releasedMouseButtons.has(button);
  }

  /**
   * マウスカーソルの位置を取得する
   * @returns {{x: number, y: number}} マウスカーソルの(x, y)座標
   */
  static get mousePosition() {
    return {
      x: InputSystem.#mousePosition.x,
      y: InputSystem.#mousePosition.y,
    };
  }

  /**
   * マウスカーソルのX座標を取得する
   * @returns {number} マウスカーソルのx座標
   */
  static get mouseX() {
    return InputSystem.#mousePosition.x;
  }

  /**
   * マウスカーソルのY座標を取得する
   * @returns {number} マウスカーソルのy座標
   */
  static get mouseY() {
    return InputSystem.#mousePosition.y;
  }

  /**
   * マウスホイールの運動差分を取得する
   * @returns {number} マウスホイールの運動差分
   */
  static get mouseWheelDelta() {
    return InputSystem.#mouseWheelDelta;
  }

  /**
   * 廃棄時に呼び出される
   */
  static dispose() {
    if (!InputSystem.#initialized) {
      return;
    }

    window.removeEventListener("keydown", InputSystem.#handlers.keyDown);

    window.removeEventListener("keyup", InputSystem.#handlers.keyUp);

    window.removeEventListener("mouseup", InputSystem.#handlers.mouseUp);

    window.removeEventListener("blur", InputSystem.#handlers.blur);

    InputSystem.#canvas.removeEventListener("mousedown", InputSystem.#handlers.mouseDown);

    InputSystem.#canvas.removeEventListener("mousemove", InputSystem.#handlers.mouseMove);

    InputSystem.#canvas.removeEventListener("wheel", InputSystem.#handlers.wheel);

    InputSystem.#canvas.removeEventListener("contextmenu", InputSystem.#handlers.contextMenu);

    InputSystem.#resetAllInputs();

    InputSystem.#canvas = null;
    InputSystem.#handlers = {};
    InputSystem.#initialized = false;
  }

  /**
   * マウスカーソル位置のアップデートイベント
   * @param event
   */
  static #updateMousePosition(event) {
    const rect = InputSystem.#canvas.getBoundingClientRect();

    const scaleX = InputSystem.#canvas.width / rect.width;
    const scaleY = InputSystem.#canvas.height / rect.height;

    InputSystem.#mousePosition.x = (event.clientX - rect.left) * scaleX;

    InputSystem.#mousePosition.y = (event.clientY - rect.top) * scaleY;
  }

  /**
   * すべての入力をリセット
   */
  static #resetAllInputs() {
    InputSystem.#heldKeys.clear();
    InputSystem.#pressedKeys.clear();
    InputSystem.#releasedKeys.clear();

    InputSystem.#heldMouseButtons.clear();
    InputSystem.#pressedMouseButtons.clear();
    InputSystem.#releasedMouseButtons.clear();

    InputSystem.#mouseWheelDelta = 0;
  }
}
