# TaskManagement

Trello風のかんばん方式タスク管理Webアプリケーション。

## 概要

個人でタスクを管理したい利用者向けに、ボード・リスト・カードを使ってタスクを視覚的に管理できるアプリを目指します。AIを活用したWebアプリ開発の学習を目的としたスクール課題です。

詳細な仕様は [要件定義書](docs/requirements.md) を参照してください。

## 使用技術

- Java / Spring Boot（Gradle）
- React（TypeScript）+ Vite
- PostgreSQL

## ステータス

現在、要件定義を完了し、設計・実装に着手する段階です。

## セットアップ

### データベース（PostgreSQL / Docker）

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

## 開発フロー

Issueを起票 → Issueに対応するブランチを作成 → PRを作成してmainにマージ、という流れで開発します。mainブランチへの直接pushは禁止されています。詳細は [CLAUDE.md](CLAUDE.md) を参照してください。
