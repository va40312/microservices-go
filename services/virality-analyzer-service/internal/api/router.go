package api

import (
	"virality-analyzer-service/internal/api/handlers"
	"virality-analyzer-service/internal/api/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// SetupRouter - функция, которая создает и настраивает роутер
func SetupRouter(mongoClient *mongo.Client) *gin.Engine {
	r := gin.Default()
	r.SetTrustedProxies(nil)
	//gin.SetMode(gin.ReleaseMode)

	// Создаем экземпляр нашего хендлера, передавая ему подключение к БД
	dashboardHandler := handlers.NewDashboardHandler(mongoClient)

	// Группа для внутренних API
	internal := r.Group("/internal", middleware.InternalAuthMiddleware())
	{
		internal.GET("/trending", dashboardHandler.GetTrending)
		internal.GET("/leaderboard", dashboardHandler.GetLeaderboard)
		internal.GET("/stats", dashboardHandler.GetStats)
		internal.GET("/video/:videoID/trajectory", dashboardHandler.GetVideoTrajectory)
	}

	// Ручка для проверки здоровья
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return r
}
