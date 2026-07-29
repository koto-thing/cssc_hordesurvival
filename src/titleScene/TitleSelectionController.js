/**
 * タイトル画面のキャラクターとステージ選択を管理する
 */
export class TitleSelectionController {
  constructor({ onSelectionChanged = () => {}, onValidationFailed = () => {} } = {}) {
    this.characterId = null;
    this.stageId = null;
    this.onSelectionChanged = onSelectionChanged;
    this.onValidationFailed = onValidationFailed;
  }

  /**
   * ゲーム開始に必要な項目がすべて選択されているか
   * @returns {boolean}
   */
  get canStart() {
    return this.characterId !== null && this.stageId !== null;
  }

  /**
   * キャラクターを選択する
   * @param characterId キャラクターID
   */
  selectCharacter(characterId) {
    this.characterId = characterId;
    this.#notifySelectionChanged();
  }

  /**
   * ステージを選択する
   * @param stageId ステージID
   */
  selectStage(stageId) {
    this.stageId = stageId;
    this.#notifySelectionChanged();
  }

  /**
   * 開始可否を検証する
   * @returns {boolean} ゲームを開始できるか
   */
  validateStart() {
    if (this.canStart) {
      return true;
    }

    this.onValidationFailed(this.#createValidationMessage());
    return false;
  }

  /**
   * 現在の選択内容を通知する
   */
  #notifySelectionChanged() {
    this.onSelectionChanged({
      characterId: this.characterId,
      stageId: this.stageId,
      canStart: this.canStart,
    });
  }

  /**
   * 未選択項目に応じた通知文を生成する
   * @returns {string}
   */
  #createValidationMessage() {
    if (this.characterId === null && this.stageId === null) {
      return "キャラクターとステージを選択してください";
    }

    if (this.characterId === null) {
      return "キャラクターを選択してください";
    }

    return "ステージを選択してください";
  }
}
