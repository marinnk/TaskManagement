---
name: quality-check
description: Run a comprehensive code-quality review of the TaskManagement app (Spring Boot backend + React/Vite frontend) — automated lint/test/build checks plus a deeper architectural review comparing the implementation against docs/ and README.md and common React/Spring Boot anti-patterns. Use whenever the user asks for a "品質チェック"/"quality check"/"code review" of the whole app, wants to know if the codebase has drifted from best practices or from the requirements docs, or asks to check the app before a release/milestone. Do not use this for routine per-PR verification — CI already covers that; this skill is for the periodic, deeper review.
---

# 品質チェック

このアプリ（Spring Bootバックエンド + React/Viteフロントエンド）の品質を、自動チェックと設計レベルのレビューの2段階で確認する手順。

## この手順を使うタイミング

CIが毎回のpush・PRで自動的にlint/test/checkstyleを実行しているので、**このスキル全体を毎回のPRごとに実行する必要はない**。以下のようなタイミングで使う。

- まとまった機能追加が一段落したとき
- 個人開発・学習プロジェクトのペースなら1〜2ヶ月に1回程度
- 「なんとなくコードが雑然としてきた」と感じたとき
- リリースや大きな区切りの前

## 第1段階：自動チェック（毎回同じ、機械的に実行）

CIと同じ内容をローカルで実行し、素早く問題の有無を把握する。

```sh
# フロントエンド
cd frontend
npm run lint
npm run test
npm run build
```

```sh
# バックエンド（test + Checkstyle）
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@25/libexec/openjdk.jdk/Contents/Home
./gradlew check
```

### ローカル特有の注意：DBの蓄積データによる見せかけの失敗

バックエンドの統合テストは、Docker上のPostgreSQLに投入されたシードデータの件数・内容を前提にしている。ローカルのDBコンテナを長期間起動しっぱなしにしていると、過去の手動確認やテスト実行で追加・削除したデータが蓄積し、シードデータの前提とズレて、**コードには問題がないのにテストが失敗する**ことがある（症状: カードやリストの件数が期待値と合わないアサーションエラー）。

テストが失敗したら、まずこれが原因でないか疑い、DBをリセットしてから再実行して切り分ける。

```sh
docker compose down -v
docker compose up -d db
```

リセット後も同じ箇所で失敗する場合のみ、実際のコードの問題として扱う。

## 第2段階：設計・アーキテクチャレベルのレビュー（自動化できない部分）

自動チェックが通っても見つからない種類の問題を、観点ごとに確認する。

### ドキュメントとの整合性

`docs/`（requirements.md・functional-requirements.md・data-requirements.md・non-functional-requirements.md・screen-design.md）と`README.md`の内容が、実際の実装と食い違っていないか確認する。

- READMEの「ステータス」節・「API」節が実装済み機能を正しく反映しているか（過去に、カード機能が実装済みなのに「今後実装予定」のままになっていたことがある）
- `docs/data-requirements.md`のテーブル定義・制約が、実際のEntity（`@Column`の`length`/`nullable`など）やFlywayのマイグレーション（`db/migration/`）と一致しているか
- `docs/non-functional-requirements.md`に書かれた前提（個人利用・小規模データ量・パフォーマンス要件なし）が変わっていないか。前提が変わらない限り、ページネーション未対応などは意図的な見送りとして扱ってよい

### フロントエンドのチェック観点

- アクセシビリティ：`frontend/.oxlintrc.json`に`jsx-a11y`相当のルールが有効化されているか。モーダル（`CardFormModal`・`ConfirmDialog`等）に`role="dialog"`・フォーカストラップ・Escapeキーでの閉じる操作があるか
- 責務分離：コンポーネントがデータ取得・状態管理・画面表示を1ファイルに詰め込んでいないか（CLAUDE.mdのコーディング規約通り、API通信・データ更新ロジックはカスタムフックに分離されているべき）
- ミューテーション後の無駄な全件再取得：カードの追加・編集・削除・移動のたびに、APIレスポンスを使わず画面全体のデータを取り直していないか
- 再レンダリングの最適化：ドラッグ&ドロップなど高頻度に状態更新が走る箇所で、子コンポーネントが`React.memo`化されていない・渡す関数が`useCallback`で安定化されていない、といった無駄な再描画がないか
- Reactらしくない実装：`querySelectorAll`等でDOMを直接操作し、React管理外の情報をもとに描画・判定していないか
- 未使用のアセット・importが残っていないか

### バックエンドのチェック観点

- 入力バリデーション：新しいAPIのリクエストDTOに`@Valid`・`@NotBlank`等のBean Validationアノテーションが付いているか。手書きのnullチェック・空文字チェックが重複していないか
- 例外処理：新しい例外パターンが`GlobalExceptionHandler`（`@RestControllerAdvice`）で一貫して処理されるか。個別のコントローラー/サービスで独自にエラーレスポンスを組み立てていないか
- N+1クエリ：リストや配列をループしながら1件ずつリポジトリへ問い合わせるコードが新たに増えていないか
- スキーマ管理：DBのテーブル定義変更が、`ddl-auto`任せではなく`backend/src/main/resources/db/migration/`配下の新しいバージョン番号のマイグレーションファイルとして追加されているか
- ロギング：新しいサービスクラス・重要な更新系メソッドに、既存の`CardCommandService`/`BoardQueryService`と同じ調子でSLF4Jのログ（`private static final Logger LOG = LoggerFactory.getLogger(...)`）が入っているか
- レイヤリング：コンストラクタインジェクション・DTOによるレスポンス分離・薄いコントローラー（業務ロジックはサービス層に）が維持されているか

## レポートのまとめ方

第1段階（自動チェック）の結果と、第2段階（観点ごとの気づき）を分けて報告する。第2段階は「問題」と決めつけず、「気になった点」として提示し、対応するかどうか・どの粒度で進めるか（Issueを分けるか、まとめるか）はユーザーに確認してから着手する。CLAUDE.mdのIssue駆動開発フローに従い、実際にコードを直す場合は必ずIssue→ブランチ→PRの手順を踏む。
