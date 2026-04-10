package config

import (
	"os"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the user service
type Config struct {
	// App settings
	AppName string
	AppEnv  string
	AppPort string

	// Database settings
	DatabaseURL string

	// JWT settings (shared with auth service to verify tokens)
	JWTSecret string

	// Auth Service URL (for communication)
	AuthServiceURL string
}

// Load reads all environment variables and returns a Config object
func Load() *Config {
	// Try to load .env file (ignore error if it doesn't exist)
	_ = godotenv.Load()

	// Create a new Config object with values from environment variables
	return &Config{
		AppName:        getEnv("APP_NAME", "user-service"),
		AppEnv:         getEnv("APP_ENV", "development"),
		AppPort:        getEnv("APP_PORT", "8082"),
		DatabaseURL:    getEnv("DATABASE_URL", ""),
		JWTSecret:      getEnv("JWT_SECRET", ""),
		AuthServiceURL: getEnv("AUTH_SERVICE_URL", "http://localhost:8081"),
	}
}

// getEnv gets an environment variable or returns a fallback value
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}