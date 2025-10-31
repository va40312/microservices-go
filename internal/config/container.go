package config

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	"log"
)

type AppEnv struct {
	DatabaseUrl string
	Port        string
	JwtSecret   string
}

type AppContainer struct {
	Dbpool *pgxpool.Pool
	Env    *AppEnv
}

func NewAppContainer(env *AppEnv) *AppContainer {
	dbpool, err := pgxpool.New(context.Background(), env.DatabaseUrl)

	if err != nil {
		log.Fatal(fmt.Sprintf("Postgres connect error: %w", err))
	}

	if err := dbpool.Ping(context.Background()); err != nil {
		log.Fatal(fmt.Sprintf("Postgres ping error: %w", err))
	}
	log.Println("Successful connect to Postgresql.")

	return &AppContainer{
		Dbpool: dbpool,
		Env:    env,
	}
}
