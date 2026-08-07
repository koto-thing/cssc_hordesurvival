`This document is written by AI.`

# 高校生向け ゲーム拡張ガイド

## この資料の目的

このゲームは、敵を倒しながら一定時間生き残る「Vampire Survivors」風のゲームです。

この資料では、JavaScriptを学び始めた高校生が、完成済みのゲームを少しずつ改造しながら、次の体験ができることを目指します。

- 数値を変えると、ゲームの遊び心地が変わる
- データを追加すると、新しいキャラクターや敵を作れる
- 処理を書くと、新しい動きやルールを作れる
- 小さく変更し、実際に遊んで確かめる

最初からゲーム全体を理解する必要はありません。まずは `src/assets` フォルダのデータを1か所だけ変更するのがおすすめです。

## 最初にゲームを動かす

イベントで案内された方法でゲーム画面をブラウザに表示します。編集するのはHTML、JavaScript、CSSファイルです。

ファイルを変更して保存したら、ゲーム画面を再読み込みして動きを確認します。画面が動かなくなった場合は、ブラウザの開発者ツールを開き、コンソールに表示された最初の赤いエラーとファイル名、行番号を確認します。

## 拡張しやすい場所の一覧

| 難易度 | 拡張内容                     | 主に変更するファイル                                  | 学べること                     |
| ------ | ---------------------------- | ----------------------------------------------------- | ------------------------------ |
| ★      | 敵の強さを変える             | `src/assets/enemyList.js`                             | オブジェクト、数値             |
| ★      | 弾の強さを変える             | `src/assets/bulletList.js`                            | オブジェクト、真偽値           |
| ★      | 敵の出現順や数を変える       | `src/assets/waveList.js`                              | 配列、時間、バランス調整       |
| ★      | キャラクターを調整する       | `src/assets/characterList.js`                         | 配列、オブジェクト             |
| ★      | 強化アイテムを調整する       | `src/assets/commonUpgradeList.js`                     | ID、効果と表示の関係           |
| ★★     | 新しいキャラクターを追加する | `src/assets/characterList.js`                         | データの追加、IDによる参照     |
| ★★     | 新しい敵や弾を追加する       | `src/assets/enemyList.js`、`src/assets/bulletList.js` | 複数データの組み合わせ         |
| ★★★    | 新しい弾の動きを作る         | `src/bullet`、`src/bullet/bulletFactory.js`           | クラス、状態、毎フレームの処理 |
| ★★★    | 新しい敵の動きを作る         | `src/enemy`、`src/enemy/enemyFactory.js`              | コンポーネント、処理の分担     |
| ★★★    | ステージごとの難易度を作る   | `src/assets/stageList.js`、`src/scenes/gameScene.js`  | 設定の受け渡し、ゲームルール   |

`★` から順番に取り組むと、動かなくなる原因を見つけやすくなります。

## 1. 敵の強さを変える（★）

`src/assets/enemyList.js` には、敵ごとの設定があります。

```js
fastSlime: {
  imageId: "fastSlime",
  hp: 5,
  speed: 150,
  attack: 1,
  experience: 15,
  score: 150,
  movementType: "chase",
},
```

主な項目は次のとおりです。

| 項目         | 意味               | 大きくするとどうなるか             |
| ------------ | ------------------ | ---------------------------------- |
| `hp`         | 体力               | 倒すまでに多くの攻撃が必要になる   |
| `speed`      | 移動速度           | プレイヤーへ速く近づく             |
| `attack`     | 接触時の攻撃力     | プレイヤーが受けるダメージが増える |
| `experience` | 倒したときの経験値 | レベルアップが速くなる             |
| `score`      | 倒したときの得点   | スコアが増えやすくなる             |

最初の課題例は「`fastSlime` の `speed` を `150` から `100` にして、遊びやすさを比較する」です。一度に複数の値を変えず、1項目ずつ試すと違いが分かりやすくなります。

## 2. 弾を改造する（★）

`src/assets/bulletList.js` には、プレイヤーと敵が使う弾の設定があります。

```js
normal: {
  imageId: "normalBullet",
  speed: 500,
  damage: 1,
  lifetime: 2,
  piercing: false,
  movementType: "straight",
},
```

| 項目           | 意味                                                                          |
| -------------- | ----------------------------------------------------------------------------- |
| `speed`        | 弾が1秒間に進む距離                                                           |
| `damage`       | 敵へ与えるダメージ                                                            |
| `lifetime`     | 弾が消えるまでの秒数。プレイヤーの弾はキャラクターの `shotRange` が優先される |
| `piercing`     | `true` なら敵を貫通し、`false` なら命中時に消える                             |
| `movementType` | `straight` は直進、`wave` は波打つ動き                                        |

たとえば `normal` の `piercing` を `true` にすると、真偽値によって動作が変わることを体験できます。

`imageId` に対応する画像が登録されていない場合も、弾はピンク色の円で表示されます。そのため、最初は画像を用意せずに弾の性能だけを試せます。

## 3. ウェーブを作る（★）

`src/assets/waveList.js` では、「何秒目から、どの敵を、何秒おきに、何体出すか」を設定します。

```js
{
  startTime: 0,
  duration: 30,
  spawns: [
    {
      enemyId: "slime",
      interval: 2,
      count: 15,
      positionType: "screenEdge",
    },
  ],
},
```

| 項目           | 意味                           | 注意点                            |
| -------------- | ------------------------------ | --------------------------------- |
| `startTime`    | ゲーム開始から何秒後に始まるか | 0以上にする                       |
| `duration`     | そのウェーブが続く秒数         | 出現時間の範囲になる              |
| `enemyId`      | 出す敵のID                     | `enemyList.js` に存在するIDを書く |
| `interval`     | 何秒おきに出すか               | 必ず0より大きくする               |
| `count`        | 最大出現数                     | 大きすぎると急に難しくなる        |
| `positionType` | 出現位置の決め方               | 現在利用できるのは `screenEdge`   |

おすすめ課題は、最初の30秒を次の3区間に分けることです。

1. 0〜10秒: 遅い敵だけを少数出す
2. 10〜20秒: 敵の出現間隔を短くする
3. 20〜30秒: 速い敵を混ぜる

配列にウェーブを追加することで、ゲームに「徐々に難しくなる流れ」を作れます。

## 4. キャラクターを調整・追加する（★〜★★）

`src/assets/characterList.js` では、タイトル後のメニューに表示されるキャラクターと性能を定義します。

```js
{
  id: "azure",
  name: "Azure",
  color: "#4d83e6",
  description: "攻撃間隔が早い\n通常弾を使う\n移動速度が一番速い",
  gameplay: {
    bulletId: "normal",
    shotInterval: 0.14,
    shotAngles: [0],
    maxHealth: 3,
    moveSpeed: 240,
    shotRange: 1000,
  },
  upgrades: [/* 強化の一覧 */],
},
```

| 項目           | 意味                                             |
| -------------- | ------------------------------------------------ |
| `id`           | プログラム内で使う重複しない名前                 |
| `name`         | 画面に表示する名前                               |
| `color`        | キャラクターの色                                 |
| `description`  | 特徴の説明。`\n` で改行できる                    |
| `bulletId`     | `bulletList.js` にある弾のID                     |
| `shotInterval` | 攻撃と攻撃の間隔。小さいほど連射が速い           |
| `shotAngles`   | 発射角度の配列。`[-0.2, 0, 0.2]` なら3方向へ撃つ |
| `maxHealth`    | 最大体力                                         |
| `moveSpeed`    | 移動速度                                         |
| `shotRange`    | 弾が進める最大距離                               |

新しいキャラクターは、既存の1体を丸ごとコピーして配列の末尾へ追加するのが簡単です。その後、少なくとも `id`、`name`、`color` を変更します。

新しいキャラクターを考えるときは、強みと弱みを1つずつ作ると個性が出ます。

- 例: 体力は高いが移動が遅い
- 例: 5方向へ撃つが攻撃間隔が長い
- 例: 強い弾を使うが射程が短い

## 5. レベルアップ強化を作る（★〜★★）

全キャラクター共通の強化は `src/assets/commonUpgradeList.js`、キャラクター専用の強化は `src/assets/characterList.js` の各キャラクター内にあります。

```js
{
  id: "common-move-speed",
  name: "脚力強化",
  description: "移動速度が5%上昇",
  effect: { type: "moveSpeedMultiplier", value: 1.05 },
},
```

現在利用できる `effect.type` は次のとおりです。

| `type`                   | 効果                               | `value` の例               |
| ------------------------ | ---------------------------------- | -------------------------- |
| `moveSpeedMultiplier`    | 移動速度を倍率で変える             | `1.1` で10%上昇            |
| `shotIntervalMultiplier` | 攻撃間隔を倍率で変える             | `0.9` で10%短縮            |
| `shotRangeMultiplier`    | 射程を倍率で変える                 | `1.2` で20%上昇            |
| `addOuterShots`          | 左右に弾を追加する                 | `0.2` で外側の角度を広げる |
| `maxHealth`              | 最大体力を増やし、同じ量を回復する | `1` で体力を1増加          |

`description` は自動計算されないため、`value` を変えたときは説明文も同時に直します。未実装の `type` を書くだけでは効果は発生しません。新しい効果の種類を作る場合は、`src/player/PlayerUpgradeController.js` に処理の追加が必要です。

## 6. 新しい敵を作る（★★）

最初は画像を使わず、色付きの円として新しい敵を作れます。`src/assets/enemyList.js` に次のような定義を追加します。

```js
tankSlime: {
  fallbackColor: "#3f7f45",
  hp: 40,
  speed: 40,
  attack: 2,
  experience: 30,
  score: 400,
  movementType: "chase",
},
```

次に `src/assets/waveList.js` の `spawns` へ追加します。

```js
{
  enemyId: "tankSlime",
  interval: 8,
  count: 3,
  positionType: "screenEdge",
},
```

ここでは `tankSlime` という同じIDが2つのファイルをつないでいます。スペルや大文字・小文字が異なると敵を生成できません。

敵に射撃させたい場合は、さらに `shooting` を追加できます。

```js
shooting: {
  bulletId: "enemyNormal",
  bulletSpeed: 180,
  interval: 3,
  aimType: "direct",
},
```

現在の `aimType` は、現在位置を狙う `direct` と移動先を予測する `predictive` が使えます。

## 7. 画像や音を差し替える（★★）

画像は `src/assets/static/images`、音は `src/assets/static/audio` に置きます。その後、`src/assets/assetList.js` にIDとファイルを登録します。

```js
{
  id: "tankSlimeImage",
  src: new URL("./static/images/tank_slime.png", import.meta.url).href,
  type: createjs.Types.IMAGE,
},
```

敵の `imageId` に同じIDを指定します。

```js
imageId: "tankSlimeImage",
```

素材ファイル名、`assetList.js` の `id`、敵や弾の `imageId` の3つを確認することが大切です。未登録の敵画像や弾画像は色付きの円へ自動的に置き換わるため、まず動作を完成させてから画像を追加しても構いません。

スプライトアニメーションを追加する場合は、フレームの幅や高さも必要です。詳しくは `docs/engine-scripting-reference.md` の `SpriteAnimation` を参照してください。

## 8. 新しい弾の動きを作る（★★★）

現在は次の2種類があります。

- `straight`: 直進する。処理は `src/bullet/StraightBulletMoveController.js`
- `wave`: 波打つ。処理は `src/bullet/WaveBulletMoveController.js`

新しい動きを追加する基本手順は次のとおりです。

1. `src/bullet` に新しい移動コントローラーを作る
2. `src/bullet/bulletFactory.js` で読み込む
3. `createMoveController` の `switch` に新しい `movementType` を追加する
4. `src/assets/bulletList.js` にその動きを使う弾を追加する
5. ブラウザで弾の動きを確認する

たとえば「だんだん加速する弾」なら、コントローラーが `speed` を持ち、`tick(deltaTime)` のたびに速度を増やします。毎フレームの移動距離には `deltaTime` を掛け、パソコンの速さによってゲーム速度が変わらないようにします。

エンジンの `Component` と `deltaTime` の説明は `docs/engine-scripting-reference.md` にあります。

## 9. 新しい敵の動きを作る（★★★）

現在の敵の移動は、プレイヤーを追う `chase` だけです。処理は `src/enemy/chasePlayerMoveController.js` にあります。

新しい動きを追加する基本手順は次のとおりです。

1. `src/enemy` に新しい移動コントローラーを作る
2. `src/enemy/enemyFactory.js` で読み込む
3. `#createMoveController` の `switch` に新しい `movementType` を追加する
4. `src/assets/enemyList.js` の敵へ新しい `movementType` を指定する
5. ブラウザで敵の動きを確認する

題材の例には「一定距離を保つ敵」「左右に揺れながら近づく敵」「プレイヤーから逃げる敵」があります。最初は既存の `ChasePlayerMoveController` を参考に、計算を1か所だけ変えると取り組みやすくなります。

## 10. ステージごとの難易度を作る（★★★）

`src/assets/stageList.js` には `easy`、`normal`、`hard`、`challenge` があります。ただし、現在ゲームルールに反映されているのは `challenge` の「ウェーブを繰り返す」という設定だけです。`easy`、`normal`、`hard` は選択できますが、敵の体力や出現数は同じです。

ステージ差を作る場合は、次のような設定を `stageList.js` の各ステージへ持たせ、`src/scenes/gameScene.js` からウェーブや敵の生成処理へ渡す拡張が考えられます。

```js
{
  id: "easy",
  name: "Easy",
  enemyHpMultiplier: 0.8,
  spawnIntervalMultiplier: 1.2,
},
```

これはデータを書くだけでは動きません。ゲーム本編が設定を読み取る処理を追加し、各ステージを実際に遊んで確認する必要があります。早く成果を確認したい最初の課題より、JavaScriptに慣れた後のグループ課題に向いています。

## 失敗しにくい進め方

- 一度に変更する場所は1〜2か所にする
- 変更前の数値をメモする
- IDは半角英数字で、重複しない名前にする
- 文字列の `"`、オブジェクトの `{}`、配列の `[]`、項目末尾の `,` を確認する
- 数値には `"100"` ではなく `100` と書く
- `interval` や `shotInterval` を0にしない
- 敵の数や連射速度を急に増やしすぎない
- 保存するたびに画面とブラウザの開発者コンソールを確認する
- 小さく動かしてから、次の変更へ進む

## テストするときのチェックリスト

- [ ] タイトル画面からゲームを開始できる
- [ ] 追加したキャラクターやステージを選択できる
- [ ] 敵が正しく出現する
- [ ] プレイヤーと敵の弾が正しい方向へ飛ぶ
- [ ] 敵を倒すと経験値とスコアが増える
- [ ] レベルアップ強化を選べる
- [ ] ゲームクリアまたはゲームオーバーまで進める
- [ ] ブラウザの開発者コンソールに赤いエラーがない

## 困ったときに確認する場所

| 症状                           | 確認すること                                              |
| ------------------------------ | --------------------------------------------------------- |
| 画面が起動しない               | ブラウザコンソールの最初のエラーを見る                    |
| 追加した敵が出ない             | `enemyList.js` と `waveList.js` のIDが同じか確認する      |
| 追加した弾が出ない             | `bulletList.js` とキャラクターの `bulletId` を確認する    |
| 画像が色付きの円になる         | `assetList.js` の登録ID、ファイル名、`imageId` を確認する |
| 強化が選べても効果がない       | `effect.type` が対応済みの名前か確認する                  |
| 敵が急に大量発生する           | `interval`、`count`、`startTime` を確認する               |
| 新しい移動タイプでエラーになる | ファクトリの `switch` に処理を追加したか確認する          |

ゲームエンジンのクラスや入力、当たり判定、UIを詳しく知りたい場合は、`docs/engine-scripting-reference.md` を参照してください。
