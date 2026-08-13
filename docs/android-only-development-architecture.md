# Androidスマホだけで開発するためのアーキテクチャ

最終更新: 2026-08-13

この文書は、「察して。」をAndroidスマートフォンだけで継続開発するための正式なアーキテクチャ方針を定義します。

## 目的

PC専用エディタやデスクトップ常駐環境を必須にせず、ユーザーはAndroidスマホから以下だけを行える状態を目指します。

- ChatGPTへ目的・問題・OK / NGを伝える
- GitHub PRとCloudflare Previewを確認する
- 必要な承認・Secret・Billingだけ本人操作する

コード編集、テスト、ビルド、PR作成、Preview生成、ログ確認はクラウド側へ寄せます。

## 基本原則

1. GitHubを唯一の正本にする。
2. ローカルPCを必須にしない。
3. ユーザーがChatGPTとCodexのログを手作業で運ばない。
4. ブラウザ上で操作しにくい制作ツールを本番依存にしない。
5. アート制作も「PC専用GUIで手作業」を前提にしない。
6. すべての変更はPR → CI → Preview → 人間確認 → merge の順にする。
7. 失敗時に原因がGitHubへ残り、次のAI作業がそのまま継続できる構造にする。

## 指示系統

```text
ユーザー（Android）
  ↓ 目的 / 不満 / OK・NG
ChatGPT
  ↓ GitHubの最新状態を読む・仕様を更新
GitHub
  ↓ current-plan / task / issue / PR
Codex Cloud
  ↓ 実装・テスト・コミット・PR
GitHub Actions
  ↓ typecheck / test / build / visual checks
Cloudflare Preview
  ↓ 実機確認用URL
ユーザー（Android）
```

ユーザーは原則としてChatGPTとPreviewだけを見ればよい状態を目標とします。

## 各役割

### ユーザー

- 目的を決める
- 見た目・操作感のOK / NGを判断する
- 支払い、Secret、外部サービス認可など本人操作だけ行う

### ChatGPT

- GitHub上の `docs/current-plan.md` と関連PRを読む
- UX・ゲーム設計・アート方針・優先順位を決める
- 長く有効な判断をGitHub文書へ保存する
- PR / CI / Previewの状態をGitHubから直接確認する
- 次タスクをGitHubへ記録する

### Codex Cloud

- `AGENTS.md` / `README.md` / `docs/current-plan.md` を読む
- GitHub上の最新mainから作業する
- 指定範囲だけ変更する
- テスト・build・diff確認を行う
- PRを作る / 更新する
- `docs/current-plan.md` を更新する
- mainへ勝手にマージしない

### GitHub

- コード
- 設計
- タスク
- PR
- CIログ
- Artifacts
- 判断履歴

の正本です。

### GitHub Actions

スマホ側では重い処理を行わず、Actionsへ寄せます。

標準ゲート:

- npm run typecheck
- npm test
- npm run build
- git diff --check
- 必要に応じてPlaywright screenshot
- 必要に応じてvisual regression
- 画像 / アート生成を使う場合は回数・コスト上限・品質ゲートを先に定義

### Cloudflare

GitHub連携でブランチ / PRごとにPreviewを自動生成します。

ユーザーの主な確認手段はCloudflare Preview URLです。

## Androidだけで成立させるための技術選択

### ゲーム本体

React / TypeScriptを維持します。

理由:

- Codex Cloudで編集可能
- GitHub Actionsで自動検証可能
- Cloudflareで自動Preview可能
- Androidブラウザでそのまま実機確認可能

### アート / アニメーション

Rive EditorのようなPC操作を事実上要求するツールを「必須工程」にしません。

今後の標準は以下の優先順位で評価します。

1. コード生成可能なCanvas / SVG / WebGL / sprite構造
2. AIがGitHub上のアセットを生成・更新できる方式
3. ブラウザだけで編集可能で、Androidでも現実的に操作できる方式
4. PC専用GUIは任意の高度編集手段に留める

RiveはRuntime連携先としては候補に残せますが、Editor操作がAndroidだけで完結しない限り、制作パイプラインの必須要件にはしません。

## アート制作の新しい原則

これまでの検証から、以下を正式なルールとします。

- 1枚絵を後から無理に分解しない
- 生成画像をそのままゲーム部品へ分解する方式を標準にしない
- Codexに単純SVGを直接描かせただけで本番品質と判定しない
- キャラクター・背景・操作物は最初から独立レイヤー / オブジェクトとして設計する
- アート品質とゲーム構造を別々に合格判定する
- 人体やポーズが重要な場合、構造テストだけで採用しない

次のアート技術選定では「Androidだけで制作工程を継続できること」を必須条件にします。

## PR / Previewの標準運用

1. ChatGPTがGitHubの最新状態を確認する
2. 必要なら設計文書とcurrent-planを更新する
3. Codexは最新mainから新ブランチを作る
4. 実装
5. Actionsで自動検査
6. Cloudflare Preview生成
7. ユーザーがAndroidでPreviewを見る
8. NGならChatGPTへ短く指摘
9. ChatGPTがGitHubを直接読み、次の修正を決める
10. OKならユーザーがmerge

## ユーザーへ要求しない作業

標準フローでは以下を要求しません。

- PCを起動する
- ローカルgitを操作する
- ターミナルを開く
- Codexの長文ログをChatGPTへコピーする
- diffファイルを手動で運ぶ
- ビルド成果物を手動アップロードする
- PC専用アートEditorで必須作業を行う

## スマホだけで難しい作業への対処

スマホで操作できない外部ツールが必要になった場合、次の順に判断します。

1. そのツールを使わず同じ目的を達成できるか
2. API / CLI / GitHub Actions経由でAIに操作させられるか
3. ブラウザ版・モバイル対応代替があるか
4. 一度だけの外部作業で済むか
5. それでもPC必須なら、その方式自体を本番アーキテクチャ候補から外す

「便利だからPCツールを採用する」ではなく、「Androidだけで継続運用できるか」を採用条件にします。

## 自動化の到達目標

短期:

- ChatGPT → GitHub → Codex → PR → Cloudflare Preview を標準化
- ユーザーの役割をPreview確認とmerge中心へ縮小

中期:

- PRごとにスマホ解像度のスクリーンショットをArtifact化
- Preview URL / CI結果 / 変更概要をPR本文へ自動集約
- visual regressionを導入

長期:

- current-planの次タスクからCodex作業を開始しやすいIssue / workflow構造
- ステージ生成・検査・PreviewをGitHub Actionsへ統合
- ユーザーは「こうしたい」「これはNG」「これでOK」だけで開発を進められる状態

## 現時点の結論

Androidスマホだけでの開発は継続可能です。

限界は「コード開発」ではなく、PC専用GUIを必須にする制作工程です。

したがって今後は、アーキテクチャ側からPC専用必須工程を排除し、GitHub / Codex Cloud / GitHub Actions / Cloudflare Previewを中核に据えます。
