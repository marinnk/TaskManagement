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

### バックエンド（Spring Boot）

前提: Java 25 が必要です（Homebrewの場合 `brew install openjdk@25`）。

```sh
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@25/libexec/openjdk.jdk/Contents/Home
./gradlew bootRun
```

起動後、`http://localhost:8080/api/health` にアクセスすると `{"status":"ok"}` が返ります。

現時点ではSpring Bootの雛形のみで、PostgreSQL/JPAとの連携は未実装です。
