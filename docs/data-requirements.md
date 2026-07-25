# データ要件：Trello風タスク管理アプリ

[← 要件定義書に戻る](要件定義書.md)

## エンティティ一覧

| エンティティ | 主な項目 |
|---|---|
| Board | id, ボード名 |
| List | id, リスト名, 所属Board, 表示順 |
| Card | id, タイトル, 説明, 期限, 所属List, 表示順 |

## テーブル定義

### board

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | ボードID |
| name | VARCHAR(100) | NOT NULL | ボード名 |

### list

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | リストID |
| name | VARCHAR(50) | NOT NULL | リスト名（「未着手」「作業中」「完了」） |
| board_id | BIGINT | FK → board.id, NOT NULL | 所属ボードID |
| display_order | INT | NOT NULL | ボード内での表示順（0始まり） |

### card

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | カードID |
| title | VARCHAR(200) | NOT NULL | カードのタイトル |
| description | TEXT | NULL可 | カードの説明 |
| due_date | DATE | NULL可 | カードの期限 |
| list_id | BIGINT | FK → list.id, NOT NULL | 所属リストID |
| display_order | INT | NOT NULL | リスト内での表示順（0始まり） |

## ER図（概略）

```
board (1) --- (多) list (1) --- (多) card
```

- 1つのboardは複数のlistを持つ
- 1つのlistは複数のcardを持つ
- list削除・card削除は本バージョンの機能要件に無いため、カスケード削除の仕様は次バージョンで検討する
