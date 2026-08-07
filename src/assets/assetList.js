/**
 * アセットのリストを定義する配列
 * 各アセットはオブジェクトとして定義され、以下のプロパティを持つ:
 * - id: アセットの識別子 (string)
 * - src: アセットのソースURL (string)
 * - type: アセットの種類 (createjs.Types.IMAGE または createjs.Types.SOUND)
 * @type {[{id: string, src: string, type: *},{id: string, src: string, type: *},{id: string, src: string, type: *},{id: string, src: string, type: *},{id: string, src: string, type: *},null,null,null,null,null,null,null,null,null]}
 */
export const bulletList = [
  {
    id: "testImg",
    src: new URL("./static/images/test.png", import.meta.url).href,
    type: createjs.Types.IMAGE,
  },
  {
    id: "menuIcon",
    src: new URL("./static/images/HamburgerIcon.svg", import.meta.url).href,
    type: createjs.Types.IMAGE,
  },
  {
    id: "hurtBreakIcon",
    src: new URL("./static/images/HurtBreak.svg", import.meta.url).href,
    type: createjs.Types.IMAGE,
  },
  {
    id: "testAudio",
    src: new URL("./static/audio/test.mp3", import.meta.url).href,
    type: createjs.Types.SOUND,
  },
  {
    id: "gameSceneMusic",
    src: new URL("./static/audio/8bit-sentou-two_Loop.ogg", import.meta.url).href,
    type: createjs.Types.SOUND,
  },
  {
    id: "levelUpSound",
    src: new URL("./static/audio/powerUp.wav", import.meta.url).href,
    type: createjs.Types.SOUND,
  },
  {
    id: "playerHitSound",
    src: new URL("./static/audio/playerHit.wav", import.meta.url).href,
    type: createjs.Types.SOUND,
  },
  {
    id: "enemyHitSound",
    src: new URL("./static/audio/enemyHit.wav", import.meta.url).href,
    type: createjs.Types.SOUND,
  },
  {
    id: "enemyDefeatedSound",
    src: new URL("./static/audio/enemyDie.wav", import.meta.url).href,
    type: createjs.Types.SOUND,
  },
  {
    id: "buttonClickSound",
    src: new URL("./static/audio/buttonClick.wav", import.meta.url).href,
    type: createjs.Types.SOUND,
  },
  {
    id: "gameOverSound",
    src: new URL("./static/audio/gameOver.wav", import.meta.url).href,
    type: createjs.Types.SOUND,
  },
  {
    id: "gameClearSound",
    src: new URL("./static/audio/gameClear.wav", import.meta.url).href,
    type: createjs.Types.SOUND,
  },
  {
    id: "slimeRun",
    src: new URL("./static/images/slime_run.png", import.meta.url).href,
    type: createjs.Types.IMAGE,
  },
  {
    id: "slimeDie",
    src: new URL("./static/images/slime_die.png", import.meta.url).href,
    type: createjs.Types.IMAGE,
  },
];
