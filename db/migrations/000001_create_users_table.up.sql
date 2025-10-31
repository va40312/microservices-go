CREATE TABLE users (
                       id            BIGSERIAL PRIMARY KEY,
                       email         VARCHAR(255) UNIQUE NOT NULL,
                       username      VARCHAR(100) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       balance       DECIMAL(15, 2) NOT NULL DEFAULT 1000.00 CHECK (balance >= 0),
                       created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);