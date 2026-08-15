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

### AI支援開発の進め方

GitHubを仕様・進捗・PR状態の唯一の正本として扱います。ChatGPT / Codexは作業開始前に [`AGENTS.md`](./AGENTS.md) と [`docs/current-plan.md`](./docs/current-plan.md) を確認してください。

- 役割分担と標準フロー: [`docs/development-workflow.md`](./docs/development-workflow.md)
- 現在地と次のタスク: [`docs/current-plan.md`](./docs/current-plan.md)
- 自律改善のルール: [`docs/autonomous-development.md`](./docs/autonomous-development.md)
- 低コスト自律改善キュー: [`docs/automation/low-cost-backlog.md`](./docs/automation/low-cost-backlog.md)
- ゲームの長期方針: [`docs/game-vision.md`](./docs/game-vision.md)
- 年代別モード: [`docs/age-modes.md`](./docs/age-modes.md)
- 改善評価基準: [`docs/evaluation-rubric.md`](./docs/evaluation-rubric.md)
- Rive導入ルール: [`docs/rive-guidelines.md`](./docs/rive-guidelines.md)

GitHub Actions の **AI Game Director v2 low-cost** は毎時preflightを行いますが、毎時OpenAI APIを呼ぶわけではありません。通常の毎時チェックはGitHub上のCI・未処理PR・低コストbacklogだけを確認し、API利用は最大4枠/日に制限します。定期AI実行には `gpt-5.6-luna` を使い、非Visualの厳格なallowlist内で1改善だけ実装・検査します。

定期実行の安全範囲を通った非Visual変更は、mainへ直接pushせずPRを作ってから自動反映できます。Visual / UI / Art / 問題内容 / 年代別シチュエーション / Image API / Secret / 課金等は定期自動反映の対象外です。手動 `analyze` / `implement` も残し、手動implementはDraft PRで止めます。

ユーザーがChatGPTとCodexの間で長い実行ログを手作業で中継することを標準運用にせず、コード・仕様・進捗・CI結果はGitHub上で確認できる状態を優先します。

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

画像生成はAPI料金とバイナリ差分を伴うため、GitHub Actionsの **Generate scene artwork** を必要なときだけ手動実行します。`push` やAI Game Directorの定期実行では自動実行しません。

1. GitHub Actions Secret に `OPENAI_API_KEY` を登録します。
2. **Generate scene artwork** を `workflow_dispatch` で手動実行します。
3. 生成結果は `generated-scene-art` artifact としてダウンロードします。
4. 人間が生成結果を確認した後、採用する画像だけを `public/scene-art/` へコピーし、通常の別コミットまたは別PRで反映します。

- ワークフロー: `.github/workflows/generate-scene-art.yml`
- プロンプト: `prompts/imagegen/`
- artifact生成先: `output/imagegen/scene-art/`
- アプリで使う採用画像: `public/scene-art/`

Actionsは生成画像を自動採用・自動pushしません。`OPENAI_API_KEY` はActions Secretから必要なCLIへだけ渡し、Vite/Reactのクライアント環境変数にはしません。`VITE_OPENAI_API_KEY` のような公開バンドルへ入るキーは作成しないでください。

## Ver.0.6の範囲

ユーザー登録、データベース、外部API、広告、課金、ランキングは使用していません。ゲーム内の結果は端末にも保存されません。
