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

    const divider = new createjs.Shape();
    divider.graphics.beginFill(UI_THEME.border).drawRect(CONTENT_WIDTH / 2 - 1, 88, 2, 412);
    divider.cache(CONTENT_WIDTH / 2 - 1, 88, 2, 412);

    this.#createCharacterSelection();
    this.#createStageSelection();
    this.#createOperationGuide();
    this.#createBackButton();
    this.#createStartButton();
    this.#createNotification();

    this.content.addChildAt(title, divider, 0);
    this.root.addChild(this.background, this.content, this.backButton, this.startButton);
    this.layout();
  }

  /**
   * 通知の表示時間を更新する
   * @param deltaTime 経過時間
   */
  tick(deltaTime) {
    if (this.notificationRemaining <= 0) {
      return;
    }

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
    if (this.background === null) {
      return;
    }

    this.background.graphics
      .clear()
      .beginFill(UI_THEME.background)
      .drawRect(0, 0, this.width, this.height);
    this.background.cache(0, 0, this.width, this.height);

    const contentLayout = calculateMainMenuLayout(this.width, this.height);
    this.content.scaleX = contentLayout.scale;
    this.content.scaleY = contentLayout.scale;
    this.content.x = contentLayout.x;
    this.content.y = contentLayout.y;

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
    const heading = createHeading("キャラクター選択");
    heading.x = 24;
    heading.y = 88;
    this.content.addChild(heading);

    const startX = 28;

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
    const heading = createHeading("ステージ選択");
    heading.x = CONTENT_WIDTH - 484;
    heading.y = 88;
    this.content.addChild(heading);

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
    for (const [id, card] of this.characterCards) {
      card.setSelected(id === selection.characterId);
    }

    const character = characterList.find(({ id }) => id === selection.characterId);
    this.characterDescription.setText(
      character === undefined
        ? "キャラクターを選択すると性能が表示されます"
        : `${character.name}\n${character.description}`,
    );

    for (const [id, button] of this.stageButtons) {
      const selected = id === selection.stageId;
      button.setColors({
        normal: selected ? UI_THEME.primary : UI_THEME.secondary,
        hover: selected ? UI_THEME.primaryHover : UI_THEME.secondaryHover,
        pressed: selected ? UI_THEME.primaryPressed : UI_THEME.secondaryPressed,
      });
    }

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
    if (!this.selectionController.validateStart()) {
      return;
    }

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

  portrait.graphics
    .beginFill(character.color)
    .drawRoundRect(0, 0, CHARACTER_SIZE, CHARACTER_SIZE, 8);
  portrait.cache(0, 0, CHARACTER_SIZE, CHARACTER_SIZE);
  portrait.mouseEnabled = false;
  border.mouseEnabled = false;

  const hitArea = new createjs.Shape();
  hitArea.graphics.beginFill("#000000").drawRect(0, 0, CHARACTER_SIZE, CHARACTER_SIZE + 52);
  view.hitArea = hitArea;
  view.cursor = "pointer";
  view.addChild(border, portrait, label);

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
