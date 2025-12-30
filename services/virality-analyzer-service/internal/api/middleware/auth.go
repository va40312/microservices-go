package middleware

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func InternalAuthMiddleware() gin.HandlerFunc {
	requiredKey := os.Getenv("INTERNAL_API_KEY")

	if requiredKey == "" {
		panic("Переменная окружения INTERNAL_API_KEY не установлена!")
	}

	return func(c *gin.Context) {
		providedKey := c.GetHeader("X-Internal-API-Key")

		if providedKey != requiredKey {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
			return
		}

		c.Next()
	}
}
