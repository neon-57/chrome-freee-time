# freeeの勤務時間を確認するChromeの拡張機能です。
![image](https://github.com/user-attachments/assets/1822e2ab-ea82-4f7b-92ab-e6ba6161cf22)

## install
1. [こちら](https://github.com/neon-57/chrome-freee-time/archive/refs/heads/main.zip)からZIPファイルをダウンロードまたは、このリポジトリをZIPでダウンロード
2. ZIPを解凍します。
3. Chromeで`chrome://extensions/`にアクセス
4. `デベロッパーモード`をONにします。
5. `パッケージ化されていない拡張機能を読み込む`をクリックし、解凍したフォルダを選択します。
6. すでに Freee を開いていた場合は、ページをリロードしてください。

## 使い方

1. [Freee 勤怠ページ](https://p.secure.freee.co.jp/) を開き、`修正` ボタンをクリックします。（その時点の時刻で計算されます。）
2. ボタンを押してから時間が経過した場合、`キャンセル` → `修正` を再度押すことで、更新できます。
3. 表示される時間の意味は以下の通りです:

| 表示項目 | 意味 |
|----------|------|
| **総勤務時間** | 出勤ボタンを押してからの経過時間（休憩時間を含む） |
| **休憩時間** | 休憩時間の合計 |
| **実労働時間** | 総勤務時間 － 休憩時間 |

![image](https://github.com/user-attachments/assets/e96f1b8a-a0cc-4da0-a7b7-0ed996bba442)

