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
- `src/App.tsx`: タイトルから結果までの進行管理

場面を追加するときは、まず `src/data/scenes.ts` にデータを加え、必要な見た目だけを `SceneArtwork.tsx` に追加します。開発方針の詳細は [`AGENTS.md`](./AGENTS.md) を参照してください。

### 場面画像の表示

通常は `public/scene-art/*.png` の生成済み画像を見た目として使います。操作判定は画像に埋め込まず、`SceneArtwork.tsx` のHTMLヒット領域で行います。生成PNGが読み込めない場合だけ `src/assets/scenes/*.svg` へ切り替わります。

### 場面画像の生成

画像生成はAPI料金とバイナリ差分を伴うため、GitHub Actionsの **Generate scene artwork** を必要なときだけ手動実行します。`push` やデプロイでは自動実行しません。

1. GitHub Actions Secret に `OPENAI_API_KEY` を登録します。
2. **Generate scene artwork** を `workflow_dispatch` で手動実行します。
3. 生成結果は `generated-scene-art` artifact としてダウンロードします。
4. 人間が5枚を確認した後、採用する画像だけを `public/scene-art/` へコピーし、通常の別コミットまたは別PRで反映します。

- ワークフロー: `.github/workflows/generate-scene-art.yml`
- プロンプト: `prompts/imagegen/`
- artifact生成先: `output/imagegen/scene-art/`
- アプリで使う採用画像: `public/scene-art/`

Actionsは `contents: read` のみで、生成画像を実行ブランチへ自動pushしません。`OPENAI_API_KEY` はActions Secretから画像生成CLIへだけ渡し、Vite/Reactのクライアント環境変数にはしません。`VITE_OPENAI_API_KEY` のような公開バンドルへ入るキーは作成しないでください。

## Ver.0.6の範囲

ユーザー登録、データベース、外部API、広告、課金、ランキングは使用していません。ゲーム内の結果は端末にも保存されません。
