package main

import (
	"context"
	"fmt"
	"microservice-example/internal/api/handlers"
	"microservice-example/internal/config"
	"microservice-example/internal/container"
	"microservice-example/internal/middleware"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

var _ context.Context

type User struct {
	Email    string `json:"email"`
	Username string `json:"username"`
}

func main() {
	env := config.NewAppEnv()
	app, err := container.NewAppContainer(env)
	if err != nil {
		// фатальная ошибка зависимостей, без них не работаем
		os.Exit(1)
	}
	defer app.Close()

	if env.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	// у нас нет прокси сервера, поэтому nil
	r.SetTrustedProxies(nil)
	// middleware для логирования
	r.Use(middleware.Ginzap(app.Log, time.RFC3339, true))
	r.Use(middleware.RecoveryWithZap(app.Log, true))

	apiV1 := r.Group("/api/v1")
	{
		auth := apiV1.Group("/auth")
		authHandler := handlers.NewAuthHanlder(app)
		{
			auth.POST("/register", authHandler.RegisterUser)
			auth.POST("/login", authHandler.AuthUser)
		}
		apiV1.GET("/healthcheck", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status": "app working",
			})
		})

		apiV1.GET("/panic", func(c *gin.Context) {
			panic("An unexpected error happen!")
		})

		apiV1.GET("/users", func(c *gin.Context) {
			rows, err := app.Dbpool.Query(c.Request.Context(), "select email,username from users")
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"message": fmt.Sprintf("Query failed: %w", err)})
			}
			defer rows.Close()

			var users []User
			for rows.Next() {
				var user User

				err := rows.Scan(&user.Email, &user.Username)

				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"message": fmt.Sprintf("Scan failed: %w", err)})
					return
				}

				users = append(users, user)
			}

			// rows.Next() - возращает true/false
			// Если false может быть:
			// 1) Когда все прочитали, тогда err -> nil
			// 2) Когда ошибка
			// Проверяем не произошло ли ошибки в rows.Next()

			if err := rows.Err(); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"message": fmt.Sprintf("Iteration error: %w", err)})
			}

			c.JSON(http.StatusOK, gin.H{"users": users})
		})
	}

	app.Log.Info("Starting server on port :8080")
	r.Run(":8080")
}
