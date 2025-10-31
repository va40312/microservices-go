package handlers

import (
	"errors"
	"fmt"
	"io"
	"microservice-example/internal/api"
	"microservice-example/internal/container"
	"microservice-example/internal/repoerror"
	"microservice-example/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	app         *container.AppContainer
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

func NewAuthHanlder(app *container.AppContainer) *AuthHandler {
	authService := service.NewAuthService(app.Env)
	return &AuthHandler{
		app:         app,
		authService: authService,
	}
}

func (h *AuthHandler) RegisterUser(c *gin.Context) {
	var req AuthUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if err == io.EOF {
			// Если тело запроса просто пустое
			api.RespondBadRequest(c, "Request body is empty")
			return
		}

		apiErrors := api.ValidationErrorToAPIErrors(err)
		if apiErrors != nil {
			// Используем хелпер!
			api.RespondBadRequest(c, apiErrors)
			return
		}
		api.RespondBadRequest(c, err.Error())
		return
	}

	passwordHashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		h.app.Log.Error("Failed to hash password", zap.Error(err))
		api.RespondError(c, http.StatusInternalServerError, "Could not process request", err)
		return
	}

	var newUserID int64
	err = h.app.Dbpool.QueryRow(c.Request.Context(), "insert into users (email, username, password) values ($1, $2, $3) returning id", req.Email, req.Username, passwordHashed).Scan(&newUserID)

	if err != nil {
		h.app.Log.Error("insert error: ", zap.Error(err))
		parsedErr := repoerror.Parse(err)
		// Выводим тип и значение ошибки
		fmt.Printf("Parsed error type: %T\n", parsedErr)
		fmt.Printf("Parsed error value: %v\n", parsedErr)

		// Используем errors.Unwrap() для проверки
		unwrappedErr := errors.Unwrap(parsedErr)
		fmt.Printf("Unwrapped error value: %v\n", unwrappedErr)
		// с помощью as преобразуем ошибку в тип и возвращает true
		if errors.Is(errors.Unwrap(parsedErr), repoerror.ErrDuplicate) {
			fmt.Printf("true true true")
			api.RespondError(c, http.StatusConflict, "User with this data exist.", parsedErr)
			return
		}
		api.RespondError(c, http.StatusInternalServerError, "Insert user error", parsedErr)
		return
	}

	token, err := h.authService.GenerateJWToken(newUserID)

	if err != nil {
		api.RespondError(c, http.StatusInternalServerError, "Internal error", err.Error())
		return
	}
	api.RespondSuccess(c, gin.H{
		"token": token,
	})
}

func (h *AuthHandler) AuthUser(c *gin.Context) {
	api.RespondSuccess(c, nil)
}
