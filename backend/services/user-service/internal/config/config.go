package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppName        string
	AppEnv         string
	AppPort        string
	DatabaseURL    string
	JWTSecret      string
	AuthServiceURL string // Add this field
}

func Load() *Config {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = getEnv("APP_PORT", "8081") 
	}

	return &Config{
		AppName:        getEnv("APP_NAME", "user-service"),
		AppEnv:         getEnv("APP_ENV", "development"),
		AppPort:        port,
		DatabaseURL:    getEnv("DATABASE_URL", ""),
		JWTSecret:      getEnv("JWT_SECRET", ""),
		AuthServiceURL: getEnv("AUTH_SERVICE_URL", "http://localhost:8081"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}