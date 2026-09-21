# ABYSS DECK — 次のWorkへの引き継ぎ

## リポジトリ

- GitHub: https://github.com/tatsuya0726/abyss-deck
- 作業ブランチ: `claude/serene-meitner-83ufqa`
- `main` は作業ブランチをfast-forwardして同期する運用
- 最新位置は `git log -1 --oneline` で確認する

## 構成と作業ルール

- ビルド不要の静的サイト。ゲーム本体は `dist/` 配下
- ローカル起動: `node tools/local-server.cjs`
- 検証: `node tools/verify-project.cjs`
- 検証後に変更される `verify-report.json` はコミットせず元へ戻す
- JavaScript/CSSを変更したら `dist/index.html` の該当 `?v=` を更新する
- 日本語UIを変更したら `dist/enhance.js` のふりがな辞書も確認する
- 変更後は検証、コミット、作業ブランチへプッシュし、`main`をfast-forwardする
- 名称変更時は既存セーブデータと図鑑の撃破記録に移行処理を入れる

## 直近で完了した変更

### 効果音の音量補正

- 前回の出力倍率変更だけでは初期音量で約2.3dBしか上がらず、BGM中で差が分かりにくかった原因を修正
- BGMと共用していた音量カーブをSE専用カーブへ分離
- 初期設定（SE 0.5）の実効ゲインを従来比約3.42倍（約+10.67dB）へ変更
- 既存のダイナミクスコンプレッサー／リミッターは維持し、大きな効果音のピークを保護
- 追加調査で、保存済みの「BGM 30%・効果音100%」を読み込まず両方50%固定にしていた退行を修正
- 保存済み音量を再び読み込み、未設定時もBGM 30%・効果音100%を初期値に変更
- 攻撃・防御などの効果音再生中はBGMを一時的に18〜26%まで下げ、効果音終了後に自動復帰
- タイトルの設定画面へBGM／効果音スライダーと効果音試聴ボタンを復元
- 現在のキャッシュ番号: `enhance.js?v=247`、`title-tools.js?v=106`、`combat-feedback.js?v=122`

### 深海生物

- ミツマタヤリウオを削除し、第3層の同じ枠を「呪灯ワニトカゲギス」へ変更
- 呪灯ワニトカゲギスは旧ミツマタヤリウオのHP・行動バランスを継承
- 旧セーブ中の戦闘相手と旧図鑑撃破記録を新名称へ移行
- メンダコ、ブロブフィッシュ、トガリムネエソを、幽殻ゾウギンザメに合わせた半実在・半UMAの画風へ変更
- 新画像:
  - `dist/assets/enemies/dragonfish-uma-v1.webp`
  - `dist/assets/enemies/flapjack-octopus-uma-v2.webp`
  - `dist/assets/enemies/blobfish-uma-v2.webp`
  - `dist/assets/enemies/hatchetfish-uma-v2.webp`
- 4画像は1536×1024、透過WebP
- 図鑑説明とふりがな辞書を更新
- 現在のキャッシュ番号: `enhance.js?v=247`、`upgrade.js?v=138`

### その直前の敵追加

- 第1層: ブロブフィッシュ、幽殻ゾウギンザメ
- 第2層: トガリムネエソ
- 第3層: ウバザメ、呪灯ワニトカゲギス
- 旧「鉄壁ダンゴウオ」「オオグソクムシ」系の記録は幽殻ゾウギンザメへ移行

## 最新の検証結果

`node tools/verify-project.cjs` 実行済み。

- missing: なし
- empty: なし
- syntaxErrors: なし
- `dist/upgrade.js`、`dist/enhance.js` の `node --check`: 正常
- `verify-report.json`: 元へ戻し、変更対象から除外済み

## 次のWork開始時に貼る文章

> ABYSS DECKの開発を続けてください。
>
> リポジトリ: https://github.com/tatsuya0726/abyss-deck
>
> 作業ブランチ: claude/serene-meitner-83ufqa
>
> 最初に最新コミットを取得し、HANDOFF.mdを全文確認してください。ビルド不要の静的サイトで、ゲーム本体はdist/配下です。
>
> ローカル起動は node tools/local-server.cjs、検証は node tools/verify-project.cjs です。検証後のverify-report.jsonは破棄してください。JS/CSS変更時はdist/index.htmlの?v=番号を更新し、日本語UI変更時はdist/enhance.jsのふりがな辞書も確認してください。
> 変更後は作業ブランチへコミット・プッシュし、mainをfast-forwardで同期してください。
