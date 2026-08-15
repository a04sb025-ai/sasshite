# 自律開発フロー

この文書は、Codex / ChatGPTが「察して。」を継続的に改善し、公開品質へ近づける標準ループと安全境界を定義します。

## 目的

ユーザーが毎回、実装できる粒度まで仕様を書かなくても、次の循環をAI側で進めます。

ユーザーの目的・感想 → 毎時の無料preflight → 必要なときだけAI改善 → 自動検査 → 評価 → 安全範囲ならPR経由で反映 / Visual等は人間確認 → 次の改善

ユーザーの主な役割は、方向性、好み、OK / NG、時々の実機感想です。

## AI Game Director v2 low-cost

自律改善は同じモデルが担当しても、Director / Reviewer / Engineer / Evaluator の判断段階を分離します。

### Director

- 最新main、open PR、`docs/release-readiness.md`、`docs/automation/low-cost-backlog.md` を読む。
- 通常の手動実行では公開品質への改善余地を最大3件比較する。
- 低コスト定期実行では、preflightが指定したbacklog項目またはCI修復だけを扱う。

### Reviewer

- `docs/evaluation-rubric.md` と公開品質ゲートに沿って現状を評価する。
- 問題、仮説、成功条件、回帰条件を実装前に明示する。

### Engineer

- 1サイクル1目的を守る。
- 必要最小限の変更とテストを行う。
- 高リスク領域へ踏み込まない。

### Evaluator

- 変更前後を同じ基準で比較する。
- `typecheck` / `test` / `build` を通す。
- 改善と合理的に判断できない変更は残さない。

## 実行方法

`.github/workflows/ai-game-director.yml` が実行正本です。

### 毎時preflight

GitHub Actionsは毎時起動します。ただし、このpreflight自体はOpenAI APIを呼びません。

毎時確認するもの:

- AI Game Director由来の未処理PRが残っていないか
- mainの最新CIが成功しているか
- `docs/automation/low-cost-backlog.md` に未完了項目があるか
- 今がAI実行を許可する時間帯か

これにより「毎時見張っている」状態を維持しながら、毎時間AI料金を発生させません。

### 定期AI実行の上限

定期AI実行を許可するのは、日本時間の **03:00 / 09:00 / 15:00 / 21:00 頃**の4枠だけです。

つまり、毎時24回preflightしても、OpenAI APIを呼ぶ可能性があるのは最大4回/日です。さらに次の場合はその枠でもAPIを呼びません。

- AI Game DirectorのPRが未処理
- main CIが実行中
- main CIが成功していて、低コストbacklogが空

定期実行では `gpt-5.6-luna` と low reasoning を使います。目的を1件に絞り、必要なファイルだけ読むことでtoken消費も抑えます。

### 定期実行の対象

自動公開候補は、純粋ロジック・テスト・安全ポリシーのごく狭い範囲に限定します。

主な許可範囲:

- `src/game/**`
- `src/data/scenePresentationPolicy.ts`
- `src/data/scenePresentationPolicy.test.ts`
- `docs/current-plan.md`
- `docs/automation/low-cost-backlog.md`

定期実行で変更しないもの:

- React画面 / components
- CSS
- 画像 / public assets
- PixiJS等のVisual prototype
- 問題本文、年代別シチュエーション
- App全体の進行UI
- Secret / API key
- workflow / 依存 / Cloudflare設定
- 課金、広告、外部送信、ユーザーデータ

### 定期実行の反映方法

定期実行で変更ができた場合もmainへ直接pushしません。

1. 専用branchを作る。
2. `typecheck` / `test` / `build` を実行する。
3. 最新mainへrebaseする。
4. もう一度 `typecheck` / `test` / `build` を実行する。
5. 厳格なファイルallowlistを通った場合だけPRを作る。
6. 検証後にmainが動いていなければ、そのPRをsquash mergeする。
7. 検証後にmainが動いていた場合は自動mergeせずPRを残す。

この経路なら、以前の「botがmainへ直接pushし続ける」状態には戻しません。

### 手動 analyze

コードを変更せず、改善候補と仮説だけを出します。

手動実行ではモデルを選べます。

- `economy`: `gpt-5.6-luna` / low reasoning
- `balanced`: `gpt-5.6-terra` / medium reasoning

### 手動 implement

1件だけ実装します。安全ゲートを通った候補は専用ブランチへ保存し、**Draft PRを自動作成します。mainへは自動反映しません。**

大きな判断、UI、Visual、ゲーム内容の変更はこの人間確認ルートを使います。

## Visual / Artの安全境界

プレイヤーが見る場面の絵は、コードテストだけでは品質判定できません。

- CSS / HTML / SVGの丸・矩形・疑似要素等で人物や背景を組み立てた仮絵を、本番アートとして採用しない。
- 人間が目視合格したローカル画像アセットがない場面を、Game Directorが文章選択から画像内操作へ自動昇格させない。
- Visual変更は通常のChatGPT / Codex作業として別PRで扱い、Cloudflare PreviewをAndroidで確認する。
- Image APIを使う場合も、生成回数・品質基準・採用素材を人間確認し、失敗素材を反復生成してコストを消費しない。
- 定期実行からImage APIを呼ばない。

Game Directorの安全ゲートでは、components、styles、scene assets、prototypes、public assets等のVisual制作領域を変更禁止にします。

## 自動マージについて

自動マージは、低コスト定期実行かつ厳格なallowlistを通った非Visual・低リスク変更だけに限定します。

Visual、UI、問題内容、年代別コンテンツ、Secret、課金、外部送信、workflow、依存、Cloudflare設定は自動マージ対象にしません。

通常の手動implementはDraft PRを経由します。

## コスト制御

コスト制御は「モデル単価」だけでなく「起動回数」と「探索範囲」の両方で行います。

- 毎時preflight: OpenAI API 0回
- 定期AI: 最大4回/日
- 定期AIモデル: `gpt-5.6-luna`
- reasoning: low
- 1実行1改善
- 未処理PRがあれば次のAI実行を止める
- backlogが空ならAIを起動しない
- Image APIの自動利用は禁止
- 高コストモデルは定期実行で使わない

APIのプロジェクト側予算上限は、このリポジトリの安全ゲートとは別の最終防衛線として設定することを推奨します。

## 人間承認を残す領域

- Secret / API key / 権限
- 課金・広告
- 個人情報・ユーザーデータ保存
- 外部へのデータ送信
- 子ども向け安全設計の緩和
- 大規模なゲーム目的・世界観変更
- 高額または反復的な画像/API利用
- Visual / Artの採用判断
- デプロイ基盤やworkflowの破壊的変更
- 問題本文・年代別シチュエーションの採用判断

## 公開品質への成長

AIは単に機能を増やすのではなく `docs/release-readiness.md` の未達を減らします。

優先順位は原則として次です。

1. ゲームが最後まで正常に遊べる
2. 初見理解と操作感
3. 結果・スコア・リプレイ性
4. スマホ安定性
5. 年代別モードとコンテンツ量
6. 子ども向け品質
7. 細かな演出・磨き込み

公開判定は `NOT_READY` / `PREVIEW_READY` / `PUBLIC_READY` の3段階で扱います。

## 問題生成ループ

ゲーム本体の改善とシチュエーション生成は分離します。問題生成は少量バッチで行い、年代適合、重複、迷いの質、安全性、操作可能性を確認してから採用します。

問題生成・アート生成は低コスト定期実行の対象外です。

## ユーザーが介入したとき

ユーザーの最新の明示指示を最優先します。「これは違う」「この方向にしたい」「ここは触らないで」といったフィードバックは、次回以降の自律改善ルール・優先順位へ反映します。
