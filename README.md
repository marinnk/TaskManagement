# TaskManagement

Trello風のかんばん方式タスク管理Webアプリケーション。

## 概要

個人でタスクを管理したい利用者向けに、ボード・リスト・カードを使ってタスクを視覚的に管理できるアプリを目指します。AIを活用したWebアプリ開発の学習を目的としたスクール課題です。

詳細な仕様は [要件定義書](docs/requirements.md) を参照してください。

## 使用技術

### バックエンド

| 技術                    | バージョン  |
|-------------------------|-------------|
| Java                    | 25          |
| Spring Boot             | 4.1.0       |
| Spring Data JPA         | 4.1.0       |
| Hibernate               | 7.4.1.Final |
| Gradle                  | 9.5.1       |
| PostgreSQL JDBCドライバ | 42.7.11     |

### フロントエンド

| 技術       | バージョン                |
|------------|---------------------------|
| Node.js    | ^20.19.0 または >=22.12.0 |
| React      | 19.2.8                    |
| TypeScript | 6.0.3                     |
| Vite       | 8.1.5                     |

### データベース

| 技術       | バージョン                 |
|------------|----------------------------|
| PostgreSQL | 16（`postgres:16-alpine`） |

バージョンの詳細・更新方針は [非機能要件・技術スタック](docs/non-functional-requirements.md) を参照してください。

## プロジェクト構成

```
.
├── backend/    # Spring Boot（REST API）
├── frontend/   # React + Vite（画面）
├── docs/       # 要件定義・設計ドキュメント
├── mockup/     # 画面モックアップ
└── docker-compose.yml  # PostgreSQL起動用
```

## ステータス

現在、ボード詳細取得API（読み取り専用）とフロントエンドのボード画面表示まで実装済みです。カードの追加・編集・削除・ドラッグ&ドロップ等は今後実装予定です。詳細は [機能要件](docs/functional-requirements.md) を参照してください。

## セットアップ

### PostgreSQL（Docker）の起動

前提: Docker / Docker Compose が必要です。

```sh
docker compose up -d
```

デフォルトでは `localhost:5432` にDB名 `taskmanagement`、ユーザー/パスワード `taskmanagement` で起動します（`.env.example` を参考に `.env` を作成すると値を変更できます）。

### バックエンド（Spring Boot）

前提: Java 25 が必要です（Homebrewの場合 `brew install openjdk@25`）。上記のPostgreSQLコンテナを先に起動してください。

```sh
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@25/libexec/openjdk.jdk/Contents/Home
./gradlew bootRun
```

起動後、`http://localhost:8080/api/health` にアクセスすると `{"status":"ok"}` が返ります。

DB接続先はデフォルトでDocker Composeの設定と一致していますが、環境変数（`DB_HOST` / `DB_PORT` / `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD`）で上書きできます。

### フロントエンド（React + Vite）

前提: Node.js が必要です。上記のバックエンドを先に起動してください。

```sh
cd frontend
npm install
npm run dev
```

起動後、`http://localhost:5173` にアクセスするとボード画面が表示されます。APIの接続先はデフォルトで `http://localhost:8080` です（`frontend/.env.example` を参考に `.env.development` を上書きすると変更できます）。

## API

現在実装済みの主なエンドポイントです。

### ヘルスチェック

| メソッド | パス          | 概要           |
|----------|---------------|----------------|
| GET      | `/api/health` | ヘルスチェック |

### ボード

| メソッド | パス               | 概要                                   |
|----------|--------------------|----------------------------------------|
| GET      | `/api/boards`      | ボード一覧取得                         |
| GET      | `/api/boards/{id}` | ボード詳細（リスト・カードを含む）取得 |

## テスト

```sh
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@25/libexec/openjdk.jdk/Contents/Home
./gradlew test
```

フロントエンドは以下でLintを実行できます。

```sh
cd frontend
npm run lint
```

## 関連ドキュメント

- [要件定義書](docs/requirements.md)  
  概要・目的・関連ドキュメントへのリンク集
- [機能要件](docs/functional-requirements.md)  
  提供する機能一覧とユースケース
- [画面設計](docs/screen-design.md)  
  画面一覧とワイヤーフレーム
- [データ要件](docs/data-requirements.md)  
  エンティティ・テーブル定義・ER図
- [非機能要件](docs/non-functional-requirements.md)  
  技術スタックのバージョン、性能・セキュリティ等

## 開発フロー

Issueを起票 → Issueに対応するブランチを作成 → PRを作成してmainにマージ、という流れで開発します。mainブランチへの直接pushは禁止されています。詳細は [CLAUDE.md](CLAUDE.md) を参照してください。
