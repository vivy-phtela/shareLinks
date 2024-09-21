## Share Links

### 使用技術

・Next.js
・Tailwind CSS(DaisyUI)
・Firebase(Authentication, Cloud Firestore)
・Vercel

### コミットメッセージ

| プレフィックス | 用途             |
| -------------- | ---------------- |
| add            | 新しい機能の追加 |
| fix            | バグの修正       |
| update         | バグ以外の修正   |
| delete         | 削除             |

### ブランチ運用

Github Flow に則る。

| ブランチ名 | 用途                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| main       | 常にデプロイできる状態<br>直接コミットしない(README は除く)                                  |
| feature    | 新機能追加時に main から切る<br>理解しやすい名前にする<br>完成次第 PR を出して main にマージ |
