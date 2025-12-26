package storage

import (
	"context"
	"fmt"
	"log"
	"time"

	"virality-analyzer-service/internal/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// SnapshotRepository - интерфейс оставляем без изменений
type SnapshotRepository interface {
	SaveSnapshot(ctx context.Context, msg *domain.TikTokMessage) error
}

type mongoRepository struct {
	client     *mongo.Client
	database   string
	collection string
}

// NewMongoRepository - конструктор теперь принимает клиент Mongo
func NewMongoRepository(client *mongo.Client) SnapshotRepository {
	return &mongoRepository{
		client:     client,
		database:   "virality_db", // Имя базы данных
		collection: "snapshots",   // Имя коллекции
	}
}

// SaveSnapshot - реализация сохранения в MongoDB
func (r *mongoRepository) SaveSnapshot(ctx context.Context, msg *domain.TikTokMessage) error {
	p := msg.Payload

	// Формируем документ для вставки (BSON)
	// Мы маппим данные из сообщения в структуру документа
	document := bson.M{
		"video_platform_id": p.PlatformID,
		"source":            msg.Source,
		"author_username":   p.Author.Username,
		"description":       p.Description,
		"video_url":         p.URL,
		"music_title":       p.ContentMeta.MusicTitle,
		"snapshot_time":     time.Now(), // Время снимка
		"published_at":      p.PublishedAt,
		"stats": bson.M{ // Вложенный объект для статистики красивее в Mongo
			"likes":    p.Stats.Likes,
			"comments": p.Stats.Comments,
			"shares":   p.Stats.Shares,
			"views":    p.Stats.Views,
		},
		// Можно добавить сырые данные, если нужно
		// "raw_data": msg,
	}

	collection := r.client.Database(r.database).Collection(r.collection)

	_, err := collection.InsertOne(ctx, document)
	if err != nil {
		return fmt.Errorf("ошибка при сохранении снимка в MongoDB: %w", err)
	}

	log.Printf("Успешно сохранен снимок в Mongo для видео: %s", p.PlatformID)
	return nil
}

// ConnectToDBWithRetry - логика подключения адаптирована под Mongo
func ConnectToDBWithRetry(ctx context.Context, connectionString string) (*mongo.Client, error) {
	maxRetries := 10
	baseRetryInterval := 1 * time.Second
	maxRetryInterval := 20 * time.Second

	var client *mongo.Client
	var err error

	for i := 0; i < maxRetries; i++ {
		// Создаем клиент
		clientOptions := options.Client().ApplyURI(connectionString)
		client, err = mongo.Connect(ctx, clientOptions)

		if err == nil {
			// Пингуем базу, чтобы убедиться, что соединение реально есть
			err = client.Ping(ctx, nil)
			if err == nil {
				log.Println("Успешное подключение к MongoDB!")
				return client, nil
			}
		}

		nextRetryWait := baseRetryInterval * time.Duration(1<<i)
		if nextRetryWait > maxRetryInterval {
			nextRetryWait = maxRetryInterval
		}

		log.Println(connectionString)
		log.Printf("Не удалось подключиться к MongoDB (попытка %d/%d): %s. Повтор через %v...", i+1, maxRetries, err, nextRetryWait)
		time.Sleep(nextRetryWait)
	}

	return nil, fmt.Errorf("не удалось подключиться к MongoDB после %d попыток: %w", maxRetries, err)
}
