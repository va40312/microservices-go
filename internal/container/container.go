package container

import (
	"fmt"
	"microservice-example/internal/config"
	"microservice-example/internal/db"
	"microservice-example/internal/logger"

	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

type AppContainer struct {
	Dbpool *pgxpool.Pool
	Log    *zap.Logger
	Env    *config.AppEnv
}

func NewAppContainer(env *config.AppEnv) (*AppContainer, error) {
	log := logger.New(env)
	//defer log.Sync()

	dbpool, err := db.NewPgxpool(env)
	if err != nil {
		log.Error("Failed to connect to database", zap.Error(err))
		return nil, err
	} else {
		log.Info("Successful connect to Postgresql.")
	}

	return &AppContainer{
		Dbpool: dbpool,
		Log:    log,
		Env:    env,
	}, nil
}

func (c *AppContainer) Close() {
	c.Log.Info("Closing application resources...")

	// Закрываем пул соединений
	c.Dbpool.Close()

	// Синхронизируем (сбрасываем буфер) логгера. Это важно делать в последнюю очередь.
	c.Log.Sync()

	fmt.Println("Application resources closed.")
}
