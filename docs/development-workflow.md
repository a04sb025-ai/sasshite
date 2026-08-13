# AI支援開発フロー

この文書は、察して。の開発で ChatGPT / GitHub / Codex / React / Rive の役割を分離し、ユーザーが会話内容や実装結果を手作業で中継する回数を減らすための運用ルールです。

## 原則

GitHub を唯一の正本（source of truth）とします。

会話履歴だけに仕様・進捗・判断理由を残さず、長く有効な情報はリポジトリへ保存します。

役割は次のように分けます。

- ユーザー: 目的、好み、OK / NG、最終判断
- ChatGPT: 企画、UX、設計、優先順位、PR・差分のレビュー、次タスクの決定
- GitHub: コード、仕様、進捗、PR、CI結果、判断履歴の正本
- Codex: GitHub上の仕様を読み、実装、テスト、コミット、PR更新を行う実装担当
- React: ゲーム進行、入力、採点、Rive Runtimeとの接続
- Rive: キャラクターアート、リグ、ポーズ、アニメーション、状態遷移
- GitHub Actions: typecheck、test、build、必要な生成・品質検査
- Cloudflare Preview: スマートフォンでの最終目視確認

## 標準フロー

1. ユーザーが ChatGPT に目的または問題を伝える。
2. ChatGPT は GitHub の最新 main、関連PR、`docs/current-plan.md`、必要な設計文書を確認する。
3. 仕様変更が長く有効なら、まず GitHub の文書へ反映する。
4. 実装タスクは `docs/current-plan.md` の「次のタスク」と受け入れ条件を更新してから開始する。
5. Codex は `AGENTS.md`、`README.md`、`docs/current-plan.md`、タスクに関連する設計文書を読んでから実装する。
6. Codex は指定範囲だけ変更し、typecheck / test / build / diff check を実施する。
7. 実装後、Codex は `docs/current-plan.md` の進捗を更新する。大きな仕様判断を会話だけに残さない。
8. GitHub PRを作成し、GitHub Actions と Cloudflare Preview を通す。
9. ChatGPT は GitHub上のPR、変更ファイル、CI結果を直接確認する。ユーザーにCodexログのコピペを要求することを標準フローにしない。
10. ユーザーは原則としてPreviewを見て「OK / NG / 気になる点」を返す。
11. OK後のみmainへマージする。

## Codexへの標準依頼

毎回長大な会話履歴を渡すのではなく、原則として次の形にします。

> AGENTS.md、README.md、docs/current-plan.md、current-planから参照されている設計文書を最後まで読んでください。現在の「次のタスク」を受け入れ条件どおり実装してください。変更範囲を守り、必要なテストを実施し、current-planを更新してください。mainへは勝手にマージしないでください。

個別タスクで追加条件がある場合だけ補足します。

## PRの単位

1つのPRは原則1目的とします。

例:

- Rive Runtime導入
- Playerリグのプロトタイプ
- 電車ステージのバッグドラッグ
- アート素材更新

画像生成経路、ゲームロジック、UI改善を無関係に1PRへ混ぜません。

PR作成前に、変更予定ファイルと実差分ファイルが一致していることを確認します。

## Visual / Artの確認

アートはコードテストが通っただけでは採用しません。

標準順序:

1. 基準アートを確認
2. リグまたは素材化
3. PreviewでBefore / After確認
4. モバイル実機相当で確認
5. 合格後にゲームへ統合

画像生成APIを使う場合は、生成経路の実装と素材採用を別工程にします。失敗素材を修正するためにAPIを反復実行する前に、原因・品質ゲート・コストを確認します。

## Riveを使う場合

Rive Editor / `.riv` はアートとアニメーションの責務を持ち、Reactはゲームルールを持ちます。

Reactからは、可能な限り意味的な状態だけを渡します。

例:

- `bagPosition = seat | lap | floor`
- `npcPose = standing | seated`
- `success = true | false`

React側で腕・脚の座標を直接調整しない方針です。

Riveファイルを更新した場合も、Riveの状態名・入力名・用途を `docs/rive-guidelines.md` に記録します。

## ユーザーに依頼する作業

ユーザーへ依頼するのは、可能な限り次に限定します。

- Previewを見てOK / NGを判断する
- Rive Editorなど、接続されたツールから直接操作できない作業を行う
- Secret / billing / 外部サービスの本人操作が必須な設定

Gitの差分確認、PRの状態確認、GitHub Actionsログ確認は、可能な限りChatGPT / Codex / GitHubで完結させます。

## 禁止する進め方

- CodexのローカルGit状態を唯一の正本として扱う
- 古いmainを基準に差分を判断する
- ユーザーがCodexの長い実行結果を毎回ChatGPTへコピーすることを前提にする
- 失敗した生成物をCSSの微調整だけで延命する
- Preview確認前にmainへマージする
- 会話で決めた重要仕様をGitHubに残さない
