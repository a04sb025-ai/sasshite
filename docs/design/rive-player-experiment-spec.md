# Rive Player 最小実験仕様

この文書は、Player 1体のアート品質と standing / seated の成立性だけを確認するための作業契約です。本番ゲームへ組み込むための仕様ではありません。

## 検証の進め方

Rive Editorで次の順に作業し、各ゲートを通らなければ先へ進みません。

1. **基準アート**: 正面から少し斜めを向いたstandingを1体だけ描き、320px幅のプレビューで確認する。
2. **パーツ分け**: 同じアートを後述の階層へ分ける。別ポーズの人物を描き直して差し替えない。
3. **Rig**: 関節の回転中心と前後関係を設定する。
4. **ポーズ**: standingを基準にseatedを作り、骨盤、太腿、膝、すね、靴のつながりを確認する。
5. **状態遷移**: State Machineから2つのポーズを切り替える。
6. **証跡**: standing / seatedの静止画と、切り替えを収めた短い動画または共有Previewを残す。

基準アートが品質ゲートを通る前に、React Runtimeの依存追加や本番画面への接続は行いません。Rive EditorをCodexから操作できない場合は、下記の確認物を用意した時点でEditor作業をユーザーへ依頼します。

## Riveファイル内の契約

| 種別 | 名前 | 用途 |
| --- | --- | --- |
| ファイル | `player-minimal.riv` | 採用前のPlayer検証ファイル |
| Artboard | `Player` | Player 1体だけを含む |
| Animation | `standing` | 自然な立位の基準ポーズ |
| Animation | `seated` | 同一リグによる自然な座位 |
| State Machine | `PlayerPose` | standing / seated間の遷移 |
| Boolean input | `seated` | `false`でstanding、`true`でseated |

`seated`はReactが将来渡す唯一の身体状態です。Reactはbone名、関節角度、パーツ座標、キーフレームを参照しません。状態遷移時間やeasingもRive側の責務です。

## アートとRigの階層

最低限、次の部位を独立させます。左右はPlayer自身から見た左右で命名します。

```text
PlayerRoot
├── pelvis
│   ├── torso
│   │   ├── neck
│   │   │   └── head
│   │   ├── upperArmLeft ─ forearmLeft ─ handLeft
│   │   └── upperArmRight ─ forearmRight ─ handRight
│   ├── thighLeft ─ shinLeft ─ footLeft
│   └── thighRight ─ shinRight ─ footRight
└── clothingDetails
```

- 首は胴と頭の両方に重なりを持たせ、ポーズ変更時にも隙間を出さない。
- 肩、肘、股関節、膝、足首の回転中心を人体の関節位置に置く。
- seatedでは骨盤を先に移動し、左右の太腿、すね、靴をそれぞれ追従させる。
- 腕や脚を1枚の差し替え画像にせず、standing / seatedで同じ部位とリグを使う。
- 前後関係の変更が必要ならRive内で管理し、ReactやCSSに持ち出さない。

## アート品質ゲート

standing / seatedを同じ倍率・同じ背景で並べ、320px幅と原寸の両方で確認します。次の全項目が **OK** のときだけRuntime接続候補にします。

- [ ] 既存の電車SVGプロトタイプより、輪郭、顔、服、人体接続が明確に自然である。
- [ ] 頭、首、胴、左右の腕、左右の脚、左右の靴を識別できる。
- [ ] 首が浮かず、肩と腕の接続に隙間や不自然な膨らみがない。
- [ ] standingで両脚が自然に接地している。
- [ ] seatedで骨盤から左右の太腿、膝、すね、靴まで連続して見える。
- [ ] 片脚の消失、脚の融合、関節の逆折れ、服の大きな破綻がない。
- [ ] 顔、髪、服装、体格、配色が両ポーズで同一人物に見える。
- [ ] 320px幅でも顔の向きと立位 / 座位を判別できる。
- [ ] 切り替え中に首や手足が外れず、意図しない瞬間移動がない。

判定用ファイルは、PRへ次のいずれかで添付します。

- `standing`と`seated`を同条件で並べた画像
- 状態遷移を含む短い動画
- Riveの共有Preview URL（閲覧に有料契約や編集権限を要求しないもの）

コードテストの成功は、この品質ゲートの代わりになりません。NGの場合はCSSで補修せず、アートまたはRigを直します。

## 保存場所と採用前の扱い

- 検証中の`.riv`を書き出せる場合: `prototypes/rive/player-minimal.riv`
- 判定用の静止画を書き出せる場合: `prototypes/rive/review/`
- 品質合格後の本番候補: `src/assets/rive/player.riv`

品質合格前のファイルを`src/assets/`へ置かず、本番ゲーム、採点、NPC、バッグ、他ステージを変更しません。

## 無料 / 有料の停止境界

最初はRiveの無料アカウントと無料Editorで、基準アート、Rig、2ポーズ、State Machine、確認用Previewまたは`.riv`書き出しまでを試します。プラン内容は変更され得るため、作業開始時に[Riveの料金ページ](https://rive.app/pricing)とEditor上の表示を再確認します。

次のいずれかが表示されたら、その操作は行わずユーザーへ確認します。

- 支払い方法の登録、trial開始、upgradeまたは有料seatを要求される。
- `.riv`の書き出し、共有Preview、必要なRig / State Machine機能が有料限定である。
- 無料枠の上限により、新規ファイル作成や共同確認ができない。
- 外部の有料アート素材、生成API、追加サービスが必要になる。

確認時は、必要な操作、表示された費用と契約周期、代替案（画面共有・静止画確認・別の2Dリグ手段）を報告し、承認前に契約しません。

## React Runtime接続を行う場合の次段階

品質ゲート通過後に限り、別タスクとしてRive公式React Runtimeの導入可否を確認します。接続側は概念上、`PlayerPose`の`seated`だけを更新します。

```ts
type PlayerPose = 'standing' | 'seated'

type RivePlayerProps = {
  pose: PlayerPose
}
```

実装時には使用するRuntimeの公式ドキュメント、現行バージョン、bundleへの影響、reduced motion時の遷移を再確認します。この最小実験では依存パッケージを追加しません。

## 今回の自動確認範囲

リポジトリ側では次を確認します。

- `npm run typecheck`
- `npm test`
- `npm run build`
- 本番コード、採点、シーンデータ、依存パッケージに差分がないこと

Rive Editor内のアート、Rig、State Machine、および目視品質は、上記チェックリストによる別の確認が必要です。
