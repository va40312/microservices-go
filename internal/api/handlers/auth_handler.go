package handlers

import (
	"github.com/gin-gonic/gin"
	"microservices-mvp/internal/api"
	"microservices-mvp/internal/config"
)

type AuthHandler struct {
	app *config.AppContainer
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
	return &AuthHandler{
		app: app,
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

	// это нужно изменить, накидал быстро для доработки
	var result string
	rows, err := h.app.Dbpool.Query("insert into users (email, username, password) values ($1, $2, $3)", req.Username, req.Password, req.Username)

	for rows.Next() {
		err := rows.Scan(&result)
	}

	if rows.Err() != nil {

	}

	api.RespondSuccess(c, nil)
}

func (h *AuthHandler) AuthUser(c *gin.Context) {
	api.RespondSuccess(c, nil)
}
