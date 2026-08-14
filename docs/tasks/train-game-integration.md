# Train Pixi 本番ゲーム統合

最終更新: 2026-08-14

## 目的

PR #39でAndroid実機確認済みとなった電車PixiJS Prototypeを、5場面ゲームの1場面目 `train` に組み込みます。

## 実装方針

- `src/data/scenes.ts` の既存アクションID・採点値・待機時間は変更しない。
- 電車場面だけ `TrainPixiPrototype` をembeddedモードで利用する。
- `bag-lap` / `bag-floor` はPixiJSの既存sceneRoot座標、grab offset、drop判定をそのまま利用する。
- `stand` は左側の着席人物をタップするPixiJS hit areaから既存アクションへ接続する。
- `wait` は既存 `GameScene` のタイマーに任せる。
- 行動確定後は既存のreaction表示、スコア計算、履歴、次場面への遷移へ戻す。
- Prototype単体URLは回帰確認用として残す。
- 承認済み `train-before.png` / `train-after.png` / `train-bag.png` は再生成・加工しない。

## 回帰基準

- バッグを触った瞬間にジャンプしない。
- 掴んだ位置とのoffsetを保って指へ追従する。
- LAP / FLOORの両方を判定できる。
- Before→Afterのsettle/crossfadeが動く。
- 320〜430px程度の縦画面で構図が崩れない。
- 既存の `stand` / `wait` も選択として残る。
- 電車の行動が既存のスコア・履歴へ反映され、2場面目へ進む。

## 現在の実装ブランチ

`integrate-train-pixi-game`

変更対象は主に以下です。

- `src/components/GameScene.tsx`
- `src/prototypes/TrainPixiPrototype.tsx`
- `src/styles.css`

## マージ前確認

- `npm run typecheck`
- `npm test`
- `npm run build`
- Cloudflare Preview成功
- Android実機でタイトル→電車→操作→反応→2場面目まで通す
- バッグLAP / FLOOR、人物タップstand、時間切れwaitを最低1回ずつ確認

mainへはPreviewとAndroid確認後にのみマージします。
