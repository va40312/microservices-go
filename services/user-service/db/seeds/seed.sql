-- 1. Полностью очищаем таблицы в правильном порядке (сначала "детей", потом "родителей")
TRUNCATE TABLE bids, items, users RESTART IDENTITY CASCADE;

-- `TRUNCATE` - быстро удаляет все строки.
-- `RESTART IDENTITY` - сбрасывает счетчики `BIGSERIAL` (ID снова начнутся с 1).
-- `CASCADE` - если есть внешние ключи, они не будут мешать.

-- 2. Заполняем таблицы свежими тестовыми данными
INSERT INTO users (email, username, password_hash, balance) VALUES
                                                                ('alice@example.com', 'Alice', 'hash1', 10000.00),
                                                                ('bob@example.com', 'Bob', 'hash2', 5000.00);

-- Мы знаем, что Alice получит ID=1, а Bob - ID=2, так как мы сбросили счетчики.
INSERT INTO items (name, owner_id, start_price, current_price, expires_at) VALUES
                                                                               ('Vintage Watch', 1, 150.00, 150.00, NOW() + INTERVAL '3 day'),
                                                                               ('Old Laptop', 1, 50.00, 50.00, NOW() + INTERVAL '1 day');

INSERT INTO bids (item_id, user_id, amount) VALUES
    (1, 2, 160.00);