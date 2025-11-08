package main

import (
	"context"
	"log"
	"os"
	"virality-analyzer-service/internal/config"
	"virality-analyzer-service/internal/consumer"
	"virality-analyzer-service/internal/storage"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Ошибка при загрузке конфигурации: %v", err)
		os.Exit(1)
	}

	ctx := context.Background()

	// Подключение к БД
	dbPool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Не удалось подключиться к базе данных: %v", err)
		os.Exit(1)
	}
	defer dbPool.Close()

	if err := dbPool.Ping(ctx); err != nil {
		log.Fatalf("Не удалось пинговать базу данных: %v", err)
		os.Exit(1)
	}
	log.Println("Успешное подключение к PostgreSQL!")

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
