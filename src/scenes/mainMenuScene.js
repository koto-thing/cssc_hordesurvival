import { characterList } from "../assets/characterList.js";
import { stageList } from "../assets/stageList.js";
import { UI_BUTTON_COLORS, UI_THEME } from "../assets/uiTheme.js";
import { Button, notifyUIInteraction, Scene, Text } from "../engine/index.js";
import { TitleSelectionController } from "../titleScene/TitleSelectionController.js";

const CONTENT_WIDTH = 1200;
const CONTENT_HEIGHT = 600;
const VIEWPORT_MARGIN = 24;
const BACK_BUTTON_MARGIN = 20;
const START_BUTTON_MARGIN = 24;
const CHARACTER_SIZE = 128;
const CHARACTER_GAP = 32;
const NOTIFICATION_DURATION = 2.5;
const START_BUTTON_ENABLED_COLORS = UI_BUTTON_COLORS.primary;
const START_BUTTON_DISABLED_COLORS = UI_BUTTON_COLORS.disabled;

/**
 * 表示領域内へメインメニュー全体を収める配置を計算する
 * @param width 表示領域の幅
 * @param height 表示領域の高さ
 * @returns {{scale: number, x: number, y: number}}
 */
export function calculateMainMenuLayout(width, height) {
  const availableWidth = Math.max(1, width - VIEWPORT_MARGIN * 2);
  const availableHeight = Math.max(1, height - VIEWPORT_MARGIN * 2);
  const scale = Math.min(1, availableWidth / CONTENT_WIDTH, availableHeight / CONTENT_HEIGHT);

  return {
    scale,
    x: (width - CONTENT_WIDTH * scale) / 2,
    y: (height - CONTENT_HEIGHT * scale) / 2,
  };
}

/**
 * 画面端へ固定する操作ボタンの配置を計算する
 * @param width 表示領域の幅
 * @param height 表示領域の高さ
 * @param startButtonWidth ゲーム開始ボタンの幅
 * @param startButtonHeight ゲーム開始ボタンの高さ
 * @returns {{back: {x: number, y: number}, start: {x: number, y: number}}}
 */
export function calculateCornerControlLayout(width, height, startButtonWidth, startButtonHeight) {
  return {
    back: {
      x: BACK_BUTTON_MARGIN,
      y: BACK_BUTTON_MARGIN,
    },
    start: {
      x: Math.max(0, width - startButtonWidth - START_BUTTON_MARGIN),
      y: Math.max(0, height - startButtonHeight - START_BUTTON_MARGIN),
    },
  };
}

/**
 * キャラクターとステージを選択してゲームを開始するメインメニュー
 */
export class MainMenuScene extends Scene {
  constructor({ sceneManager, gameSetup }) {
    super();

    this.sceneManager = sceneManager;
    this.gameSetup = gameSetup;
    this.background = null;
    this.content = null;
    this.notification = null;
    this.notificationRemaining = 0;
    this.characterCards = new Map();
    this.characterDescription = null;
    this.stageButtons = new Map();
    this.operationGuide = null;
    this.backButton = null;
    this.startButton = null;
    this.selectionController = new TitleSelectionController({
      onSelectionChanged: (selection) => this.#updateSelection(selection),
      onValidationFailed: (message) => this.#showNotification(message),
    });
  }

  /**
   * 選択画面を生成する
   */
  initialize() {
    this.background = new createjs.Shape();
    this.content = new createjs.Container();

    // タイトル文字列を生成する
    const title = new Text({
      text: "SIMPLE HORDE SURVIVAL",
      width: CONTENT_WIDTH,
      height: 54,
      font: "700 36px sans-serif",
      color: UI_THEME.text,
      textAlign: "center",
      verticalAlign: "middle",
    });
    title.y = 4;

    // キャラクター選択とステージ選択の間に仕切り線を生成する
    const divider = new createjs.Shape();
    divider.graphics.beginFill(UI_THEME.border).drawRect(CONTENT_WIDTH / 2 - 1, 88, 2, 412);
    divider.cache(CONTENT_WIDTH / 2 - 1, 88, 2, 412);

    // キャラクター選択UI、ステージ選択UI、操作説明、戻るボタン、ゲーム開始ボタン、通知UIを生成する
    this.#createCharacterSelection();
    this.#createStageSelection();
    this.#createOperationGuide();
    this.#createBackButton();
    this.#createStartButton();
    this.#createNotification();

    // タイトル文字列と仕切り線をコンテンツの最前面に配置する
    this.content.addChildAt(title, divider, 0);
    this.root.addChild(this.background, this.content, this.backButton, this.startButton);
    this.layout();
  }

  /**
   * 通知の表示時間を更新する
   * @param deltaTime 経過時間
   */
  tick(deltaTime) {
    // 通知が表示されていない場合は何もしない
    if (this.notificationRemaining <= 0) {
      return;
    }

    // 経過時間を減算して残り時間を更新する
    this.notificationRemaining = Math.max(0, this.notificationRemaining - deltaTime);
    if (this.notificationRemaining === 0) {
      this.notification.visible = false;
    }
  }

  /**
   * 表示領域の変更を反映する
   */
  resize(width, height) {
    super.resize(width, height);
    this.layout();
  }

  /**
   * 背景と選択UIを表示領域へ配置する
   */
  layout() {
    // 背景が生成されていない場合は何もしない
    if (this.background === null) {
      return;
    }

    // 背景を描画してキャッシュする
    this.background.graphics
      .clear()
      .beginFill(UI_THEME.background)
      .drawRect(0, 0, this.width, this.height);
    this.background.cache(0, 0, this.width, this.height);

    // 選択UIを表示領域へ収めるように縮小して配置する
    const contentLayout = calculateMainMenuLayout(this.width, this.height);
    this.content.scaleX = contentLayout.scale;
    this.content.scaleY = contentLayout.scale;
    this.content.x = contentLayout.x;
    this.content.y = contentLayout.y;

    // 画面端へ固定する操作ボタンを配置する
    const controlLayout = calculateCornerControlLayout(
      this.width,
      this.height,
      this.startButton.uiWidth,
      this.startButton.uiHeight,
    );
    this.backButton.x = controlLayout.back.x;
    this.backButton.y = controlLayout.back.y;
    this.startButton.x = controlLayout.start.x;
    this.startButton.y = controlLayout.start.y;
  }

  /**
   * キャラクター選択UIを生成する
   */
  #createCharacterSelection() {
    // キャラクター選択の見出しを生成する
    const heading = createHeading("キャラクター選択");
    heading.x = 24;
    heading.y = 88;
    this.content.addChild(heading);

    // キャラクターカードの配置開始位置を計算する
    const startX = 28;

    // キャラクターカードを生成して配置する
    characterList.forEach((character, index) => {
      const card = createCharacterCard(character);
      card.view.x = startX + index * (CHARACTER_SIZE + CHARACTER_GAP);
      card.view.y = 164;
      card.view.on("click", () => {
        notifyUIInteraction();
        this.selectionController.selectCharacter(character.id);
      });
      card.setSelected(false);
      this.characterCards.set(character.id, card);
      this.content.addChild(card.view);
    });

    // キャラクター性能の説明文を生成する
    this.characterDescription = new Text({
      text: "キャラクターを選択すると性能が表示されます",
      width: 500,
      height: 144,
      font: "600 22px sans-serif",
      color: UI_THEME.textMuted,
      textAlign: "center",
      verticalAlign: "middle",
      lineHeight: 28,
    });
    this.characterDescription.x = 28;
    this.characterDescription.y = 350;
    this.content.addChild(this.characterDescription);
  }

  /**
   * ステージ選択UIを生成する
   */
  #createStageSelection() {
    // ステージ選択の見出しを生成する
    const heading = createHeading("ステージ選択");
    heading.x = CONTENT_WIDTH - 484;
    heading.y = 88;
    this.content.addChild(heading);

    // ステージ選択ボタンを生成して配置する
    stageList.forEach((stage, index) => {
      const button = new Button({
        text: stage.name,
        width: 360,
        height: 58,
        font: "600 24px sans-serif",
        normalColor: UI_BUTTON_COLORS.secondary.normal,
        hoverColor: UI_BUTTON_COLORS.secondary.hover,
        pressedColor: UI_BUTTON_COLORS.secondary.pressed,
      });
      button.x = CONTENT_WIDTH - button.uiWidth - 42;
      button.y = 158 + index * 72;
      button.onClick(() => this.selectionController.selectStage(stage.id));
      this.stageButtons.set(stage.id, button);
      this.content.addChild(button);
    });
  }

  /**
   * ゲーム中の操作説明を生成する
   */
  #createOperationGuide() {
    this.operationGuide = new Text({
      text: "操作方法　移動：WASD / 矢印キー　　攻撃：自動",
      width: 760,
      height: 36,
      font: "600 20px sans-serif",
      color: UI_THEME.textMuted,
      textAlign: "center",
      verticalAlign: "middle",
    });
    this.operationGuide.x = (CONTENT_WIDTH - this.operationGuide.uiWidth) / 2;
    this.operationGuide.y = 548;
    this.content.addChild(this.operationGuide);
  }

  /**
   * ゲーム開始ボタンを生成する
   */
  #createStartButton() {
    this.startButton = new Button({
      text: "ゲーム開始",
      width: 240,
      height: 64,
      font: "700 26px sans-serif",
      normalColor: START_BUTTON_DISABLED_COLORS.normal,
      hoverColor: START_BUTTON_DISABLED_COLORS.hover,
      pressedColor: START_BUTTON_DISABLED_COLORS.pressed,
    });
    this.startButton.onClick(() => this.#requestStart());
  }

  /**
   * タイトル画面へ戻るボタンを生成する
   */
  #createBackButton() {
    this.backButton = new Button({
      text: "←",
      width: 72,
      height: 72,
      font: "40px sans-serif",
      normalColor: UI_BUTTON_COLORS.secondary.normal,
      hoverColor: UI_BUTTON_COLORS.secondary.hover,
      pressedColor: UI_BUTTON_COLORS.secondary.pressed,
    });
    this.backButton.onClick(() => this.sceneManager.changeScene("title"));
  }

  /**
   * 画面中央の通知UIを生成する
   */
  #createNotification() {
    this.notification = new Text({
      text: "",
      width: 620,
      height: 58,
      font: "700 23px sans-serif",
      color: UI_THEME.textOnDark,
      textAlign: "center",
      verticalAlign: "middle",
    });
    this.notification.x = (CONTENT_WIDTH - this.notification.uiWidth) / 2;
    this.notification.y = 482;
    this.notification.visible = false;

    // 通知UIの背景を生成する
    const background = new createjs.Shape();
    background.graphics
      .beginFill(UI_THEME.danger)
      .drawRoundRect(0, 0, this.notification.uiWidth, this.notification.uiHeight, 12);
    background.cache(0, 0, this.notification.uiWidth, this.notification.uiHeight);
    background.mouseEnabled = false;
    this.notification.addChildAt(background, 0);
    this.content.addChild(this.notification);
  }

  /**
   * 選択状態を画面へ反映する
   * @param selection 現在の選択
   */
  #updateSelection(selection) {
    // キャラクターカードの選択状態を更新する
    for (const [id, card] of this.characterCards) {
      card.setSelected(id === selection.characterId);
    }

    // 選択されたキャラクターの性能説明を更新する
    const character = characterList.find(({ id }) => id === selection.characterId);
    this.characterDescription.setText(
      character === undefined
        ? "キャラクターを選択すると性能が表示されます"
        : `${character.name}\n${character.description}`,
    );

    // ステージ選択ボタンの色を更新する
    for (const [id, button] of this.stageButtons) {
      const selected = id === selection.stageId;
      button.setColors({
        normal: selected ? UI_THEME.primary : UI_THEME.secondary,
        hover: selected ? UI_THEME.primaryHover : UI_THEME.secondaryHover,
        pressed: selected ? UI_THEME.primaryPressed : UI_THEME.secondaryPressed,
      });
    }

    // ゲーム開始ボタンの色を更新する
    this.startButton.setColors(
      selection.canStart ? START_BUTTON_ENABLED_COLORS : START_BUTTON_DISABLED_COLORS,
    );
    this.notification.visible = false;
    this.notificationRemaining = 0;
  }

  /**
   * 選択内容を検証してゲームを開始する
   */
  #requestStart() {
    // 選択内容が不十分な場合は通知を表示してゲームを開始しない
    if (!this.selectionController.validateStart()) {
      return;
    }

    // 選択内容をゲーム設定へ反映してゲームシーンへ遷移する
    this.gameSetup.characterId = this.selectionController.characterId;
    this.gameSetup.stageId = this.selectionController.stageId;
    this.sceneManager.changeScene("game");
  }

  /**
   * 入力不足の通知を表示する
   * @param message 通知文
   */
  #showNotification(message) {
    this.notification.setText(message);
    this.notification.visible = true;
    this.notificationRemaining = NOTIFICATION_DURATION;
  }
}

/**
 * セクション見出しを生成する
 * @param text 見出し
 * @returns {Text}
 */
function createHeading(text) {
  return new Text({
    text,
    width: 460,
    height: 46,
    font: "700 30px sans-serif",
    color: UI_THEME.text,
    textAlign: "center",
    verticalAlign: "middle",
  });
}

/**
 * 色付き四角形のキャラクターカードを生成する
 * @param character キャラクター定義
 * @returns {{view: createjs.Container, setSelected: function(boolean): void}}
 */
function createCharacterCard(character) {
  // キャラクターカードのコンテナ、枠線、キャラクター画像、名前ラベルを生成する
  const view = new createjs.Container();
  const border = new createjs.Shape();
  const portrait = new createjs.Shape();
  const label = new Text({
    text: character.name,
    width: CHARACTER_SIZE,
    height: 40,
    font: "600 20px sans-serif",
    color: UI_THEME.text,
    textAlign: "center",
    verticalAlign: "middle",
  });
  label.y = CHARACTER_SIZE + 12;

  // キャラクターカードの枠線を描画してキャッシュする
  portrait.graphics
    .beginFill(character.color)
    .drawRoundRect(0, 0, CHARACTER_SIZE, CHARACTER_SIZE, 8);
  portrait.cache(0, 0, CHARACTER_SIZE, CHARACTER_SIZE);
  portrait.mouseEnabled = false;
  border.mouseEnabled = false;

  // キャラクターカードのヒットエリアを設定する
  const hitArea = new createjs.Shape();
  hitArea.graphics.beginFill("#000000").drawRect(0, 0, CHARACTER_SIZE, CHARACTER_SIZE + 52);
  view.hitArea = hitArea;
  view.cursor = "pointer";
  view.addChild(border, portrait, label);

  // キャラクターカードの選択状態を設定する
  return {
    view,
    setSelected(selected) {
      border.graphics
        .clear()
        .beginFill(selected ? UI_THEME.primary : UI_THEME.borderStrong)
        .drawRoundRect(-6, -6, CHARACTER_SIZE + 12, CHARACTER_SIZE + 12, 12);
      border.cache(-6, -6, CHARACTER_SIZE + 12, CHARACTER_SIZE + 12);
    },
  };
}
