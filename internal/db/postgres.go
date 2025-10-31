package db

import (
	"context"
	"fmt"
	"microservice-example/internal/config"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPgxpool(env *config.AppEnv) (*pgxpool.Pool, error) {
	dbpool, err := pgxpool.New(context.Background(), env.DatabaseUrl)

	if err != nil {
		return nil, fmt.Errorf("Postgres connect error: %w", err)
	}

	if err := dbpool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("Postgres ping error: %w", err)
	}

	return dbpool, nil
}
