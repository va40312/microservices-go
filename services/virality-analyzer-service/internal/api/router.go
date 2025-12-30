package api

import (
	"virality-analyzer-service/internal/api/handlers"
	"virality-analyzer-service/internal/api/middleware"
	"virality-analyzer-service/internal/storage"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRouter(client *mongo.Client, repo storage.SnapshotRepository) *gin.Engine {
	r := gin.Default()
	r.SetTrustedProxies(nil)
	//gin.SetMode(gin.ReleaseMode)

	dashboardHandler := handlers.NewDashboardHandler(client, repo)

	internal := r.Group("/internal", middleware.InternalAuthMiddleware())
	{
		internal.GET("/trending", dashboardHandler.GetTrending)
		internal.GET("/leaderboard", dashboardHandler.GetLeaderboard)
		internal.GET("/stats", dashboardHandler.GetStats)
		internal.GET("/video/:videoID/trajectory", dashboardHandler.GetVideoTrajectory)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return r
}
