package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	DatabaseURL  string
	KafkaBrokers []string
	KafkaTopic   string
	Port         string
}

func LoadConfig() (*AppConfig, error) {
	if err := godotenv.Load(); err != nil {
		if !os.IsNotExist(err) {
			return nil, fmt.Errorf("ошибка при чтении .env файла: %w", err)
		}
	}

	return &AppConfig{
		DatabaseURL:  os.Getenv("DATABASE_URL"),
		KafkaBrokers: strings.Split(os.Getenv("KAFKA_BROKERS"), ","),
		KafkaTopic:   os.Getenv("KAFKA_TOPIC"),
		Port:         os.Getenv("PORT"),
	}, nil
}
