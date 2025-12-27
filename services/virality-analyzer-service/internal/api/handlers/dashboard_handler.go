package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// DashboardHandler - структура, которая хранит зависимости (нашу БД)
type DashboardHandler struct {
	MongoClient *mongo.Client
}

// NewDashboardHandler - конструктор для нашего хендлера
func NewDashboardHandler(client *mongo.Client) *DashboardHandler {
	return &DashboardHandler{MongoClient: client}
}

func (h *DashboardHandler) GetLeaderboard(c *gin.Context) {
	collection := h.MongoClient.Database("virality_db").Collection("snapshots")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Сортируем по "виральности" (пока просто по лайкам), берем топ 5
	opts := options.Find().SetSort(bson.D{{"stats.likes", -1}}).SetLimit(5)
	cursor, err := collection.Find(ctx, bson.D{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch leaderboard"})
		return
	}

	var results = make([]bson.M, 0)
	if err = cursor.All(ctx, &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode leaderboard"})
		return
	}

	c.JSON(http.StatusOK, results)
}

func (h *DashboardHandler) GetTrending(c *gin.Context) {
	collection := h.MongoClient.Database("virality_db").Collection("snapshots")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 1. Параметры запроса (сортировка, фильтр, ПАГИНАЦИЯ)
	sortBy := c.DefaultQuery("sort_by", "newest")
	platform := c.Query("platform")

	// Читаем параметры пагинации из URL (?page=1&limit=20)
	page, _ := strconv.ParseInt(c.DefaultQuery("page", "1"), 10, 64)
	limit, _ := strconv.ParseInt(c.DefaultQuery("limit", "20"), 10, 64)

	// Рассчитываем смещение (offset)
	skip := (page - 1) * limit

	// 2. Строим фильтр (без изменений)
	filter := bson.D{}
	if platform != "" {
		filter = bson.D{{"source", platform}}
	}

	// 3. Строим сортировку (ИСПРАВЛЕНО)
	sortOptions := bson.D{}
	switch sortBy {
	case "most_viewed":
		sortOptions = bson.D{{"stats.views", -1}}
	case "virality":
		sortOptions = bson.D{{"stats.likes", -1}}
	case "newest":
		sortOptions = bson.D{{"published_at", -1}}
	default:
		sortOptions = bson.D{{"snapshot_time", -1}}
	}

	// 4. Собираем опции для Mongo (добавляем Skip и Limit)
	findOptions := options.Find().
		SetSort(sortOptions).
		SetSkip(skip).
		SetLimit(limit)

	cursor, err := collection.Find(ctx, filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch trending videos"})
		return
	}

	var results = make([]bson.M, 0)
	if err = cursor.All(ctx, &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode trending videos"})
		return
	}

	// (Опционально, но круто) Добавляем общее количество для пагинации на фронте
	total, _ := collection.CountDocuments(ctx, filter)

	c.JSON(http.StatusOK, gin.H{
		"data": results,
		"pagination": gin.H{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}
func (h *DashboardHandler) GetVideoTrajectory(c *gin.Context) {
	collection := h.MongoClient.Database("virality_db").Collection("snapshots")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 1. Получаем ID видео из URL (/internal/video/12345)
	videoID := c.Param("videoID")
	if videoID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Video ID is required"})
		return
	}

	// 2. Ищем ВСЕ снапшоты для этого видео в Монге
	filter := bson.D{{"video_platform_id", videoID}}
	// Сортируем по времени, чтобы график рисовался правильно
	opts := options.Find().SetSort(bson.D{{"snapshot_time", 1}}) // 1 = по возрастанию

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch video trajectory"})
		return
	}

	var snapshots = make([]bson.M, 0)
	if err = cursor.All(ctx, &snapshots); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode snapshots"})
		return
	}

	// 3. Отдаем массив снапшотов
	c.JSON(http.StatusOK, snapshots)
}

// GetStats - метод для получения статистики
func (h *DashboardHandler) GetStats(c *gin.Context) {
	collection := h.MongoClient.Database("virality_db").Collection("snapshots")
	count, err := collection.EstimatedDocumentCount(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stats"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_assets": count,
		"status":       "NOMINAL",
	})
}
