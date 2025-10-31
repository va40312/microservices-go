package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"microservices-mvp/internal/api/handlers"
	"microservices-mvp/internal/config"
	"net/http"
	"os"
)

type User struct {
	Email    string `json:"email"`
	Username string `json:"username"`
}

func main() {
	env := &config.AppEnv{
		DatabaseUrl: os.Getenv("DATABASE_URL"),
		Port:        os.Getenv("PORT"),
		JwtSecret:   os.Getenv("JWT_SECRET"),
	}

	app := config.NewAppContainer(env)

	r := gin.Default()
	r.SetTrustedProxies(nil)

	apiV1 := r.Group("/api/v1")

	{
		auth := apiV1.Group("/auth")
		authHandler := handlers.NewAuthHanlder(app)
		{
			auth.POST("/register", authHandler.RegisterUser)

			auth.POST("/login", authHandler.AuthUser)
		}

		users := apiV1.Group("/users")
		{
			users.GET("/users", func(c *gin.Context) {
				var users []User

				rows, err := app.Dbpool.Query(c.Request.Context(), "select email, username from users")

				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
						"message": fmt.Sprintf("Query error: %w", err),
					})
					return
				}

				for rows.Next() {
					var user User

					err := rows.Scan(&user.Email, &user.Username)
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"message": fmt.Sprintf("Scan error: %w", err),
						})
						return
					}

					users = append(users, user)
				}

				if err := rows.Err(); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
						"message": fmt.Sprintf("Iteration error: %w", err),
					})
					return
				}

				c.JSON(http.StatusOK, gin.H{
					"users": users,
				})
			})
		}
	}

	if env.Port == "" {
		env.Port = "8080"
	}

	r.Run(":" + env.Port)
}
