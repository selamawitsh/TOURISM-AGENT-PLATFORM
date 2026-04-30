package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	GatewayPort           string
	RateLimitPerSecond    int
	RateLimitBurst        int
	AuthServiceURL        string
	UserServiceURL        string
	DestinationServiceURL string
	BookingServiceURL     string
	FavoritesServiceURL   string
	ReviewServiceURL      string
	PaymentServiceURL     string
	AnalyticsServiceURL   string
	AIServiceURL          string
	JWTSecret             string
	AppEnv                string
}

func Load() *Config {
	_ = godotenv.Load()

	rateLimit, _ := strconv.Atoi(getEnv("RATE_LIMIT_PER_SECOND", "100"))
	rateBurst, _ := strconv.Atoi(getEnv("RATE_LIMIT_BURST", "200"))

	port := os.Getenv("PORT")
	if port == "" {
		port = getEnv("GATEWAY_PORT", "8080")
	}

	return &Config{
		GatewayPort:           port,
		RateLimitPerSecond:    rateLimit,
		RateLimitBurst:        rateBurst,
		AuthServiceURL:        getEnv("AUTH_SERVICE_URL", "https://auth-service-bgpc.onrender.com"),
		UserServiceURL:        getEnv("USER_SERVICE_URL", "https://user-service-4dzu.onrender.com"),
		DestinationServiceURL: getEnv("DESTINATION_SERVICE_URL", "https://destination-service-b1i7.onrender.com"),
		BookingServiceURL:     getEnv("BOOKING_SERVICE_URL", "https://booking-service-e6a5.onrender.com"),
		FavoritesServiceURL:   getEnv("FAVORITES_SERVICE_URL", "https://favorites-service-eq29.onrender.com"),
		ReviewServiceURL:      getEnv("REVIEW_SERVICE_URL", "https://review-service-rl4v.onrender.com"),
		PaymentServiceURL:     getEnv("PAYMENT_SERVICE_URL", "https://payment-service-o5ma.onrender.com"),
		AnalyticsServiceURL:   getEnv("ANALYTICS_SERVICE_URL", "https://analytics-service-i0j9.onrender.com"),
		AIServiceURL:          getEnv("AI_SERVICE_URL", "https://ai-service-06yq.onrender.com"),
		JWTSecret:             getEnv("JWT_SECRET", "tourism@1234567890"),
		AppEnv:                getEnv("APP_ENV", "production"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func (c *Config) GetServiceURL(path string) string {
	log.Printf("[GATEWAY] Checking path: %s", path)

	if strings.HasPrefix(path, "/api/v1/auth") {
		return c.AuthServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/admin/users") {
		return c.UserServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/users") {
		return c.UserServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/admin/destinations") {
		return c.DestinationServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/destinations") {
		return c.DestinationServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/admin/bookings") {
		return c.BookingServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/bookings") {
		return c.BookingServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/favorites") {
		return c.FavoritesServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/reviews") {
		return c.ReviewServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/payments") {
		return c.PaymentServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/admin/analytics") {
		return c.AnalyticsServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/ai") {
		return c.AIServiceURL
	}
	if strings.HasPrefix(path, "/ai") {
		return c.AIServiceURL
	}

	return ""
}

/// RequiresAuth checks if a path requires authentication
func (c *Config) RequiresAuth(path string) bool {
	// List of public path prefixes (case insensitive)
	publicPaths := []string{
		"/health",
		"/api/v1/health",
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
		"/api/v1/reviews/destinations",
		"/api/v1/ai/parse",
		"/api/v1/ai/itinerary",
		"/api/v1/ai/recommendations",
		"/api/v1/ai/enhance-destination",
		"/api/v1/ai/smart-booking-recommendation",
		"/api/v1/ai/dynamic-pricing",
	}
	
	// Check if path starts with any public path
	for _, publicPath := range publicPaths {
		if strings.HasPrefix(path, publicPath) {
			// Exclude admin routes within these paths
			if strings.Contains(path, "/admin/") {
				return true
			}
			return false
		}
	}
	
	// All other paths require authentication
	return true
}