# 察して。

> 空気を読んでください。

説明されていない状況を眺め、画面の中の物を直接タップ・ドラッグしたり、あえて何もしなかったりして進む、スマートフォン向けの短編Webゲームです。Ver.0.6では5つの場面を通して、正解数ではなく行動に表れた「察し方のクセ」を振り返れます。

## 遊び方

1. タイトル画面の「はじめる」を押します。
2. 各場面をよく見て、気になる物やボタンに触れます。物は自然に思える場所へドラッグできます。
3. 何もしないことも選択です。しばらく待つと次の場面へ進みます。
4. 5つの場面が終わると、称号と診断結果が表示されます。

詳しい正解はありません。自分なりに察してみてください。

## 開発

必要環境: Node.js 20以降

```bash
npm install
npm run dev
```

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | TypeScriptの検査後、配信用ファイルを生成 |
| `npm run deploy` | `dist/` をCloudflare Workers Static Assetsへ公開 |
| `npm run typecheck` | TypeScriptのみ検査 |
| `npm test` | ゲーム進行と判定のテスト |

## 公開

`npm run build` で生成される `dist/` を、Cloudflare Workers Static Assetsとして公開します。設定は `wrangler.jsonc` にあり、SPA用のフォールバックも有効にしています。Workerのサーバーサイドスクリプトは使用しません。

ローカルから初回デプロイする場合は、Cloudflareへログインしてからビルド・デプロイします。

```bash
npx wrangler login
npm run build
npm run deploy
```

CloudflareのGit連携を使う場合は、ビルドコマンドを `npm run build`、デプロイコマンドを `npx wrangler deploy` に設定します。

## 構成

- `src/data/`: 場面の表示時間、行動、内部スコア設定
- `src/game/`: スコア計算と診断ロジック
- `src/components/`: 場面・イラスト・共通UI
- `src/assets/scenes/`: 操作座標と同じ420×620座標系を使う場面背景
- `src/App.tsx`: タイトルから結果までの進行管理

場面を追加するときは、まず `src/data/scenes.ts` にデータを加え、背景を `src/assets/scenes/`、直接触れる物やボタンを `SceneArtwork.tsx` に追加します。開発方針の詳細は [`AGENTS.md`](./AGENTS.md) を参照してください。

### 場面画像と操作レイヤー

Ver.0.6のゲーム画面は、**固定座標のSVG背景 + 独立した操作オブジェクト**で構成します。

- 背景SVGはすべて `viewBox="0 0 420 620"` を基準にします。
- バッグ、唐揚げ、紙くずなど、動かせる物は背景画像へ焼き込まず `SceneArtwork.tsx` 側で描画します。
- 見えているオブジェクトそのものをタップ・ドラッグ対象にし、別の透明ヒット領域は重ねません。
- エレベーター、会議、終了などの操作ボタンも、見えるUIとして同じ座標系に配置します。
- 画面幅が変わっても背景と操作物が一緒に拡大縮小されるため、画像とタップ位置を別々に補正しません。

### スマートフォン表示

`index.html` では `width=device-width, initial-scale=1, viewport-fit=cover` を指定します。ゲーム画面は最大430px幅・100dvhを基準にし、場面は通常最大360px幅、狭い/低い画面ではさらに縮小します。主要操作は44px以上を維持します。

### 生成画像について

`public/scene-art/*.png` と画像生成ワークフローは、今後の背景案・アート検討用として残しています。ただし、**現在の操作ゲーム画面では生成PNGを直接の操作背景に使いません**。1枚PNGへ操作対象まで焼き込むと、画像とヒット領域が別座標になりやすいためです。

画像生成はAPI料金とバイナリ差分を伴うため、GitHub Actionsの **Generate scene artwork** を必要なときだけ手動実行します。`push` やデプロイでは自動実行しません。

1. GitHub Actions Secret に `OPENAI_API_KEY` を登録します。
2. **Generate scene artwork** を `workflow_dispatch` で手動実行します。
3. 生成結果は `generated-scene-art` artifact としてダウンロードします。
4. 人間が確認し、背景案として採用する場合も操作対象を背景へ焼き込まない構成に分けて反映します。

- ワークフロー: `.github/workflows/generate-scene-art.yml`
- プロンプト: `prompts/imagegen/`
- artifact生成先: `output/imagegen/scene-art/`
- 既存の生成画像: `public/scene-art/`

Actionsは `contents: read` のみで、生成画像を実行ブランチへ自動pushしません。`OPENAI_API_KEY` はActions Secretから画像生成CLIへだけ渡し、Vite/Reactのクライアント環境変数にはしません。`VITE_OPENAI_API_KEY` のような公開バンドルへ入るキーは作成しないでください。

## Ver.0.6の範囲

ユーザー登録、データベース、外部API、広告、課金、ランキングは使用していません。ゲーム内の結果は端末にも保存されません。
