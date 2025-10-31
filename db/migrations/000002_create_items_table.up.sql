CREATE TABLE items (
                       id            BIGSERIAL PRIMARY KEY,
                       name          VARCHAR(255) NOT NULL,
                       description   TEXT,
                       owner_id      BIGINT NOT NULL,
                       start_price   DECIMAL(15, 2) NOT NULL CHECK (start_price > 0),
                       current_price DECIMAL(15, 2) NOT NULL CHECK (current_price > 0),
                       winner_id     BIGINT,
                       status        VARCHAR(20) NOT NULL DEFAULT 'active',
                       version       INTEGER NOT NULL DEFAULT 1,
                       expires_at    TIMESTAMPTZ NOT NULL,
                       created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                       CONSTRAINT fk_owner FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE,
                       CONSTRAINT fk_winner FOREIGN KEY(winner_id) REFERENCES users(id) ON DELETE SET NULL
);