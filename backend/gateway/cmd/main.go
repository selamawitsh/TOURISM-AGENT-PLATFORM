package main

import (
	"log"
	"os"
	"strings"

	"tourism-platform/backend/gateway/internal/config"      
	"tourism-platform/backend/gateway/internal/handler"    
	"tourism-platform/backend/gateway/internal/middleware" 

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Set Gin mode
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router
	router := gin.New()

	// Global middleware
	router.Use(gin.Recovery())
	router.Use(middleware.LoggingMiddleware())
	router.Use(middleware.RateLimiterMiddleware(cfg.RateLimitPerSecond, cfg.RateLimitBurst))
	
	// Get allowed origins from environment variable
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	var origins []string
	if allowedOrigins != "" {
		origins = strings.Split(allowedOrigins, ",")
	} else {
		// Default for development
		origins = []string{
			"http://localhost:5173",
			"http://localhost:3000",
		}
	}
	
	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	
	// Auth middleware (validates JWT for protected routes)
	router.Use(middleware.AuthMiddleware(cfg))

	// Create proxy handler
	proxyHandler := handler.NewProxyHandler(cfg)

	// Health check endpoint
	router.GET("/health", proxyHandler.HealthCheck)

	// API routes - all requests are proxied to appropriate services
	router.Any("/api/v1/*path", proxyHandler.ProxyRequest)

	// Start server
	log.Printf(" API Gateway running on port %s", cfg.GatewayPort)
	log.Printf("Environment: %s", cfg.AppEnv)
	log.Printf("CORS Allowed Origins: %v", origins)
	log.Printf("Rate limit: %d requests/sec, burst: %d", cfg.RateLimitPerSecond, cfg.RateLimitBurst)
	log.Println("")
	log.Println("Service URLs:")
	log.Printf("   Auth Service:        %s", cfg.AuthServiceURL)
	log.Printf("   User Service:        %s", cfg.UserServiceURL)
	log.Printf("   Destination Service: %s", cfg.DestinationServiceURL)
	log.Printf("   Booking Service:     %s", cfg.BookingServiceURL)
	log.Printf("   Favorites Service:   %s", cfg.FavoritesServiceURL)
	log.Printf("   Review Service:      %s", cfg.ReviewServiceURL)
	log.Printf("   Payment Service:     %s", cfg.PaymentServiceURL)
	log.Printf("   Analytics Service:   %s", cfg.AnalyticsServiceURL)

	if err := router.Run(":" + cfg.GatewayPort); err != nil {
		log.Fatal("Failed to start gateway: ", err)
	}
}