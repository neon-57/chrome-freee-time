# freeeの勤務時間を確認するChromeの拡張機能です。
![image](https://github.com/user-attachments/assets/1822e2ab-ea82-4f7b-92ab-e6ba6161cf22)

## インストール
1. [こちら](https://github.com/neon-57/chrome-freee-time/archive/refs/heads/main.zip)からZIPファイルをダウンロードまたは、このリポジトリをZIPでダウンロード
2. ZIPを解凍します。
3. Chromeで`chrome://extensions/`にアクセスします。
4. `デベロッパーモード`をONにします。
5. `パッケージ化されていない拡張機能を読み込む`をクリックし、解凍したフォルダを選択します。
6. すでに Freee を開いていた場合は、ページをリロードしてください。

## 更新・再インストール
更新・もしくは再インストールする場合は以下の手順で更新できます。
1. Chromeで`chrome://extensions/`にアクセス
2. `Chrome Freee Time`を削除
3. 古い`Chrome Freee Time`のファイルを削除
4. [インストール](https://github.com/neon-57/chrome-freee-time?tab=readme-ov-file#インストール)手順に沿って再度インストールする

## 使い方

1. [Freee 勤怠ページ](https://p.secure.freee.co.jp/) を開き、`修正` ボタンをクリックします。（その時点の時刻で計算されます。）
2. 時刻を編集した場合や「直近」「前回」を切り替えた場合は、表示を再計算します。時間経過後に確実に最新の時刻で計算するには、`キャンセル` → `修正` を再度押してください。
3. 表示される時間の意味は以下の通りです:

| 表示項目 | 意味 |
|----------|------|
| **総勤務時間** | 出勤ボタンを押してからの経過時間（休憩時間を含む） |
| **休憩時間** | 休憩時間の合計 |
| **実労働時間** | 総勤務時間 － 休憩時間 |

![image](https://github.com/user-attachments/assets/e96f1b8a-a0cc-4da0-a7b7-0ed996bba442)

## 開発時の動作確認

リポジトリのルートで `python3 -m http.server 8765 --bind 127.0.0.1` を実行し、
ブラウザーで `http://127.0.0.1:8765/tests/content.test.html` を開いてください。
新旧の画面構造、遅延読み込み、入力変更、表示の重複防止などの回帰テストを実行します。
テストには架空の打刻データを使用し、freeeへの通信や勤怠の保存は行いません。

