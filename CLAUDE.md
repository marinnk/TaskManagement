# CLAUDE.md

Claude Codeがこのリポジトリで作業する際に必ず守るルールです。

## 開発フロー（Issue駆動開発）

コード変更を伴うタスクに着手する際は、必ず以下の順序で作業してください。ユーザーから明示的に「Issueを立てて」と指示されていなくても、このフローに従います。

1. **Issueを起票する**

   ```sh
   gh issue create --title "<タイトル>" --body "<概要・完了条件>"
   ```

   タイトルは何をするか一目で分かる内容にし、本文には概要・背景・完了条件を記載します。適用可能なら `.github/ISSUE_TEMPLATE/` のテンプレートに沿った内容にします。

2. **Issueに対応するブランチを作成する**

   命名規則: `<type>/<issue番号>-<短い英語slug>`

   - `type` は `feature` / `fix` / `chore` / `docs` / `refactor` のいずれか
   - 例: `feature/12-add-login-form`, `fix/15-fix-date-sort`

   ```sh
   git switch -c feature/12-add-login-form main
   ```

3. **作業ブランチ上で変更・コミットする**

   - **mainブランチへの直接コミット・直接pushは禁止**です。必ず作業ブランチ上で作業してください。
   - mainブランチにはGitHub側で保護ルール（PR必須・force-push禁止・削除禁止）が設定されているため、直接pushは技術的にも拒否されます。

4. **PRを作成する**

   ```sh
   gh pr create --title "<タイトル>" --body "Closes #<issue番号>

   <変更内容の概要>"
   ```

   本文に `Closes #<issue番号>` を含め、マージ時にIssueが自動でクローズされるようにします。`.github/pull_request_template.md` の項目を埋めてください。

5. **マージはユーザーの承認を得てから行う**

   PRのマージ（`gh pr merge`）は共有状態への変更にあたるため、ユーザーに明示的に確認を取ってから実行してください。無断でマージしないこと。

## 例外

- ドキュメントの誤字修正など、極めて軽微でリスクのない変更であっても、mainへの直接pushはできない（GitHub側で禁止されている）ため、上記フローに従ってください。
- 複数の関連する変更を1つのIssue・PRにまとめても構いませんが、無関係な変更を混ぜないでください。
