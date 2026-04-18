package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort         string
	AppEnv          string
	GeminiAPIKey    string
	AuthServiceURL  string
	UserServiceURL  string
	DestServiceURL  string
}

func Load() *Config {
	_ = godotenv.Load()

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Println("⚠️ WARNING: GEMINI_API_KEY is not set in .env file!")
	}

	return &Config{
		AppPort:        getEnv("APP_PORT", "8089"),
		AppEnv:         getEnv("APP_ENV", "development"),
		GeminiAPIKey:   apiKey,
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