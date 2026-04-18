package config

import (
	"os"
	"strconv"
	"strings"
	"log"

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

// GetServiceURL maps request path to service URL - FULLY CORRECTED
func (c *Config) GetServiceURL(path string) string {
	log.Printf("[GATEWAY] Checking path: %s", path)
	
	// Auth service
	if strings.HasPrefix(path, "/api/v1/auth") {
		log.Printf("[GATEWAY] Routing to Auth Service")
		return c.AuthServiceURL
	}
	
	// User service - IMPORTANT: Check admin routes FIRST!
	if strings.HasPrefix(path, "/api/v1/admin/users") {
		log.Printf("[GATEWAY] Routing to User Service (admin)")
		return c.UserServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/users") {
		log.Printf("[GATEWAY] Routing to User Service")
		return c.UserServiceURL
	}
	
	// Destination service - IMPORTANT: Check admin routes FIRST!
	if strings.HasPrefix(path, "/api/v1/admin/destinations") {
		log.Printf("[GATEWAY] Routing to Destination Service (admin)")
		return c.DestinationServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/destinations") {
		log.Printf("[GATEWAY] Routing to Destination Service")
		return c.DestinationServiceURL
	}
	
	// Booking service
	if strings.HasPrefix(path, "/api/v1/admin/bookings") {
		log.Printf("[GATEWAY] Routing to Booking Service (admin)")
		return c.BookingServiceURL
	}
	if strings.HasPrefix(path, "/api/v1/bookings") {
		log.Printf("[GATEWAY] Routing to Booking Service")
		return c.BookingServiceURL
	}
	
	// Favorites service
	if strings.HasPrefix(path, "/api/v1/favorites") {
		log.Printf("[GATEWAY] Routing to Favorites Service")
		return c.FavoritesServiceURL
	}
	
	// Review service
	if strings.HasPrefix(path, "/api/v1/reviews") {
		log.Printf("[GATEWAY] Routing to Review Service")
		return c.ReviewServiceURL
	}
	
	// Payment service
	if strings.HasPrefix(path, "/api/v1/payments") {
		log.Printf("[GATEWAY] Routing to Payment Service")
		return c.PaymentServiceURL
	}
	
	// Analytics service
	if strings.HasPrefix(path, "/api/v1/admin/analytics") {
		log.Printf("[GATEWAY] Routing to Analytics Service")
		return c.AnalyticsServiceURL
	}
	
	log.Printf("[GATEWAY] ❌ No service found for path: %s", path)
	return ""
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
	
	// GET /api/v1/users/:id is public (public profile)
	if strings.HasPrefix(path, "/api/v1/users/") && !strings.Contains(path, "/admin/") {
		return false
	}
	
	return true
}