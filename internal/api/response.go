package api

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type ErrorResponse struct {
	Success bool        `json:"success"`
	Error   ErrorObject `json:"error"`
}

type ErrorObject struct {
	Message string `json:"message"`
	Details any    `json:"details"`
}

type SuccessResponse struct {
	Success bool `json:"success"`
	Data    any  `json:"data,omitempty"`
}

func RespondSuccess(c *gin.Context, data any) {
	response := &SuccessResponse{
		Success: true,
		Data:    data,
	}
	c.JSON(http.StatusOK, response)
}

func RespondCreated(c *gin.Context, data any) {
	response := SuccessResponse{
		Success: true,
		Data:    data,
	}
	c.JSON(http.StatusCreated, response)
}

func RespondError(c *gin.Context, statusCode int, message string, details any) {
	response := ErrorResponse{
		Success: false,
		Error: ErrorObject{
			Message: message,
			Details: details,
		},
	}
	c.AbortWithStatusJSON(statusCode, response)
}

func RespondBadRequest(c *gin.Context, details any) {
	RespondError(c, http.StatusBadRequest, "Invalid request", details)
}

func RespondUnauthorized(c *gin.Context) {
	RespondError(c, http.StatusUnauthorized, "Unauthorized", nil)
}

func RespondNotFound(c *gin.Context) {
	RespondError(c, http.StatusNotFound, "Resource not found", nil)
}

func RespondInternalServerError(c *gin.Context) {
	RespondError(c, http.StatusInternalServerError, "An internal server error occurred", nil)
}
