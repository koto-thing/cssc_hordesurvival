/**
 * ゲーム画面の描画順を固定するレイヤー構成
 *
 * CreateJSは後から追加した子を手前に描画するため、動的に生成される敵や弾を
 * 専用のworldレイヤーへ入れ、HUDとリザルトの前後関係を維持する
 */
export class GameRenderLayers {
  constructor() {
    this.background = new createjs.Container();
    this.world = new createjs.Container();
    this.combatFeedback = new createjs.Container();
    this.hud = new createjs.Container();
    this.result = new createjs.Container();
    this.menu = new createjs.Container();
  }

  /**
   * 各レイヤーを背面から前面の順でシーンへ追加する
   * @param root シーンのルートコンテナ
   */
  attachTo(root) {
    root.addChild(
      this.background,
      this.world,
      this.combatFeedback,
      this.hud,
      this.result,
      this.menu,
    );
  }
}
