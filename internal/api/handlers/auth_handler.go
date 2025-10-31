package handlers

import (
	"context"
	"fmt"
	"github.com/gin-gonic/gin"
	"microservices-mvp/internal/api"
	"microservices-mvp/internal/config"
	"microservices-mvp/internal/service"
)

type AuthHandler struct {
	app         *config.AppContainer
	authService *service.AuthService
}

type AuthUserRequest struct {
	// в gin встроена валидация
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username" binding:"required,min=3"`
	Password string `json:"password" binding:"required,min=8"`
}

// Конструктор для структуры AuthHandler
// Будем создавать в router
// В структуру передаем зависимости логгер, бд и прочие

func NewAuthHanlder(app *config.AppContainer) *AuthHandler {
	authService := service.NewAuthService(app.Env)
	return &AuthHandler{
		app,
		authService,
	}
}

func (h *AuthHandler) RegisterUser(c *gin.Context) {
	var req AuthUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apiErrors := api.ValidationErrorToAPIErrors(err)
		if apiErrors != nil {
			// Используем хелпер!
			api.RespondBadRequest(c, apiErrors)
			return
		}
		api.RespondBadRequest(c, err.Error())
		return
	}

	var newUserId int64
	err := h.app.Dbpool.QueryRow(context.Background(), "insert into users (email, username, password) values ($1, $2, $3) returning id", req.Email, req.Username, req.Password).Scan(&newUserId)

	if err != nil {
		fmt.Println("db error: %w", err)
		api.RespondBadRequest(c, err)
		return
	}

	token, err := h.authService.GenerateJWToken(newUserId)

	if err != nil {
		fmt.Printf("jwt error: %v\n", err)
		api.RespondBadRequest(c, err.Error())
		return
	}

	api.RespondSuccess(c, gin.H{
		"token": token,
	})
}

func (h *AuthHandler) AuthUser(c *gin.Context) {
	api.RespondSuccess(c, nil)
}
