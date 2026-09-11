# ABYSS DECK v126 — Claude移行手順

## パッケージ

- `ABYSS-DECK-v126-Claude-handoff-full.zip`：画像・音楽を含む完全版。これを開発の原本にします。
- `ABYSS-DECK-v126-Claude-handoff-code.zip`：画像・音楽を除いた軽量版。完全版ZIPをClaudeへ添付できない場合に使います。
- `ABYSS-DECK-v126-ASSET-MANIFEST.csv`：画像・音楽の相対パス、容量、SHA-256一覧です。
- `CLAUDE用-最初の指示-v126.txt`：Claudeの新しい会話へ最初に貼る文章です。

## Claudeへ渡す手順

1. 完全版ZIPを保管用の原本として残します。
2. Claudeの新しい会話またはプロジェクトへ、完全版ZIPを添付します。
3. ZIPを直接読めない場合は手元で展開し、フォルダまたは必要なファイルを添付します。容量で拒否される場合はコード版ZIPと資産一覧を渡します。
4. `CLAUDE用-最初の指示-v126.txt` の全文を最初のメッセージとして貼ります。
5. 変更ごとに、Claudeから変更済みファイル一式またはZIPを受け取ります。画像・音楽を削除したコード版だけを原本として扱わないでください。

## フォルダ構成

- `dist/index.html`：ゲーム本体の入口
- `dist/*.js`：ゲームロジック
- `dist/*.css`：画面表示
- `dist/assets/`：画像・音楽
- `.openai/hosting.json`：現在のChatGPT Sites公開設定
- `tools/local-server.cjs`：ローカルサーバー
- `tools/verify-project.cjs`：不足ファイル・空ファイル・JavaScript構文の検査

## ローカル起動

展開したフォルダでPowerShellを開き、次を実行します。

```powershell
node tools/local-server.cjs
```

その後、ブラウザで `http://127.0.0.1:8119/` を開きます。`start-local.ps1` をPowerShellから実行しても起動できます。

## 検証

```powershell
node tools/verify-project.cjs
```

結果の `missing`、`empty`、`syntaxErrors` がすべて空であることを確認します。変更した画面はブラウザでも実操作してください。

## キャッシュ更新

JavaScriptまたはCSSを変更したら、`dist/index.html` 内の該当ファイルの `?v=数字` も増やします。これを忘れると、公開版が古いファイルを表示することがあります。

例：`game-polish.css?v=126` を変更した場合は `game-polish.css?v=127` にします。

## 現在の公開版

- バージョン：126
- URL：https://deep-sea-fishing-spirits.aa047076.chatgpt.site/
- 公開先：ChatGPT Sites

Claude単体では、このChatGPT Sitesプロジェクトへ直接公開できない場合があります。その場合は、Claudeで編集とローカル確認を行い、変更済みZIPをCodexへ戻して公開します。完全にClaude側へ移す場合は、GitHub Pages、Cloudflare Pagesなど別の静的ホスティング先を用意し、`dist` を公開対象にします。

## 引き継ぎ時点で完了している主な変更

- ショップ価格を金貨絵文字と数字で表示
- カード、レリック、治療、削除、強化、退店の確認画面と「やめる」ボタン
- ショップの強化・削除カードを中央配置
- 戦闘報酬カードを戦闘カードと同じ寸法に統一
- 戦闘中のレリックボタンと中断ボタンを修正
- イベント選択カード下の案内文を削除し、決定ボタンを固定
- アセンション解放カードを共通カード表示へ統一
- 深淵イベントの獲得結果カードを中央配置

