package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	// Gateway settings
	GatewayPort string
	
	// Rate limiting
	RateLimitPerSecond int
	RateLimitBurst     int
	
	// Service URLs
	AuthServiceURL        string
	UserServiceURL        string
	DestinationServiceURL string
	BookingServiceURL     string
	FavoritesServiceURL   string
	ReviewServiceURL      string
	PaymentServiceURL     string
	AnalyticsServiceURL   string
	
	// JWT
	JWTSecret string
	
	// Environment
	AppEnv string
}

func Load() *Config {
	_ = godotenv.Load()

	rateLimit, _ := strconv.Atoi(getEnv("RATE_LIMIT_PER_SECOND", "100"))
	rateBurst, _ := strconv.Atoi(getEnv("RATE_LIMIT_BURST", "200"))

	return &Config{
		GatewayPort:           getEnv("GATEWAY_PORT", "8080"),
		RateLimitPerSecond:    rateLimit,
		RateLimitBurst:        rateBurst,
		AuthServiceURL:        getEnv("AUTH_SERVICE_URL", "http://localhost:8081"),
		UserServiceURL:        getEnv("USER_SERVICE_URL", "http://localhost:8082"),
		DestinationServiceURL: getEnv("DESTINATION_SERVICE_URL", "http://localhost:8083"),
		BookingServiceURL:     getEnv("BOOKING_SERVICE_URL", "http://localhost:8084"),
		FavoritesServiceURL:   getEnv("FAVORITES_SERVICE_URL", "http://localhost:8085"),
		ReviewServiceURL:      getEnv("REVIEW_SERVICE_URL", "http://localhost:8086"),
		PaymentServiceURL:     getEnv("PAYMENT_SERVICE_URL", "http://localhost:8087"),
		AnalyticsServiceURL:   getEnv("ANALYTICS_SERVICE_URL", "http://localhost:8088"),
		JWTSecret:             getEnv("JWT_SECRET", "tourism@1234567890"),
		AppEnv:                getEnv("APP_ENV", "development"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// GetServiceURL maps request path to service URL
func (c *Config) GetServiceURL(path string) string {
	switch {
	case strings.HasPrefix(path, "/api/v1/auth"):
		return c.AuthServiceURL
	case strings.HasPrefix(path, "/api/v1/users"):
		return c.UserServiceURL
	case strings.HasPrefix(path, "/api/v1/destinations"):
		return c.DestinationServiceURL
	case strings.HasPrefix(path, "/api/v1/bookings"):
		return c.BookingServiceURL
	case strings.HasPrefix(path, "/api/v1/favorites"):
		return c.FavoritesServiceURL
	case strings.HasPrefix(path, "/api/v1/reviews"):
		return c.ReviewServiceURL
	case strings.HasPrefix(path, "/api/v1/payments"):
		return c.PaymentServiceURL
	case strings.HasPrefix(path, "/api/v1/admin/analytics"):
		return c.AnalyticsServiceURL
	default:
		return ""
	}
}

// RequiresAuth checks if the path needs authentication
func (c *Config) RequiresAuth(path string) bool {
	// Public endpoints (no auth required)
	publicPaths := []string{
		"/api/v1/auth/login",
		"/api/v1/auth/register",
		"/api/v1/auth/refresh",
		"/api/v1/auth/verify-email",
		"/api/v1/auth/resend-verification",
		"/api/v1/auth/forgot-password",
		"/api/v1/auth/reset-password",
		"/api/v1/destinations",
		"/api/v1/destinations/featured",
		"/api/v1/destinations/categories",
		"/health",
	}
	
	for _, p := range publicPaths {
		if path == p {
			return false
		}
	}
	
	// GET /api/v1/destinations/:id is also public
	if strings.HasPrefix(path, "/api/v1/destinations/") && !strings.Contains(path, "/admin/") {
		return false
	}
	
	// GET /api/v1/reviews/destinations/:id is public
	if strings.HasPrefix(path, "/api/v1/reviews/destinations/") {
		return false
	}
	
	return true
}