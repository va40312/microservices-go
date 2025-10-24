package api

import (
	"errors"
	"fmt"
	"github.com/go-playground/validator/v10"
)

type APIError struct {
	Field string `json:"field"`
	Error string `json:"error"`
}

// validationErrorToAPIErrors "переводит" ошибку валидатора в наш формат.
func ValidationErrorToAPIErrors(err error) []APIError {
	var ve validator.ValidationErrors
	// Проверяем, действительно ли это ошибка валидации
	if errors.As(err, &ve) {
		// Создаем слайс для наших кастомных ошибок
		out := make([]APIError, len(ve))
		for i, fe := range ve {
			out[i] = APIError{
				Field: fe.Field(),
				Error: msgForTag(fe.Tag(), fe.Param()),
			}
		}
		return out
	}
	return nil
}

// msgForTag возвращает человекочитаемое сообщение для конкретного тега валидации.
func msgForTag(tag string, param string) string {
	switch tag {
	case "required":
		return "This field is required"
	case "email":
		return "Invalid email format"
	case "min":
		return fmt.Sprintf("This field must be at least %s characters long", param)
	case "max":
		return fmt.Sprintf("This field must not exceed %s characters long", param)
	// Добавь другие 'case' для тегов, которые ты используешь
	default:
		return "Invalid value"
	}
}
