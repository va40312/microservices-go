package storage

import (
	"context"
	"fmt"
	"log"
	"math"
	"time"

	"virality-analyzer-service/internal/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SnapshotRepository interface {
	SaveSnapshot(ctx context.Context, msg *domain.SocialMediaMessage) error
	GetTrendingVideos(ctx context.Context, params GetTrendingParams) ([]bson.M, int64, error)
	GetLeaderboard(ctx context.Context) ([]bson.M, error)
	GetVideoTrajectory(ctx context.Context, videoID string) ([]bson.M, error)
	GetStats(ctx context.Context) (bson.M, error)
}

type mongoRepository struct {
	client   *mongo.Client
	database string
}

type GetTrendingParams struct {
	SortBy   string
	Platform string
	Page     int64
	Limit    int64
}

func NewMongoRepository(client *mongo.Client) SnapshotRepository {
	return &mongoRepository{
		client:   client,
		database: "virality_db",
	}
}

func (r *mongoRepository) SaveSnapshot(ctx context.Context, msg *domain.SocialMediaMessage) error {
	if msg.DataType != "video" {
		return nil
	}

	p := msg.Payload
	now := time.Now()

	stats := p.Stats
	engagementRate := 0.0
	if stats.Views > 0 {
		engagementRate = (float64(stats.Likes+stats.Comments+stats.Shares) / float64(stats.Views)) * 100
	}
	rawVirality := (float64(stats.Likes) + float64(stats.Comments*5) + float64(stats.Shares*10))
	viralityScore := int(math.Log(rawVirality+1) * 5)
	if viralityScore > 100 {
		viralityScore = 100
	}

	videosCollection := r.client.Database(r.database).Collection("videos")
	opts := options.Update().SetUpsert(true)
	filter := bson.M{"_id": p.PlatformID}

	updateData := bson.M{
		"video_platform_id": msg.Payload.PlatformID,
		"source":            msg.Source,
		"author":            p.Author,
		"title":             p.Description,
		"url":               p.URL,
		"published_at":      p.PublishedAt,
		"hashtags":          p.ContentMeta.Hashtags,
		"duration":          p.ContentMeta.Duration,
		"last_updated":      now,
		"stats":             stats,
		"metrics": bson.M{
			"virality_score":  viralityScore,
			"engagement_rate": engagementRate,
		},
	}
	update := bson.M{"$set": updateData}

	_, err := videosCollection.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		return fmt.Errorf("ошибка обновления документа в videos: %w", err)
	}

	snapshotsCollection := r.client.Database(r.database).Collection("snapshots")

	snapshotDoc := bson.M{
		"video_id":      p.PlatformID,
		"snapshot_time": now,
		"stats": bson.M{
			"views":    stats.Views,
			"likes":    stats.Likes,
			"comments": stats.Comments,
			"shares":   stats.Shares,
		},
	}

	_, err = snapshotsCollection.InsertOne(ctx, snapshotDoc)
	if err != nil {
		return fmt.Errorf("ошибка вставки документа в snapshots: %w", err)
	}

	log.Printf("Данные для видео %s обновлены [Virality: %d]", p.PlatformID, viralityScore)
	return nil
}

func ConnectToDBWithRetry(ctx context.Context, connectionString string) (*mongo.Client, error) {
	maxRetries := 10
	baseRetryInterval := 1 * time.Second
	maxRetryInterval := 20 * time.Second

	var client *mongo.Client
	var err error

	for i := 0; i < maxRetries; i++ {
		clientOptions := options.Client().ApplyURI(connectionString)
		client, err = mongo.Connect(ctx, clientOptions)

		if err == nil {
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

func (r *mongoRepository) GetTrendingVideos(ctx context.Context, params GetTrendingParams) ([]bson.M, int64, error) {
	collection := r.client.Database(r.database).Collection("videos")

	filter := bson.D{}
	if params.Platform != "" {
		// Поле в `videos` называется `source`
		filter = append(filter, bson.E{Key: "source", Value: params.Platform})
	}

	sortOptions := bson.D{}
	switch params.SortBy {
	case "most_viewed":
		sortOptions = bson.D{{"stats.views", -1}}
	case "virality":
		sortOptions = bson.D{{"metrics.virality_score", -1}}
	case "newest":
		sortOptions = bson.D{{"published_at", -1}}
	default:
		sortOptions = bson.D{{"last_updated", -1}}
	}

	skip := (params.Page - 1) * params.Limit
	limit := params.Limit

	findOptions := options.Find().
		SetSort(sortOptions).
		SetSkip(skip).
		SetLimit(limit)

	cursor, err := collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, 0, err
	}

	results := make([]bson.M, 0)
	if err = cursor.All(ctx, &results); err != nil {
		return nil, 0, err
	}

	total, _ := collection.CountDocuments(ctx, filter)

	return results, total, nil
}

func (r *mongoRepository) GetLeaderboard(ctx context.Context) ([]bson.M, error) {
	videosCollection := r.client.Database(r.database).Collection("videos")

	opts := options.Find().SetSort(bson.D{{"metrics.virality_score", -1}}).SetLimit(5)
	cursor, err := videosCollection.Find(ctx, bson.D{}, opts)
	if err != nil {
		return nil, err
	}

	results := make([]bson.M, 0)
	err = cursor.All(ctx, &results)
	return results, err
}

func (r *mongoRepository) GetVideoTrajectory(ctx context.Context, videoID string) ([]bson.M, error) {
	snapshotsCollection := r.client.Database(r.database).Collection("snapshots")

	filter := bson.D{{"video_id", videoID}}
	opts := options.Find().SetSort(bson.D{{"snapshot_time", 1}})

	cursor, err := snapshotsCollection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}

	results := make([]bson.M, 0)
	err = cursor.All(ctx, &results)
	return results, err
}

func (r *mongoRepository) GetStats(ctx context.Context) (bson.M, error) {
	videosCollection := r.client.Database(r.database).Collection("videos")

	count, err := videosCollection.CountDocuments(ctx, bson.D{})
	if err != nil {
		return nil, err
	}

	return bson.M{"total_assets": count, "status": "NOMINAL"}, nil
}
