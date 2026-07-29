let listener = () => {};

/**
 * UI操作時に呼ばれるフィードバック処理を設定する
 * @param nextListener UI操作通知の受け取り先
 */
export function setUIInteractionFeedback(nextListener) {
  listener = typeof nextListener === "function" ? nextListener : () => {};
}

/**
 * クリック可能なUIが操作されたことを通知する
 */
export function notifyUIInteraction() {
  listener();
}
