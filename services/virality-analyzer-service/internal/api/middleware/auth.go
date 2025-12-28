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
		// Получаем ключ из заголовка запроса
		providedKey := c.GetHeader("X-Internal-API-Key")

		// Сравниваем
		if providedKey != requiredKey {
			// Если ключи не совпадают - отлуп!
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
			return // Прерываем дальнейшую обработку
		}

		// Если все ок, пропускаем запрос дальше к хендлеру
		c.Next()
	}
}
