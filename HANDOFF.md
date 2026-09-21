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
- 今後はSitesへアップロード・公開せず、GitHubだけ更新する
- 名称変更時は既存セーブデータと図鑑の撃破記録に移行処理を入れる

## 直近で完了した変更

### 第1層・第2層の通常敵追加

- 第1層後半に「岩牙オオカミウオ」を追加（HP63）
  - 単発攻撃、防御、2連撃、ブロック4強奪の4手
  - 新規透過WebP: `dist/assets/enemies/wolf-eel-iwakiba-v1.webp`
- 第2層後半に「玻璃翼クシクラゲ」を追加（HP94）
  - 山札上のコスト攪乱、防御、3連撃、単発攻撃、潮圧の4手
  - 新規透過WebP: `dist/assets/enemies/comb-jelly-hariyoku-v1.webp`
- どちらも毒攻撃なし。既存敵の出現範囲を保ったまま、各層の後半候補を3体から4体へ増加
- 図鑑、出現深度、ふりがなを追加
- 現在のキャッシュ番号: `enhance.js?v=250`、`upgrade.js?v=140`

### 敵名・ヴォルティア・エリート行動

- 新規通常敵の名称を既存の二つ名形式へ統一
  - ブロブフィッシュ → 沈泥ブロブフィッシュ
  - トガリムネエソ → 鏡腹トガリムネエソ
  - ウバザメ → 巨口ウバザメ
- ヴォルティアをアンコウから「電紋オオグチボヤ・ヴォルティア」へ変更
- ヴォルティアの新規透過WebP: `dist/assets/enemies/elite-electric-tunicate-voltia-v1.webp`（1024×1024）
- 全9種のエリート行動を5〜6手へ拡張し、連撃・防御・強化に加えて潮圧、トゲ、反応、強奪、呪い、脱力、気絶中断などを個別に組み合わせた
- 灯呪蛇王・ルミナグの毒行動は5手中1回に抑えた
- 旧名称の戦闘中セーブと図鑑撃破記録は新名称へ自動移行
- 現在のキャッシュ番号: `enhance.js?v=249`、`upgrade.js?v=139`

### 効果音の音量補正

- 前回の出力倍率変更だけでは初期音量で約2.3dBしか上がらず、BGM中で差が分かりにくかった原因を修正
- BGMと共用していた音量カーブをSE専用カーブへ分離
- 初期設定（SE 0.5）の実効ゲインを従来比約3.42倍（約+10.67dB）へ変更
- 既存のダイナミクスコンプレッサー／リミッターは維持し、大きな効果音のピークを保護
- 追加調査で、保存済み音量を読み込まず両方50%固定にしていた退行を修正
- 旧バージョンの50%／50%設定がSafariのlocalStorageに残って新バランスを打ち消すため、v5移行時にBGM 25%・効果音100%へ一度だけ更新
- v5以降にユーザーが変更したBGM／効果音設定はそのまま保持
- 戦闘効果音の素材別ゲインを通常約+4.3dB、ボス約+4.3dB追加
- 攻撃・防御などの効果音再生中はBGMを一時的に18〜26%まで下げ、効果音終了後に自動復帰
- 音符ボタンは従来どおり全サウンドON/OFFのみ。音量設定画面は追加せず、バランスは内部で自動調整
- 現在のキャッシュ番号: `enhance.js?v=249`、`title-tools.js?v=108`、`combat-feedback.js?v=123`

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
- 現在のキャッシュ番号: `enhance.js?v=249`、`upgrade.js?v=139`

### その直前の敵追加

- 第1層: 沈泥ブロブフィッシュ、幽殻ゾウギンザメ
- 第2層: 鏡腹トガリムネエソ
- 第3層: 巨口ウバザメ、呪灯ワニトカゲギス
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
