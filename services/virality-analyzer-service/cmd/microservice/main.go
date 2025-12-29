package main

import (
	"context"
	"log"
	"os"
	"virality-analyzer-service/internal/api"
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

	mongoClient, err := storage.ConnectToDBWithRetry(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Критическая ошибка: Не удалось инициализировать подключение к MongoDB. %v", err)
	}

	defer func() {
		if err = mongoClient.Disconnect(ctx); err != nil {
			log.Printf("Ошибка при отключении от MongoDB: %v", err)
		}
	}()

	if err := consumer.CheckKafkaConnection(ctx, cfg.KafkaBrokers, cfg.KafkaTopic); err != nil {
		log.Fatalf("Критическая ошибка: проверка Kafka не пройдена: %v", err)
	}

	// Сборка компонентов (Dependency Injection)
	// Создаем репозиторий, передавая ему пул соединений
	repo := storage.NewMongoRepository(mongoClient)

	// Создаем консьюмер, передавая ему репозиторий
	kafkaConsumer := consumer.NewMessageConsumer(cfg.KafkaBrokers, cfg.KafkaTopic, repo)

	// Запуск kafka в фоне
	go func() {
		kafkaConsumer.Run(ctx)
	}()

	router := api.SetupRouter(mongoClient, repo)

	log.Printf("HTTP Server running on port %s...", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
