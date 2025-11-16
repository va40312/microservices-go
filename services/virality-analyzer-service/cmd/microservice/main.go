package main

import (
	"context"
	"log"
	"os"
	"virality-analyzer-service/internal/config"
	"virality-analyzer-service/internal/consumer"
	"virality-analyzer-service/internal/storage"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Ошибка при загрузке конфигурации: %v", err)
		os.Exit(1)
	}

	ctx := context.Background()

	// Подключение к БД
	dbPool, err := storage.ConnectToDBWithRetry(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Критическая ошибка: Не удалось инициализировать подключение к БД. %v", err)
	}

	if err := consumer.CheckKafkaConnection(ctx, cfg.KafkaBrokers, cfg.KafkaTopic); err != nil {
		log.Fatalf("Критическая ошибка: проверка Kafka не пройдена: %v", err)
	}

	// 2. Сборка компонентов (Dependency Injection)
	// Создаем репозиторий, передавая ему пул соединений
	repo := storage.NewPostgresRepository(dbPool)

	// Создаем консьюмер, передавая ему репозиторий
	kafkaConsumer := consumer.NewMessageConsumer(cfg.KafkaBrokers, cfg.KafkaTopic, repo)

	// 3. Запуск приложения
	kafkaConsumer.Run(ctx)
}
