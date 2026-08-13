# Current Plan

最終更新: 2026-08-14

この文書は、察して。の「いま何をしているか」「次に何をするか」の正本です。ChatGPT / Codexは、新しい作業を始める前に必ず確認してください。

## 現在地

Layered Art + PixiJS Prototype v1を実装し、ローカルのtypecheck・test・buildで構造を確認しました。Android Previewでの実機確認はPR作成後の次の品質ゲートです。

- Before / Afterを別々の背景Spriteとして読み込む。
- バッグを独立した透過Spriteとして表示し、指でドラッグする。
- `1024 × 1536`、アセットパス、バッグ座標、drop zone、settle / crossfade時間をscene configへ集約する。
- 正解時は150ms settle後、260ms crossfadeでAfterへ移る。
- resetでBefore背景、バッグ位置、操作状態を復元する。
- 人物は仮SVGアセット内に描き、PixiJS Graphicsでは生成しない。
- 本番ゲーム、採点、問題データへは接続していない。
- Image APIは呼び出していない。
- Android縦画面向けにCanvas表示を4:5へcropし、バッグ、乗客、座席、移動先を残しながら、見出し・ゲーム本体・操作ボタンを1画面内で確認しやすい高さへ圧縮した。

次の判定はAndroid Preview上で、表示の自然さ、指追従、背景切替時のサイズ・座標・倍率不変、resetを確認することです。

Androidスマホ上で **PixiJS Prototype v1** を実機確認し、次を確認できました。

- `1024 × 1536` の共通論理座標をAndroid画面へ縮小表示できる。
- バッグを独立オブジェクトとして指でドラッグできる。
- 指追従とドロップ判定が成立する。
- 正解ドロップからBefore→After状態へ遷移できる。
- PixiJS Runtime自体は今回の電車ステージ用途で実用候補になる。

一方、Afterの乗客をPixiJSの丸・矩形等の仮図形で描く方式は、人体・アート品質が本番水準に届かないため不採用とします。

今後は **「アートを作る工程」と「ゲームとして動かす工程」を分離**します。

- 高品質なBefore / After完成絵は画像アセットとして用意する。
- 操作対象のバッグは独立透過Spriteとして用意する。
- PixiJSは描画エンジン・共通座標・ドラッグ・判定・遷移・演出だけを担当する。
- PixiJSで人物の顔・身体・服を図形描画しない。

詳細な次タスクは [`docs/tasks/train-layered-art-pixi-v1.md`](./tasks/train-layered-art-pixi-v1.md) を正本とします。

## 決定済みの原則

- GitHubを唯一の正本にし、PR → CI → Preview → Android確認 → mergeの順を守る。
- PC専用GUIを本番制作パイプラインの必須工程にしない。
- Androidスマホをユーザーの指示・確認・承認端末とし、重い開発作業はクラウドへ寄せる。
- 1枚絵を後から人物・小物へ無理に分解する方式は採用しない。
- アート品質とゲーム構造を別々に判定する。
- PixiJSはゲーム操作・座標・描画・遷移を担当し、人物アートをコード図形で生成しない。
- BeforeとAfterを別々の自由生成で作らない。Beforeを基準にAfterをeditベースで作る。
- 操作対象は最初から独立アセットとして設計する。
- Image APIを反復試行の主工程にしない。
- Prototypeの合格前に本番ゲーム、採点、他ステージへ組み込まない。

## 次のタスク

### Layered Art + PixiJS Prototype v1 Android確認

Codexは最初に以下を読んでください。

- `AGENTS.md`
- `README.md`
- `docs/current-plan.md`
- `docs/android-only-development-architecture.md`
- `docs/tasks/train-layered-art-pixi-v1.md`
- 現在の `/prototypes/train-pixi-v1` 関連実装

PRのCloudflare PreviewをAndroidで開き、今回組み込んだ最終構造候補を実機確認します。

- Before背景と独立Bagが自然に表示されるか。
- Bagが指へ追従し、床への正解ドロップが成立するか。
- 150ms settle後のBefore→After crossfadeが自然か。
- 切替時にCanvasサイズ・座標・表示倍率が変わらないか。
- resetでBeforeとバッグ初期位置へ戻るか。

この段階では既存画像または無料の仮素材を使い、**Image APIは0回**とします。

### 合格条件

- AndroidでBefore背景 + 独立Bagが自然に表示される。
- Bagを指でドラッグできる。
- 正解ドロップでAfter背景へ自然に切り替わる。
- Before / After切替時にCanvasサイズ・座標・表示倍率が変わらない。
- resetが機能する。
- scene configに主要座標が集約される。
- Player / NPCをPixiJS図形で描かない。
- 本番ゲームへ接続しない。
- Image API 0回。

### 合格後の次段階

このPrototype構造がAndroidで合格したあとに限り、**Before基準アート1枚**の制作へ進みます。

Before画像が目視で本番候補として合格するまで、After画像やBag画像を大量生成しません。

Before合格後:

1. Beforeを参照してAfterをeditベースで生成する。
2. 同じデザインのBag透過素材を生成する。
3. PixiJS Prototypeへ差し替える。
4. AndroidでBefore→drag→Afterを目視確認する。
5. 合格後に初めて本番統合を検討する。

## このタスクではまだやらないこと

- PixiJS Prototypeの本番ゲームへの統合
- 本番用アートのImage API生成
- 採点、問題データ、他ステージの変更
- Rive / Spine / Live2DなどPC専用Editorを前提にする工程
- mainへの自動マージ

## 完了したこと

- Layered Art + PixiJS Prototype v1で、Before / After背景Sprite、独立Bag Sprite、scene config、settle + crossfade、resetを実装した（Android Preview確認待ち）。
- 仮素材はローカルSVGのみで用意し、Image APIを呼び出さず、人物のPixiJS Graphics描画を削除した。

- Rive Player最小実験の契約と品質ゲートを文書化したが、PC専用Editorを標準工程にしない方針へ移行した。
- Androidスマホだけで開発を継続する正式アーキテクチャを [`docs/android-only-development-architecture.md`](./android-only-development-architecture.md) に定義した。
- PixiJS Prototype v1を実装し、Androidで共通座標、バッグドラッグ、ドロップ判定、Before→After状態遷移が成立することを確認した。
- PixiJSのコード図形による人物アートは品質不足と判断し、本番候補から外した。
- 高品質完成絵 + 独立操作Sprite + PixiJSというレイヤード方式を次の本命として定義した。

## 完了時の更新ルール

作業を完了したCodexは、この文書の「現在地」「次のタスク」「完了したこと」を更新してください。

ChatGPTは次の作業を決める前にGitHub上のこの文書と関連PRを確認します。
