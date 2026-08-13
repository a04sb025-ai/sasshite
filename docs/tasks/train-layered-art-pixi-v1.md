# Train Layered Art + PixiJS v1

## 目的

電車ステージで、PixiJSの操作性を維持しながら、本番候補レベルの絵品質を成立させる最小実験を行う。

今回の前提:

- PixiJS Prototype v1で、Android上の1024×1536共通座標・バッグのドラッグ・ドロップ・Before→After切替は成立した。
- PixiJSの図形描画で人物を作る方式はアート品質不足のため採用しない。
- 絵を作る工程と、ゲームとして動かす工程を分離する。

## 採用する構造

### Before

- 高品質な完成背景画像: 電車内 + Player座り + NPC立ち
- 動かせるバッグだけを独立透過素材として上に重ねる
- Before背景には、操作対象バッグを焼き込まない

### After

- 高品質な完成背景画像: 電車内 + Player座り + NPC座り
- バッグは成功条件に応じて別レイヤーとして表示するか、After背景へ自然に含める
- Beforeと同一のカメラ、構図、色、人物同一性を維持する

### PixiJSの責務

- 1024×1536共通座標
- バッグのpointer hit area
- drag / drop
- drop zone判定
- 指追従
- 正解時の短い演出
- Before→After切替
- リセット
- Android向けレスポンシブ縮小

PixiJSで人物の顔・身体・服を図形描画しない。

## アート生成方針

### 最重要

BeforeとAfterを別々の自由生成で作らない。

1. まずBeforeの基準完成絵を1枚だけ合格させる。
2. そのBeforeを入力画像としてAfterをeditベースで作る。
3. Afterでは「立っていたNPCを空いた席へ座らせる」以外の構図変更を極小化する。
4. Player、NPC、車内、カメラ、色、光、線、遠近を維持する。
5. バッグは最初から独立した透明素材として用意する。

## バッグ素材

- 透過PNGまたはWebP
- 背景・座席・人物・床・固定影を含めない
- Before背景に置いた時に自然な大きさ・向き
- PixiJS上で座席→ドラッグ→正解位置へ移動しても破綻しない
- 位置合わせはscene configの座標で行い、CSS top/leftへ逃げない

## Scene config

電車固有の配置情報はコードへ散らさず、scene configとしてまとめる。

最低限:

- canvas: 1024×1536
- beforeBackground
- afterBackground
- bagSprite
- bagStartPosition
- bagAnchor
- dropZones
- successTransition

今後ほかのステージでも同じ構造を再利用できること。

## 成功演出

本番候補の最小演出:

1. バッグを正解位置へドロップ
2. 100〜200ms程度のsettle
3. Before背景からAfter背景へ短いクロスフェード
4. 必要ならNPCが座ったことが視覚的に分かる軽いscale/opacity変化
5. After状態を固定

長いアニメーションや人体リグは今回不要。

## 品質ゲート

### Before画像

- 一目で電車内と分かる
- Playerが自然に座っている
- NPCが自然に立っている
- バッグが置かれる隣席が明確
- 人体破綻なし
- 首・手足・接地が自然
- 小さいAndroid画面でも状況が読み取れる

### After画像

- Beforeと同じPlayer・NPCに見える
- NPCが自然に着席している
- Beforeとのカメラ・背景・色の変化が最小
- 空いた席を譲ったという結果が直感的に分かる
- 画像切替時に別ステージへ飛んだように見えない

### Bag

- 背景混入なし
- 透過周辺に残像なし
- 独立して動かしても不自然でない
- タッチターゲットを十分大きくできる

## コスト制御

- まずBefore基準絵だけを生成・選定する。
- Before不合格の状態でAfterやバッグを大量生成しない。
- Before合格後にAfter editとバッグ素材を作る。
- 生成物はGitHubへ固定資産として保存し、runtimeでImage APIは呼ばない。
- 失敗時は原因を分類してから再生成し、同じプロンプトの連打をしない。

## 今回の実装範囲

第一段階では、既存の仮画像を使ってこのアーキテクチャへPixiJS Prototypeを整理してもよい。

ただし本番アート生成に入る前に、次を先に実装・確認する:

- Before / Afterを背景Spriteとして切り替える構造
- Bagを独立Spriteとして保持する構造
- scene config化
- crossfade
- Android Preview

この段階のImage API呼び出しは0回とする。

## 変更禁止

- 本番GameSceneへの統合
- 採点ロジック
- 問題データ
- 他ステージ
- Cloudflare設定
- Rive導入

## 完了条件

- AndroidでBefore背景 + 独立Bagを表示できる
- Bagをドラッグできる
- 正解ドロップでAfter背景へ自然に遷移する
- resetでBeforeへ戻る
- 人物はPixiJS図形で描画しない
- scene configで主要座標を管理する
- 1024×1536を唯一の論理座標とする
- Image API 0回
- 本番ゲーム未接続

## 次段階

上記構造が合格後、Before基準アート1枚の制作へ進む。Beforeが目視合格してからのみAfter editとBag素材を生成する。
