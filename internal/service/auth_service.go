package service

import (
	"fmt"
	"microservice-example/internal/config"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AuthService struct {
	env *config.AppEnv
}

func NewAuthService(env *config.AppEnv) *AuthService {
	return &AuthService{env}
}

func (a *AuthService) GenerateJWToken(userid int64) (string, error) {
	claims := &jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		Subject:   strconv.FormatInt(userid, 10),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(a.env.JwtSecret))

	if err != nil {
		return "", fmt.Errorf("Cannot sign jwt with secret key: %w", err)
	}

	return tokenString, nil
}
