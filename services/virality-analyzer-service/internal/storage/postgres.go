package storage

import (
	"context"
	"fmt"
	"log"
	"time"

	"virality-analyzer-service/internal/domain" // <-- Импортируем наши модели

	"github.com/jackc/pgx/v5/pgxpool"
)

// SnapshotRepository определяет интерфейс для работы с хранилищем снимков.
// Интерфейсы - ключ к тестируемости!
type SnapshotRepository interface {
	SaveSnapshot(ctx context.Context, msg *domain.TikTokMessage) error
}

// postgresRepository - конкретная реализация репозитория для PostgreSQL.
type postgresRepository struct {
	pool *pgxpool.Pool
}

// NewPostgresRepository создает новый экземпляр репозитория.
func NewPostgresRepository(dbPool *pgxpool.Pool) SnapshotRepository {
	return &postgresRepository{pool: dbPool}
}

// SaveSnapshot реализует метод сохранения в БД.
func (r *postgresRepository) SaveSnapshot(ctx context.Context, msg *domain.TikTokMessage) error {
	p := msg.Payload

	query := `
		INSERT INTO video_stats_snapshot (
			video_platform_id, source, author_username, description, video_url,
			music_title, snapshot_time, published_at, likes, comments, shares, views
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`
	_, err := r.pool.Exec(ctx, query,
		p.PlatformID, msg.Source, p.Author.Username, p.Description, p.URL,
		p.ContentMeta.MusicTitle, time.Now(), p.PublishedAt, p.Stats.Likes,
		p.Stats.Comments, p.Stats.Shares, p.Stats.Views,
	)

	if err != nil {
		return fmt.Errorf("ошибка при сохранении снимка в PostgreSQL: %w", err)
	}

	log.Printf("Успешно сохранен снимок для видео: %s", p.PlatformID)
	return nil
}

func ConnectToDBWithRetry(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	maxRetries := 10
	baseRetryInterval := 1 * time.Second
	maxRetryInterval := 20 * time.Second

	var dbPool *pgxpool.Pool
	var err error

	for i := 0; i < maxRetries; i++ {
		dbPool, err = pgxpool.New(ctx, databaseURL)
		if err == nil {
			err = dbPool.Ping(ctx)
			if err == nil {
				log.Println("Успешное подключение к PostgreSQL!")
				return dbPool, nil
			}
		}

		nextRetryWait := baseRetryInterval * time.Duration(1<<i) // 1<<i это 2 в степени i
		if nextRetryWait > maxRetryInterval {
			nextRetryWait = maxRetryInterval
		}

		log.Printf("Не удалось подключиться к БД (попытка %d/%d): %s. Повтор через %v...", i+1, maxRetries, err, nextRetryWait)
		time.Sleep(nextRetryWait)
	}

	// Если мы вышли из цикла, значит, все попытки провалились.
	return nil, fmt.Errorf("не удалось подключиться к БД после %d попыток: %w", maxRetries, err)
}
