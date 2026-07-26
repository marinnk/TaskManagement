# 非機能要件・技術スタック：Trello風タスク管理アプリ

[← 要件定義書に戻る](要件定義書.md)

## 技術スタック

### バックエンド

- 言語：Java 25
- フレームワーク：Spring Boot 4.1.0
- Web：Spring Web（REST API）
- データアクセス：Spring Data JPA 4.1.0
- ORM：Hibernate 7.4.1.Final
- ビルドツール：Gradle 9.5.1
- JDBCドライバ：PostgreSQL JDBCドライバ 42.7.11

### フロントエンド

- 言語：TypeScript 6.0.3
- ライブラリ：React 19.2.8
- ビルドツール：Vite 8.1.5
- ランタイム：Node.js ^20.19.0 または >=22.12.0

（Next.jsは対象外）

### データベース

- DBMS：PostgreSQL 16（Dockerイメージ: `postgres:16-alpine`）

> バージョンは `backend/build.gradle` / `backend/gradle/wrapper/gradle-wrapper.properties` / `frontend/package-lock.json` / `docker-compose.yml` を実態の一次情報とする。更新時はこれらのファイルとあわせて本節も更新すること。

## 非機能要件

- 動作環境：一般的なモダンブラウザ（Chrome等）で動作すること
- 性能：個人利用を前提とし、同時アクセスや大量データは考慮しない（カード数は数十〜数百件程度を想定）
- セキュリティ：ログイン機能を持たないため、外部には公開せずローカル環境／学習用途での利用に限定する
- データ永続化：PostgreSQLに永続化し、アプリ再起動後もデータを保持する（自動バックアップは対象外）
- 可用性：個人学習用のため稼働率・障害対応の要件は定めない
