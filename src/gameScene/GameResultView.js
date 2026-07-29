import { Text } from "../engine/index.js";

/**
 * ゲーム終了結果とタイトルへ戻る案内を表示するオーバーレイ
 */
export class GameResultView {
  constructor() {
    this.view = new createjs.Container();
    this.background = new createjs.Shape();
    this.resultText = new Text({
      text: "",
      font: "700 56px sans-serif",
      color: "#ffffff",
    });
    this.returnText = new Text({
      text: "クリックまたはキー入力でタイトルへ戻る",
      font: "20px sans-serif",
      color: "#d8deea",
    });

    this.view.mouseEnabled = false;
    this.view.visible = false;
    this.view.addChild(this.background, this.resultText, this.returnText);
  }

  /**
   * 終了結果を表示する
   * @param result ゲーム終了結果
   */
  show(result) {
    this.resultText.setText(result === "clear" ? "CLEAR" : "GAME OVER");
    this.view.visible = true;
  }

  /**
   * 表示領域に合わせてオーバーレイを配置する
   */
  layout(width, height) {
    this.background.graphics
      .clear()
      .beginFill("rgba(12, 15, 25, 0.78)")
      .drawRect(0, 0, width, height);
    this.background.cache(0, 0, width, height);

    this.resultText.x = (width - this.resultText.uiWidth) / 2;
    this.resultText.y = height * 0.38;
    this.returnText.x = (width - this.returnText.uiWidth) / 2;
    this.returnText.y = height * 0.58;
  }
}
