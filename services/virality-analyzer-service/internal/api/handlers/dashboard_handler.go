package handlers

import (
	"net/http"
	"strconv"
	"virality-analyzer-service/internal/storage"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// DashboardHandler - структура, которая хранит зависимости (нашу БД)
type DashboardHandler struct {
	MongoClient *mongo.Client
	Repo        storage.SnapshotRepository
}

// NewDashboardHandler - конструктор для нашего хендлера
func NewDashboardHandler(client *mongo.Client, repo storage.SnapshotRepository) *DashboardHandler {
	return &DashboardHandler{MongoClient: client, Repo: repo}
}

func (h *DashboardHandler) GetLeaderboard(c *gin.Context) {
	results, err := h.Repo.GetLeaderboard(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch leaderboard"})
		return
	}
	c.JSON(http.StatusOK, results)
}

func (h *DashboardHandler) GetTrending(c *gin.Context) {
	// 1. Собираем параметры из запроса
	page, _ := strconv.ParseInt(c.DefaultQuery("page", "1"), 10, 64)
	limit, _ := strconv.ParseInt(c.DefaultQuery("limit", "20"), 10, 64)

	params := storage.GetTrendingParams{
		SortBy:   c.DefaultQuery("sort_by", "newest"),
		Platform: c.Query("platform"),
		Page:     page,
		Limit:    limit,
	}

	// 2. ВЫЗЫВАЕМ МЕТОД РЕПОЗИТОРИЯ
	results, total, err := h.Repo.GetTrendingVideos(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 3. Отдаем результат
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
	videoID := c.Param("videoID")
	if videoID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Video ID is required"})
		return
	}

	// Вызываем метод репозитория
	snapshots, err := h.Repo.GetVideoTrajectory(c.Request.Context(), videoID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch trajectory"})
		return
	}
	c.JSON(http.StatusOK, snapshots)
}

// GetStats - метод для получения статистики
func (h *DashboardHandler) GetStats(c *gin.Context) {
	stats, err := h.Repo.GetStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stats"})
		return
	}
	c.JSON(http.StatusOK, stats)
}
