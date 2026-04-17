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
	
	// Service URLs
	AuthServiceURL    string
	UserServiceURL    string
	DestServiceURL    string
	BookingServiceURL string
	ReviewServiceURL  string
	
	// Chapa Configuration
	ChapaSecretKey    string
	ChapaPublicKey    string
	ChapaBaseURL      string
	
	// Email Configuration
	SMTPHost          string
	SMTPPort          string
	SMTPFrom          string
	SMTPPassword      string
	
	// Frontend URLs
	FrontendURL       string
}

func Load() *Config {
	_ = godotenv.Load()

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Println("⚠️ WARNING: JWT_SECRET is not set in .env file!")
	}

	// Get Chapa secret key
	chapaSecret := os.Getenv("CHAPA_SECRET_KEY")
	if chapaSecret == "" {
		chapaSecret = os.Getenv("API_KEY")
	}
	if chapaSecret == "" {
		log.Println("⚠️ WARNING: CHAPA_SECRET_KEY is not set in .env file!")
	} else {
		log.Println("✅ Chapa Secret Key loaded successfully")
	}

	return &Config{
		AppName:           getEnv("APP_NAME", "payment-service"),
		AppEnv:            getEnv("APP_ENV", "development"),
		AppPort:           getEnv("APP_PORT", "8087"),
		DatabaseURL:       getEnv("DATABASE_URL", ""),
		JWTSecret:         jwtSecret,
		AuthServiceURL:    getEnv("AUTH_SERVICE_URL", "http://localhost:8081"),
		UserServiceURL:    getEnv("USER_SERVICE_URL", "http://localhost:8082"),
		DestServiceURL:    getEnv("DESTINATION_SERVICE_URL", "http://localhost:8083"),
		BookingServiceURL: getEnv("BOOKING_SERVICE_URL", "http://localhost:8084"),
		ReviewServiceURL:  getEnv("REVIEW_SERVICE_URL", "http://localhost:8086"),
		ChapaSecretKey:    chapaSecret,
		ChapaPublicKey:    getEnv("CHAPA_PUBLIC_KEY", ""),
		ChapaBaseURL:      getEnv("CHAPA_BASE_URL", "https://api.chapa.co/v1"),
		SMTPHost:          getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:          getEnv("SMTP_PORT", "587"),
		SMTPFrom:          getEnv("SMTP_FROM", ""),
		SMTPPassword:      getEnv("SMTP_PASSWORD", ""),
		FrontendURL:       getEnv("FRONTEND_URL", "http://localhost:5173"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}