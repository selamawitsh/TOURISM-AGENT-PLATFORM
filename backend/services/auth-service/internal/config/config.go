package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppName                    string
	AppEnv                     string
	AppPort                    string
	DatabaseURL                string
	JWTSecret                  string
	JWTAccessTokenExpiresMin   int
	JWTRefreshTokenExpiresHour int
	FrontendURL                string
}

func Load() *Config {
	_ = godotenv.Load()

	accessTokenMin, err := strconv.Atoi(getEnv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "15"))
	if err != nil {
		log.Fatal("invalid JWT_ACCESS_TOKEN_EXPIRES_MINUTES")
	}

	refreshTokenHour, err := strconv.Atoi(getEnv("JWT_REFRESH_TOKEN_EXPIRES_HOURS", "168"))
	if err != nil {
		log.Fatal("invalid JWT_REFRESH_TOKEN_EXPIRES_HOURS")
	}

	return &Config{
		AppName:                    getEnv("APP_NAME", "auth-service"),
		AppEnv:                     getEnv("APP_ENV", "development"),
		AppPort:                    getEnv("APP_PORT", "8081"),
		DatabaseURL:                getEnv("DATABASE_URL", ""),
		JWTSecret:                  getEnv("JWT_SECRET", ""),
		JWTAccessTokenExpiresMin:   accessTokenMin,
		JWTRefreshTokenExpiresHour: refreshTokenHour,
		FrontendURL:                getEnv("FRONTEND_URL", "http://localhost:5173"),
	}
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}