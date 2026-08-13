# Rive Player 最小実験

## 目的

Riveを本格導入する前に、Player 1体だけで「本番に使いたい品質のアート」と「同一キャラクターの自然な standing / seated」が成立するかを最小コストで検証する。

## 前提

- `AGENTS.md`
- `README.md`
- `docs/current-plan.md`
- `docs/development-workflow.md`
- `docs/rive-guidelines.md`

を最初に読むこと。

## 今回やること

1. Rive導入に必要な最小構成を調査し、このリポジトリでの検証方法を提案する。
2. Player 1体だけを対象にする。
3. standing / seated を同一人物として扱えるリグ設計を定義する。
4. Reactは身体パーツ座標を持たず、意味的な状態だけをRiveへ渡す設計を維持する。
5. 無料範囲で検証し、有料契約が必要になる前に停止して報告する。
6. 本番ゲーム、採点、他ステージ、バッグ、NPCは変更しない。
7. 実装または検証を行ったら `docs/current-plan.md` を更新する。

## アート品質ゲート

採用候補になるPlayerは、既存SVG Prototypeより明確に高品質であること。

最低条件:

- 頭・首・胴・左右の腕・左右の脚・靴の構造が自然
- 首が浮かない
- standing / seated の両方で脚が2本自然に見える
- 座ったときに骨盤・太腿・膝・すね・靴の接続が自然
- standing / seated で同一人物に見える
- スマートフォン幅でも顔・姿勢が読める

コードテストが通っただけではアート合格にしない。

## 今回やらないこと

- 電車ステージ全体のRive化
- バッグのドラッグ
- NPC
- 採点変更
- 他ステージ
- Image APIの反復実行
- mainへの自動マージ

## 完了時に残すもの

- 採用/不採用判断に必要なPreviewまたは確認方法
- Rive側の状態名・入力名・責務
- React側との契約
- 無料/有料の境界
- テスト結果
- `docs/current-plan.md` 更新

## Codex標準依頼

> AGENTS.md、README.md、docs/current-plan.md、docs/development-workflow.md、docs/rive-guidelines.md、docs/tasks/rive-player-minimal-experiment.md を最後まで読み、このタスクを受け入れ条件どおり進めてください。変更範囲を守り、必要なテストを実施し、current-planを更新してください。mainへは勝手にマージしないでください。
