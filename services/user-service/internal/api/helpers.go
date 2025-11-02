package api

import (
	"github.com/gin-gonic/gin"
	"io"
)

func BindJSONAndValidate(c *gin.Context, req interface{}) bool {
	if err := c.ShouldBindJSON(&req); err != nil {
		if err == io.EOF {
			// Если тело запроса просто пустое
			RespondBadRequest(c, "Request body is empty")
			return false
		}

		apiErrors := ValidationErrorToAPIErrors(err)
		if apiErrors != nil {
			// Используем хелпер!
			RespondBadRequest(c, apiErrors)
			return false
		}
		RespondBadRequest(c, err.Error())
		return false
	}
	return true
}
