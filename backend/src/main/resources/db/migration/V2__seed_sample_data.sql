INSERT INTO board (name)
VALUES ('サンプルボード');

INSERT INTO list (name, board_id, display_order)
VALUES
    ('未着手', 1, 0),
    ('作業中', 1, 1),
    ('完了',   1, 2);

INSERT INTO card (title, description, due_date, list_id, display_order)
VALUES
    ('要件定義書を作成する',     'プロジェクトの要件をまとめる', '2026-08-01', 1, 0),
    ('DB設計をレビューする',     NULL,                            NULL,         1, 1),
    ('API実装 - Board取得',      'GET /api/boards/{id} を実装する', '2026-07-30', 2, 0),
    ('Docker環境構築',           'docker-compose.ymlを作成する', NULL,         3, 0),
    ('要件定義書のドラフト作成', NULL,                            '2026-07-20', 3, 1);
