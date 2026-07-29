import { UI_BUTTON_COLORS, UI_THEME } from "../assets/uiTheme.js";
import { Button, Text } from "../engine/index.js";

const PANEL_WIDTH = 900;
const PANEL_HEIGHT = 460;
const CHOICE_WIDTH = 240;
const CHOICE_HEIGHT = 270;
const CHOICE_GAP = 24;
const CHOICE_TEXT_PADDING = 20;
const DESCRIPTION_MAX_CHARACTERS_PER_LINE = 11;
const VIEWPORT_MARGIN = 20;
const PANEL_REVEAL_DELAY = 0.72;
const PANEL_ENTER_DURATION = 0.28;

/**
 * レベルアップ時の強化候補を中央へ表示するオーバーレイ
 */
export class LevelUpView {
  constructor({ onSelected }) {
    this.onSelected = onSelected;
    this.view = new createjs.Container();
    this.overlay = new createjs.Shape();
    this.dialog = new createjs.Container();
    this.panel = new createjs.Shape();
    this.title = new Text({
      text: "LEVEL UP!",
      width: PANEL_WIDTH,
      height: 48,
      font: "700 36px sans-serif",
      textAlign: "center",
      color: UI_THEME.primary,
    });
    this.subtitle = new Text({
      text: "強化を1つ選んでください",
      width: PANEL_WIDTH,
      height: 30,
      font: "20px sans-serif",
      textAlign: "center",
      color: UI_THEME.text,
    });
    this.choiceButtons = [];
    this.revealDelay = 0;
    this.enterElapsed = PANEL_ENTER_DURATION;
    this.layoutScale = 1;

    this.title.y = 30;
    this.subtitle.y = 76;
    this.panel.graphics
      .beginFill(UI_THEME.surface)
      .drawRoundRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT, 20);
    this.panel.cache(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
    this.dialog.addChild(this.panel, this.title, this.subtitle);
    this.view.addChild(this.overlay, this.dialog);
    this.hide();
  }

  /**
   * 強化候補を表示する
   * @param choices 強化候補
   */
  show(choices, { delay = 0 } = {}) {
    this.#disposeButtons();
    const choicesWidth =
      choices.length * CHOICE_WIDTH + Math.max(0, choices.length - 1) * CHOICE_GAP;
    const firstChoiceX = (PANEL_WIDTH - choicesWidth) / 2;
    choices.forEach((choice, index) => {
      const button = new Button({
        text: formatUpgradeCardText(choice),
        width: CHOICE_WIDTH,
        height: CHOICE_HEIGHT,
        font: "600 19px sans-serif",
        textColor: UI_THEME.textOnDark,
        normalColor: UI_BUTTON_COLORS.secondary.normal,
        hoverColor: UI_BUTTON_COLORS.secondary.hover,
        pressedColor: UI_BUTTON_COLORS.secondary.pressed,
      });
      // カードの左右に余白を確保し、CreateJS側でも幅を超えないよう折り返す
      button.textView.lineWidth = CHOICE_WIDTH - CHOICE_TEXT_PADDING * 2;
      button.textView.lineHeight = 27;
      button.redraw();
      button.x = firstChoiceX + index * (CHOICE_WIDTH + CHOICE_GAP);
      button.y = 130;
      button.onClick(() => this.onSelected(choice.id));
      this.choiceButtons.push(button);
      this.dialog.addChild(button);
    });
    this.revealDelay = Math.max(0, delay);
    this.enterElapsed = 0;
    this.view.visible = this.revealDelay === 0;
    this.dialog.alpha = this.view.visible ? 1 : 0;
    this.overlay.alpha = this.view.visible ? 1 : 0;
    this.#applyEnterAnimation();
  }

  /**
   * プレイヤー演出からパネル表示へ滑らかに遷移させる
   */
  showAfterLevelUp(choices) {
    this.show(choices, { delay: PANEL_REVEAL_DELAY });
  }

  /**
   * パネルの待機時間と登場アニメーションを進める
   * @param deltaTime 前フレームからの経過時間
   */
  tick(deltaTime) {
    const dt = Math.max(0, Number(deltaTime) || 0);
    if (this.revealDelay > 0) {
      this.revealDelay = Math.max(0, this.revealDelay - dt);
      if (this.revealDelay > 0) {
        return;
      }
      this.view.visible = true;
    }

    if (!this.view.visible || this.enterElapsed >= PANEL_ENTER_DURATION) {
      return;
    }

    this.enterElapsed = Math.min(PANEL_ENTER_DURATION, this.enterElapsed + dt);
    this.#applyEnterAnimation();
  }

  hide() {
    this.view.visible = false;
    this.revealDelay = 0;
  }

  layout(width, height) {
    this.overlay.graphics.clear().beginFill(UI_THEME.overlayStrong).drawRect(0, 0, width, height);
    this.overlay.cache(0, 0, width, height);
    const scale = Math.min(
      1,
      Math.max(1, width - VIEWPORT_MARGIN * 2) / PANEL_WIDTH,
      Math.max(1, height - VIEWPORT_MARGIN * 2) / PANEL_HEIGHT,
    );
    this.layoutScale = scale;
    this.dialog.scaleX = scale;
    this.dialog.scaleY = scale;
    this.dialog.x = (width - PANEL_WIDTH * scale) / 2;
    this.dialog.y = (height - PANEL_HEIGHT * scale) / 2;
  }

  dispose() {
    this.#disposeButtons();
    this.view.removeAllChildren();
  }

  #disposeButtons() {
    for (const button of this.choiceButtons) {
      button.dispose();
      this.dialog.removeChild(button);
    }
    this.choiceButtons = [];
  }

  #applyEnterAnimation() {
    const progress = Math.min(1, this.enterElapsed / PANEL_ENTER_DURATION);
    const eased = 1 - (1 - progress) ** 3;
    this.overlay.alpha = eased;
    this.dialog.alpha = eased;
    const enterScale = 0.92 + eased * 0.08;
    this.dialog.scaleX = this.layoutScale * enterScale;
    this.dialog.scaleY = this.layoutScale * enterScale;
  }
}

/**
 * 強化カードの説明をカード幅に収まる行へ分割する
 * @param choice 強化候補
 * @returns {string}
 */
export function formatUpgradeCardText(choice) {
  const description = wrapText(choice.description, DESCRIPTION_MAX_CHARACTERS_PER_LINE);
  return `${choice.name}\n\nLv.${choice.rank + 1}\n\n${description}`;
}

/**
 * 改行を維持しながら指定文字数ごとにテキストを折り返す
 * @param text 折り返すテキスト
 * @param maxCharacters 1行の最大文字数
 * @returns {string}
 */
export function wrapText(text, maxCharacters) {
  const lineLength = Math.max(1, Math.floor(maxCharacters));

  return String(text)
    .split("\n")
    .flatMap((line) => {
      if (line.length === 0) {
        return [""];
      }

      const wrappedLines = [];
      for (let index = 0; index < line.length; index += lineLength) {
        wrappedLines.push(line.slice(index, index + lineLength));
      }
      return wrappedLines;
    })
    .join("\n");
}
