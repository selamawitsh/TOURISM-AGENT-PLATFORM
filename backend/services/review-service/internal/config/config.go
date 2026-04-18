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
	BookingServiceURL string
}

func Load() *Config {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = getEnv("APP_PORT", "8081") 
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Println("WARNING: JWT_SECRET is not set in .env file!")
	}

	return &Config{
		AppName:           getEnv("APP_NAME", "review-service"),
		AppEnv:            getEnv("APP_ENV", "development"),
		AppPort:           port,
		DatabaseURL:       getEnv("DATABASE_URL", ""),
		JWTSecret:         jwtSecret,
		AuthServiceURL:    getEnv("AUTH_SERVICE_URL", "http://localhost:8081"),
		UserServiceURL:    getEnv("USER_SERVICE_URL", "http://localhost:8082"),
		DestServiceURL:    getEnv("DESTINATION_SERVICE_URL", "http://localhost:8083"),
		BookingServiceURL: getEnv("BOOKING_SERVICE_URL", "http://localhost:8084"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}