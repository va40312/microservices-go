CREATE TABLE bids (
                      id        BIGSERIAL PRIMARY KEY,
                      item_id   BIGINT NOT NULL,
                      user_id   BIGINT NOT NULL,
                      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                      amount    DECIMAL(15, 2) NOT NULL,

                      CONSTRAINT fk_item FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE,
                      CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);