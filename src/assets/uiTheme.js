/**
 * アンティークホワイトを基準にしたライトテーマの共通パレット
 * 画面ごとの色のばらつきを防ぐため、UI色はこの定義から参照する
 */
export const UI_THEME = Object.freeze({
  canvas: "#faebd7",
  background: "#faebd7",
  backgroundDeep: "#faebd7",
  surface: "#fffaf4",
  surfaceMuted: "#eee3d5",
  surfaceStrong: "#ded0c0",
  text: "#2f2f2f",
  textMuted: "#6b6864",
  textOnDark: "#fffaf4",
  border: "#d3c4b2",
  borderStrong: "#a9937b",
  primary: "#5f5953",
  primaryHover: "#4f4a45",
  primaryPressed: "#3f3b37",
  secondary: "#817971",
  secondaryHover: "#706961",
  secondaryPressed: "#5f5953",
  disabled: "#aaa39b",
  disabledHover: "#aaa39b",
  disabledPressed: "#9b958e",
  danger: "#a65353",
  overlay: "rgba(47, 47, 47, 0.62)",
  overlayStrong: "rgba(47, 47, 47, 0.72)",
});

/**
 * ボタンへそのまま渡せる状態色
 */
export const UI_BUTTON_COLORS = Object.freeze({
  primary: Object.freeze({
    normal: UI_THEME.primary,
    hover: UI_THEME.primaryHover,
    pressed: UI_THEME.primaryPressed,
  }),
  secondary: Object.freeze({
    normal: UI_THEME.secondary,
    hover: UI_THEME.secondaryHover,
    pressed: UI_THEME.secondaryPressed,
  }),
  disabled: Object.freeze({
    normal: UI_THEME.disabled,
    hover: UI_THEME.disabledHover,
    pressed: UI_THEME.disabledPressed,
  }),
});
