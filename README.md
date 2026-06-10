# ZenHan Corrector

Chrome上のページ表示で、全角英数字を半角に、半角カナを全角カタカナに変換する拡張機能です。

## 使い方

1. Chromeで `chrome://extensions` を開く
2. 右上の「デベロッパー モード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」から、このフォルダを選択する

## 動作

- ページ本文のテキストノードを変換します。
- `input`、`textarea`、`select`、`contenteditable`、`code`、`pre` の中身は編集しません。
- ページ読み込み後に追加されたテキストも監視して変換します。
- 拡張のポップアップ、または `Alt+Shift+Z` で有効/無効を切り替えられます。
- ツールバーアイコンのバッジに `ON` / `OFF` が表示されます。
- ショートカットは `chrome://extensions/shortcuts` から変更できます。

## テスト

```sh
node tests/converter.test.mjs
```
