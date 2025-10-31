package logger

import (
	"fmt"
	"microservice-example/internal/config"

	"go.uber.org/zap"
)

func New(env *config.AppEnv) *zap.Logger {
	appEnv := env.AppEnv

	var logger *zap.Logger
	var err error

	if appEnv == "production" {
		config := zap.NewProductionConfig()
		logger, err = config.Build()
	} else {
		config := zap.NewDevelopmentConfig()
		logger, err = config.Build()
	}

	if err != nil {
		panic(fmt.Errorf("failed to init zap logger: %w", err))
	}

	return logger
}
