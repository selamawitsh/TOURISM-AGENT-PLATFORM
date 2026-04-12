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
	AuthServiceURL string
}

func Load() *Config {
	_ = godotenv.Load()

	return &Config{
		AppName:        getEnv("APP_NAME", "destination-service"),
		AppEnv:         getEnv("APP_ENV", "development"),
		AppPort:        getEnv("APP_PORT", "8083"),
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