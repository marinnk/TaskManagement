-- 初回起動時（各テーブルが空の状態）のみサンプルデータを投入する。
-- 一度データが投入された後は、アプリを再起動してもDBの内容を保持する。

INSERT INTO board (name)
SELECT 'サンプルボード'
WHERE NOT EXISTS (SELECT 1 FROM board);

INSERT INTO list (name, board_id, display_order)
SELECT * FROM (VALUES
    ('未着手'::varchar, 1, 0),
    ('作業中', 1, 1),
    ('完了',   1, 2)
) AS v(name, board_id, display_order)
WHERE NOT EXISTS (SELECT 1 FROM list);

INSERT INTO card (title, description, due_date, list_id, display_order)
SELECT * FROM (VALUES
    ('要件定義書を作成する'::varchar,     'プロジェクトの要件をまとめる'::text,  '2026-08-01'::date, 1, 0),
    ('DB設計をレビューする',              NULL,                                   NULL,               1, 1),
    ('API実装 - Board取得',               'GET /api/boards/{id} を実装する',     '2026-07-30'::date, 2, 0),
    ('Docker環境構築',                    'docker-compose.ymlを作成する',        NULL,               3, 0),
    ('要件定義書のドラフト作成',          NULL,                                   '2026-07-20'::date, 3, 1)
) AS v(title, description, due_date, list_id, display_order)
WHERE NOT EXISTS (SELECT 1 FROM card);
