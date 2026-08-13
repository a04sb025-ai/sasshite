# Current Plan

最終更新: 2026-08-14

この文書は、察して。の「いま何をしているか」「次に何をするか」の正本です。ChatGPT / Codexは、新しい作業を始める前に必ず確認してください。

## 現在地

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

### Layered Art + PixiJS Prototype v1

Codexは最初に以下を読んでください。

- `AGENTS.md`
- `README.md`
- `docs/current-plan.md`
- `docs/android-only-development-architecture.md`
- `docs/tasks/train-layered-art-pixi-v1.md`
- 現在の `/prototypes/train-pixi-v1` 関連実装

今回の実装目的は、**本番アートをまだ生成せずに**、次の最終構造をPixiJS Prototypeへ組み込むことです。

- Beforeを1枚のbackground Spriteとして扱う。
- Afterを1枚のbackground Spriteとして扱う。
- Bagだけを独立Spriteとして扱う。
- 主要座標・アセット・drop zoneをscene configへまとめる。
- 正解時は短いsettle後、Before→Afterをcrossfadeする。
- resetでBeforeへ戻る。
- 人物をPixiJS Graphicsで描画しない。
- 1024×1536を唯一の論理座標とする。
- Android Previewで操作する。

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

- Rive Player最小実験の契約と品質ゲートを文書化したが、PC専用Editorを標準工程にしない方針へ移行した。
- Androidスマホだけで開発を継続する正式アーキテクチャを [`docs/android-only-development-architecture.md`](./android-only-development-architecture.md) に定義した。
- PixiJS Prototype v1を実装し、Androidで共通座標、バッグドラッグ、ドロップ判定、Before→After状態遷移が成立することを確認した。
- PixiJSのコード図形による人物アートは品質不足と判断し、本番候補から外した。
- 高品質完成絵 + 独立操作Sprite + PixiJSというレイヤード方式を次の本命として定義した。

## 完了時の更新ルール

作業を完了したCodexは、この文書の「現在地」「次のタスク」「完了したこと」を更新してください。

ChatGPTは次の作業を決める前にGitHub上のこの文書と関連PRを確認します。
