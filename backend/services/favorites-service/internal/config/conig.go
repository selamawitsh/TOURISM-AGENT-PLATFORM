package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppName           string
	AppEnv            string
	AppPort           string
	DatabaseURL       string
	JWTSecret         string
	AuthServiceURL    string
	UserServiceURL    string
	DestServiceURL    string
}

func Load() *Config {
	_ = godotenv.Load()

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Println("WARNING: JWT_SECRET is not set in .env file!")
	}

	return &Config{
		AppName:        getEnv("APP_NAME", "favorites-service"),
		AppEnv:         getEnv("APP_ENV", "development"),
		AppPort:        getEnv("APP_PORT", "8085"),
		DatabaseURL:    getEnv("DATABASE_URL", ""),
		JWTSecret:      jwtSecret,
		AuthServiceURL: getEnv("AUTH_SERVICE_URL", "http://localhost:8081"),
		UserServiceURL: getEnv("USER_SERVICE_URL", "http://localhost:8082"),
		DestServiceURL: getEnv("DESTINATION_SERVICE_URL", "http://localhost:8083"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}