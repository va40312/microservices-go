package config

import "os"

type AppEnv struct {
	DatabaseUrl string
	Port        string
	AppEnv      string
	JwtSecret   string
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func NewAppEnv() *AppEnv {
	return &AppEnv{
		DatabaseUrl: os.Getenv("DATABASE_URL"),
		Port:        getEnv("PORT", "8080"),
		AppEnv:      os.Getenv("APP_ENV"),
		JwtSecret:   os.Getenv("JWT_SECRET"),
	}
}
