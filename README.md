# 察して。

> 空気を読んでください。

説明されていない状況を眺め、画面の中を直接タップしたり、あえて何もしなかったりして進む、スマートフォン向けの短編Webゲームです。Ver.0.1では5つの場面と、行動から変化する4つのパラメータによる診断結果を遊べます。

## 遊び方

1. タイトル画面の「はじめる」を押します。
2. 各場面をよく見て、気になる物やボタンをタップします。
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
| `npm run deploy` | `dist/`をCloudflare Workers Static Assetsへ公開 |
| `npm run typecheck` | TypeScriptのみ検査 |
| `npm test` | ゲーム進行と判定のテスト |

## 公開

Cloudflareアカウントを用意し、初回だけWranglerからログインします。

```bash
npx wrangler login
```

続いて、アプリをビルドしてCloudflare Workers Static Assetsへデプロイします。

```bash
npm run build
npm run deploy
```

`npm run build`が生成する`dist/`を、`wrangler.jsonc`のAssets設定に従って公開します。SPAフォールバックを有効にしているため、存在しないパスへのリクエストもアプリの`index.html`で処理されます。Workerのサーバーサイドスクリプトは使用しません。

## 構成

- `src/data/`: 場面の表示時間、選択肢、スコア設定
- `src/game/`: スコア計算と診断ロジック
- `src/components/`: 場面・イラスト・共通UI
- `src/App.tsx`: タイトルから結果までの進行管理

場面を追加するときは、まず `src/data/scenes.ts` にデータを加え、必要な見た目だけを `SceneArtwork.tsx` に追加します。開発方針の詳細は [`AGENTS.md`](./AGENTS.md) を参照してください。

## Ver.0.1の範囲

ユーザー登録、データベース、外部API、広告、課金、ランキングは使用していません。ゲーム内の結果は端末にも保存されません。
