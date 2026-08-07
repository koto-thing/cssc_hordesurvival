`This document was written by AI.`

# Engine スクリプティングリファレンス

このドキュメントは、`src/engine` に入っているゲームエンジン部分を使って、ゲームのキャラクター、弾、敵、画面、UI などを作るためのリファレンスです。

## 最初に知っておくこと

このゲームでは、画面に出るものを `GameObject` として作ります。

プレイヤー、敵、弾などは、だいたい次のような形です。

```js
const player = new GameObject("Player", playerView);
player.addComponent(new PlayerMoveController());
player.addComponent(new CircleColliderComponent({ radius: 24 }));
```

イメージとしては、次のように考えるとわかりやすいです。

| 名前           | 役割                                         |
| -------------- | -------------------------------------------- |
| `GameObject`   | キャラクターや弾などの本体                   |
| `Component`    | 本体に追加する動きや能力                     |
| `Transform`    | 位置、回転、大きさを管理する部品             |
| `Scene`        | タイトル画面やゲーム画面など、1つの画面      |
| `SceneManager` | シーンを切り替える管理役                     |
| `Game`         | キャンバス、描画、ゲームループを管理する土台 |

たとえばプレイヤーは、「プレイヤーという本体」に「移動する能力」「弾を撃つ能力」「体力を持つ能力」「当たり判定」を付けて作られています。

実際の例は `src/player/player.js` にあります。

## import の基本

エンジンの機能は、基本的に `src/engine/index.js` からまとめて import します。

```js
import {
  Component,
  GameObject,
  InputSystem,
  KeyCode,
  CircleColliderComponent,
} from "../engine/index.js";
```

`index.js` は、エンジンの入口のようなファイルです。どのクラスを使えるかを確認したいときは、まず `src/engine/index.js` を見ると便利です。

## GameObject

`GameObject` は、ゲームの中に存在するものを表します。

プレイヤー、敵、弾など、ゲーム中で動いたり消えたりするものは `GameObject` として作ることが多いです。

```js
import { GameObject } from "../engine/index.js";

const object = new GameObject("Sample");
object.transform.x = 100;
object.transform.y = 200;
```

### よく使うプロパティ

| プロパティ  | 説明                                             |
| ----------- | ------------------------------------------------ |
| `name`      | オブジェクトの名前                               |
| `active`    | 動いているかどうか                               |
| `destroyed` | 破棄済みかどうか                                 |
| `view`      | 実際に画面へ表示する CreateJS の表示オブジェクト |
| `transform` | 位置、回転、大きさを操作するコンポーネント       |

### よく使うメソッド

| メソッド                           | 説明                                             |
| ---------------------------------- | ------------------------------------------------ |
| `addComponent(component)`          | コンポーネントを追加する                         |
| `getComponent(ComponentType)`      | 指定した種類のコンポーネントを1つ取得する        |
| `getComponents(ComponentType)`     | 指定した種類のコンポーネントをすべて取得する     |
| `hasComponent(ComponentType)`      | 指定した種類のコンポーネントを持っているか調べる |
| `removeComponent(componentOrType)` | コンポーネントを外す                             |
| `tick(deltaTime)`                  | 毎フレームの更新を行う                           |
| `lateTick(deltaTime)`              | `tick` の後の更新を行う                          |
| `setActive(active)`                | 有効、無効を切り替える                           |
| `destroy()`                        | オブジェクトを破棄する                           |

### コンポーネントを追加する例

```js
class RotateController extends Component {
  tick(deltaTime) {
    this.transform.rotation += 90 * deltaTime;
  }
}

const object = new GameObject("RotatingObject", view);
object.addComponent(new RotateController());
```

この例では、1秒で90度回転するコンポーネントを追加しています。

## Component

`Component` は、`GameObject` に追加する「ふるまい」です。

たとえば、次のようなものはコンポーネントに向いています。

| 作りたいもの               | コンポーネントの例             |
| -------------------------- | ------------------------------ |
| プレイヤーを動かす         | `PlayerMoveController`         |
| 弾をまっすぐ飛ばす         | `StraightBulletMoveController` |
| 敵がプレイヤーを追いかける | `ChasePlayerMoveController`    |
| 体力や攻撃力を持たせる     | `StatusController`             |

### Component の基本形

```js
import { Component } from "../engine/index.js";

export class SampleComponent extends Component {
  initialize() {
    // GameObject に追加されたときに呼ばれる
  }

  tick(deltaTime) {
    // 毎フレーム呼ばれる
  }

  onDestroy() {
    // GameObject が破棄されるときに呼ばれる
  }
}
```

### ライフサイクル

ライフサイクルとは、「いつ、どのメソッドが呼ばれるか」という流れのことです。

| メソッド              | 呼ばれるタイミング             |
| --------------------- | ------------------------------ |
| `initialize()`        | コンポーネントが追加されたとき |
| `tick(deltaTime)`     | 毎フレーム                     |
| `lateTick(deltaTime)` | そのフレームの `tick` の後     |
| `onDestroy()`         | オブジェクトが破棄されるとき   |

### deltaTime とは

`deltaTime` は、前のフレームから何秒たったかを表す数値です。

たとえば `moveSpeed` が「1秒で200px進む速さ」なら、移動量は次のように書きます。

```js
this.transform.x += moveSpeed * deltaTime;
```

`deltaTime` を使うと、パソコンの性能が違っても、だいたい同じ速さで動きます。

## Transform

`Transform` は、位置、回転、大きさを管理します。

`GameObject` を作ると、自動で `transform` が付きます。

```js
object.transform.x = 100;
object.transform.y = 200;
object.transform.rotation = 45;
object.transform.setScale(2);
```

### よく使う操作

| 書き方                        | 説明                        |
| ----------------------------- | --------------------------- |
| `transform.x`                 | X座標                       |
| `transform.y`                 | Y座標                       |
| `transform.position`          | `{ x, y }` の形で位置を扱う |
| `transform.rotation`          | 回転角度                    |
| `transform.scaleX`            | 横方向の大きさ              |
| `transform.scaleY`            | 縦方向の大きさ              |
| `transform.setScale(x, y)`    | 大きさをまとめて設定する    |
| `transform.translate(dx, dy)` | 今の位置から移動する        |

### 移動する例

```js
class MoveRightController extends Component {
  tick(deltaTime) {
    this.transform.translate(100 * deltaTime, 0);
  }
}
```

このコンポーネントを付けたオブジェクトは、右に進み続けます。

## 入力

キーボードやマウスの入力は `InputSystem` を使います。

`Game` を作ると、内部で `InputSystem.initialize(canvas)` が呼ばれるので、普通は自分で初期化しなくて大丈夫です。

```js
import { Component, InputSystem, KeyCode } from "../engine/index.js";

class MoveWithKeyboard extends Component {
  tick(deltaTime) {
    const speed = 200;

    if (InputSystem.getKey(KeyCode.D)) {
      this.transform.x += speed * deltaTime;
    }

    if (InputSystem.getKey(KeyCode.A)) {
      this.transform.x -= speed * deltaTime;
    }
  }
}
```

### キー入力

| メソッド                       | 説明                        |
| ------------------------------ | --------------------------- |
| `InputSystem.getKey(code)`     | キーを押している間 `true`   |
| `InputSystem.getKeyDown(code)` | キーを押した瞬間だけ `true` |
| `InputSystem.getKeyUp(code)`   | キーを離した瞬間だけ `true` |

よく使うキーは `KeyCode` にまとまっています。

```js
KeyCode.W;
KeyCode.A;
KeyCode.S;
KeyCode.D;
KeyCode.Space;
KeyCode.Enter;
KeyCode.Escape;
KeyCode.ArrowUp;
```

### マウス入力

```js
import { InputSystem, MouseButton } from "../engine/index.js";

if (InputSystem.getMouseButtonDown(MouseButton.Left)) {
  console.log("左クリック");
}

console.log(InputSystem.mouseX, InputSystem.mouseY);
```

| メソッド、プロパティ         | 説明                              |
| ---------------------------- | --------------------------------- |
| `getMouseButton(button)`     | マウスボタンを押している間 `true` |
| `getMouseButtonDown(button)` | 押した瞬間だけ `true`             |
| `getMouseButtonUp(button)`   | 離した瞬間だけ `true`             |
| `mouseX`                     | マウスのX座標                     |
| `mouseY`                     | マウスのY座標                     |
| `mousePosition`              | `{ x, y }` の形のマウス座標       |
| `mouseWheelDelta`            | ホイールの動き                    |

## 当たり判定

当たり判定には `ColliderComponent` を使います。

このエンジンには、次の3種類があります。

| クラス                       | 形   |
| ---------------------------- | ---- |
| `CircleColliderComponent`    | 円   |
| `RectangleColliderComponent` | 四角 |
| `EllipseColliderComponent`   | 楕円 |

### 円の当たり判定を追加する例

```js
import { CircleColliderComponent, GameObject } from "../engine/index.js";

const enemy = new GameObject("Enemy", enemyView);
enemy.addComponent(new CircleColliderComponent({ radius: 20 }));
```

### 四角の当たり判定を追加する例

```js
object.addComponent(
  new RectangleColliderComponent({
    width: 64,
    height: 32,
  }),
);
```

### 2つの GameObject が当たっているか調べる

```js
import { CollisionSystem } from "../engine/index.js";

if (CollisionSystem.intersects(player, enemy)) {
  console.log("プレイヤーと敵が当たった");
}
```

`CollisionSystem.intersects` は、両方の `GameObject` についているコライダーを調べます。どちらかが `active` でない場合や、破棄済みの場合は `false` になります。

## Scene

`Scene` は、ゲームの1つの画面を表します。

このプロジェクトには、たとえば次のようなシーンがあります。

| ファイル                      | 役割           |
| ----------------------------- | -------------- |
| `src/scenes/titleScene.js`    | タイトル画面   |
| `src/scenes/mainMenuScene.js` | メニュー画面   |
| `src/scenes/gameScene.js`     | ゲーム本編     |
| `src/scenes/creditsScene.js`  | クレジット画面 |

### Scene の基本形

```js
import { Scene } from "../engine/index.js";

export class SampleScene extends Scene {
  initialize() {
    // シーンが始まったときに呼ばれる
  }

  tick(deltaTime) {
    // 毎フレーム呼ばれる
  }

  exit() {
    // 別のシーンへ移る前に呼ばれる
  }

  resize(width, height) {
    super.resize(width, height);
    // 画面サイズに合わせて配置を直す
  }
}
```

### root とは

`Scene` には `root` があります。

`root` は、そのシーンに表示するものを入れる箱です。

```js
this.root.addChild(titleText);
this.root.addChild(startButton);
```

シーンを切り替えると、`SceneManager` が古いシーンの `root` をステージから外し、新しいシーンの `root` を追加します。

## SceneManager

`SceneManager` は、シーンの登録と切り替えを管理します。

`src/main.js` では、次のように使われています。

```js
const sceneManager = new SceneManager(game.stage);

sceneManager.register("title", () => new TitleScene({ sceneManager }));
sceneManager.register("game", () => new GameScene({ sceneManager, assetManager }));

sceneManager.changeScene("title");
```

### よく使うメソッド

| メソッド                  | 説明                             |
| ------------------------- | -------------------------------- |
| `register(name, factory)` | シーン名と作り方を登録する       |
| `changeScene(name)`       | 次のフレームでシーンを切り替える |
| `tick(deltaTime)`         | 現在のシーンを更新する           |
| `resize(width, height)`   | 現在のシーンへ画面サイズを伝える |

`changeScene` は、その場ですぐに切り替えるのではなく、次の `tick` で切り替えます。更新中にシーンをいきなり消してしまうと、処理が不安定になることがあるためです。

## Game

`Game` は、キャンバス、描画ステージ、ゲームループ、入力の初期化をまとめて行います。

`src/main.js` の最初のほうで作られています。

```js
const game = new Game("gameCanvas");
```

`"gameCanvas"` は `index.html` にある canvas の id です。

### ゲームループ

ゲームループは、ゲームを毎フレーム動かす仕組みです。

```js
game.start((deltaTime) => {
  sceneManager.tick(deltaTime);
});
```

この中で `sceneManager.tick(deltaTime)` が呼ばれ、そこから現在のシーンやゲームオブジェクトが更新されます。

## AssetManager

`AssetManager` は、画像や音などの素材を登録、読み込み、取得するためのクラスです。

```js
const assetManager = new AssetManager();
assetManager.register(assetList);
await assetManager.load();

const image = assetManager.get("menuIcon");
```

### よく使う流れ

1. `new AssetManager()` で作る
2. `register(assetList)` で素材リストを登録する
3. `await load()` で読み込む
4. `get(id)` で素材を取り出す

`load()` が終わる前に `get(id)` を呼ぶとエラーになります。

## UI

UI には、`Button`, `Text`, `Image`, `Slider` などがあります。

これらは `createjs.Container` をもとにした表示要素です。`GameObject` とは少し違い、主にメニューや HUD に使います。

### Button

```js
import { Button } from "../engine/index.js";

const button = new Button({
  text: "START",
  width: 240,
  height: 64,
});

button.x = 100;
button.y = 200;
button.onClick(() => {
  sceneManager.changeScene("game");
});

this.root.addChild(button);
```

| メソッド                        | 説明                               |
| ------------------------------- | ---------------------------------- |
| `setText(text)`                 | 表示する文字を変える               |
| `onClick(listener)`             | クリックされたときの処理を登録する |
| `setColors(colors)`             | 通常、ホバー、押下などの色を変える |
| `setInteractable(interactable)` | 押せるかどうかを変える             |
| `dispose()`                     | UIを破棄する                       |

### Text

```js
const text = new Text({
  text: "Score: 0",
  font: "24px sans-serif",
  color: "#ffffff",
});

text.setText("Score: 100");
```

`Text` は StageGL でも文字が表示されるように、内部でキャッシュしています。文字を変えたいときは、直接 `textView.text` を変えるより `setText` を使うのがおすすめです。

### Image

```js
const image = new Image({
  source: assetManager.get("menuIcon"),
  width: 48,
  height: 48,
  imageType: "fit",
});
```

| `imageType` | 説明                                       |
| ----------- | ------------------------------------------ |
| `simple`    | 指定サイズに引き伸ばす                     |
| `fit`       | 画像全体が収まるように表示する             |
| `fill`      | 領域を埋めるように表示して、はみ出しを切る |
| `native`    | 画像本来のサイズで表示する                 |

## SpriteAnimation

`SpriteAnimation` は、横一列に並んだ画像を使ってアニメーションを再生するコンポーネントです。

```js
const animation = new SpriteAnimation({
  clips: {
    run: {
      image: assetManager.get("slimeRun"),
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 6,
      frameRate: 10,
      loop: true,
    },
  },
  initialClip: "run",
});

const slime = new GameObject("Slime", animation.sprite);
slime.addComponent(animation);
```

`animation.sprite` が実際に表示する画像です。`GameObject` の `view` に渡すことで、アニメーションを画面に出せます。

### アニメーションを切り替える

```js
animation.play("run");

animation.play("die", {
  onComplete: () => {
    slime.destroy();
  },
});
```

`loop: false` のアニメーションでは、最後のフレームまで再生されたあとに `onComplete` が呼ばれます。

## ObjectPool

`ObjectPool` は、オブジェクトを何度も作り直さずに再利用するための仕組みです。

弾や敵のように、たくさん出たり消えたりするものに使うと便利です。

```js
const bulletPool = new ObjectPool({
  createObject: () => createBullet(),
  onGet: (bullet) => {
    bullet.setActive(true);
  },
  onRelease: (bullet) => {
    bullet.setActive(false);
  },
  initialSize: 20,
});

const bullet = bulletPool.get();
bulletPool.release(bullet);
```

| メソッド                   | 説明                                     |
| -------------------------- | ---------------------------------------- |
| `get()`                    | プールから1つ取り出す                    |
| `release(object)`          | 使い終わったものをプールへ戻す           |
| `releaseInactiveObjects()` | `active` が `false` のものをまとめて戻す |
| `clear()`                  | プールの中身を空にする                   |

## Math の便利関数

`src/engine/math` には、数値計算でよく使う関数があります。

```js
import { clamp, lerp, remap } from "../engine/index.js";
```

| 関数                                         | 説明                                             |
| -------------------------------------------- | ------------------------------------------------ |
| `clamp(value, min, max)`                     | 数値を最小値から最大値の範囲に収める             |
| `clamp01(value)`                             | 数値を0から1の範囲に収める                       |
| `lerp(a, b, t)`                              | `a` から `b` の間をなめらかに変化させる          |
| `inverseLerp(a, b, value)`                   | 値が `a` から `b` の間でどの位置かを0から1で返す |
| `remap(value, inMin, inMax, outMin, outMax)` | ある範囲の値を別の範囲に変換する                 |

### HPバーの割合を求める例

```js
const rate = clamp01(currentHp / maxHp);
```

`currentHp` が `maxHp` より大きくても、`rate` は最大で `1` になります。

## よくある改造例

### 新しい移動コンポーネントを作る

```js
import { Component } from "../engine/index.js";

export class FloatMoveController extends Component {
  constructor({ speed = 80 } = {}) {
    super();
    this.speed = speed;
    this.time = 0;
  }

  tick(deltaTime) {
    this.time += deltaTime;
    this.transform.x += this.speed * deltaTime;
    this.transform.y += Math.sin(this.time * 4) * 2;
  }
}
```

このコンポーネントを弾や敵に付けると、少し上下に揺れながら右へ進みます。

### 新しい GameObject を作る

```js
import { CircleColliderComponent, GameObject } from "../engine/index.js";
import { FloatMoveController } from "./FloatMoveController.js";

export class FloatingEnemy extends GameObject {
  constructor({ view }) {
    super("FloatingEnemy", view);

    this.moveController = this.addComponent(new FloatMoveController({ speed: 80 }));
    this.collider = this.addComponent(new CircleColliderComponent({ radius: 18 }));
  }
}
```

`GameObject` を継承すると、そのオブジェクトに必要なコンポーネントをまとめて追加できます。

### シーンに表示する

```js
const enemy = new FloatingEnemy({ view: enemyView });
enemy.transform.x = 100;
enemy.transform.y = 100;

this.root.addChild(enemy.view);
```

`GameObject` を作っただけでは画面には出ません。表示したい場合は、シーンの `root` や描画レイヤーに `view` を追加します。

## 初心者向けの読み方

最初から全部を覚える必要はありません。おすすめの順番は次の通りです。

1. `GameObject` と `Component` を読む
2. `Transform` で位置を変える方法を試す
3. `InputSystem` でキー入力を読む
4. `ColliderComponent` と `CollisionSystem` で当たり判定を試す
5. `Scene` と `SceneManager` で画面切り替えを読む
6. UI や `AssetManager` を必要になったときに読む

ゲーム作りでは、「小さく作って、動かして、少しずつ足す」のが大事です。まずは1つのオブジェクトを表示して、右に動かすところから始めると理解しやすくなります。

## 関連ファイル

| ファイル                                    | 内容                     |
| ------------------------------------------- | ------------------------ |
| `src/engine/index.js`                       | エンジン機能のまとめ出口 |
| `src/engine/domain/GameObject.js`           | GameObject               |
| `src/engine/domain/Component.js`            | Component                |
| `src/engine/domain/Transform.js`            | Transform                |
| `src/engine/domain/ColliderComponent.js`    | 当たり判定               |
| `src/engine/infrastructure/InputSystem.js`  | 入力                     |
| `src/engine/infrastructure/Game.js`         | ゲームループ             |
| `src/engine/application/Scene.js`           | シーン                   |
| `src/engine/application/SceneManager.js`    | シーン管理               |
| `src/engine/application/CollisionSystem.js` | 当たり判定の比較         |
| `src/player/player.js`                      | GameObject の実例        |
| `src/player/playerMoveController.js`        | Component の実例         |
| `src/scenes/gameScene.js`                   | Scene の実例             |
