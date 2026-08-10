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

### 場面画像の生成

場面画像は、GitHub Actionsの **Generate scene artwork** を手動実行して生成できます。リポジトリのActions secretに `OPENAI_API_KEY` を登録してから実行すると、共通の主人公リファレンスを作り、その人物を参照して5場面を生成します。画像生成にはAPI利用料金が発生します。

- ワークフロー: `.github/workflows/generate-scene-art.yml`
- プロンプト: `prompts/imagegen/`
- 生成先: `public/scene-art/`

画像生成用のワークフロー・プロンプト・CLIを変更したブランチでは一度だけ自動実行され、それ以外は手動実行です。APIキーは画像生成時だけ使用し、Viteの環境変数や公開アプリには渡しません。生成画像はActionsのartifactでも確認でき、成功時は実行したブランチへコミットされます。

## Ver.0.6の範囲

ユーザー登録、データベース、外部API、広告、課金、ランキングは使用していません。ゲーム内の結果は端末にも保存されません。
