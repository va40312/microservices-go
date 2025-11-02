package middleware

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"microservice-example/internal/api"
	"net/http"
	"strconv"
	"strings"
)

func RequireAuth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			api.RespondError(c, http.StatusUnauthorized, "Authorization header required", nil)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 && parts[1] != "Bearer" {
			api.RespondError(c, http.StatusUnauthorized, "Invalid token format", nil)
			return
		}

		tokenString := parts[1]

		claims := &jwt.RegisteredClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("invalid token signing method: %v", token.Header["alg"])
			}

			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			api.RespondError(c, http.StatusUnauthorized, "Invalid token", err.Error())
			return
		}

		if token.Valid {
			userID, err := strconv.ParseInt(claims.Subject, 10, 64)

			if err != nil {
				api.RespondError(c, http.StatusUnauthorized, "Invalid user ID in token", nil)
				return
			}

			c.Set("userid", userID)
			c.Next()
		} else {
			api.RespondError(c, http.StatusUnauthorized, "Invalid token claims", nil)
			return
		}
	}
}
