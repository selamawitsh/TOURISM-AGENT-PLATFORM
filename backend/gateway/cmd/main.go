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
	
	// Get allowed origins from environment variable
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	var origins []string
	if allowedOrigins != "" {
		origins = strings.Split(allowedOrigins, ",")
	} else {
		origins = []string{
			"http://localhost:5173",
			"http://localhost:3000",
			"https://tourism-frontend-kappa.vercel.app",
		}
	}
	
	// CORS configuration - THIS MUST BE FIRST AND HANDLE OPTIONS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", "X-User-ID", "X-User-Role"},
		ExposeHeaders:    []string{"Content-Length", "Authorization"},
		AllowCredentials: true,
		MaxAge:           86400,
	}))

	// Handle ALL OPTIONS requests before any other middleware
	router.OPTIONS("/*path", func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With, X-User-ID, X-User-Role")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Max-Age", "86400")
		c.Status(204)
		c.Abort()
		return
	})

	// Rate limiter after CORS
	router.Use(middleware.RateLimiterMiddleware(cfg.RateLimitPerSecond, cfg.RateLimitBurst))

	// Create proxy handler
	proxyHandler := handler.NewProxyHandler(cfg)

	// ========== PUBLIC ROUTES (No Authentication) ==========
	// Health
	router.GET("/health", proxyHandler.HealthCheck)
	router.GET("/api/v1/health", proxyHandler.HealthCheck)

	// Auth routes
	router.POST("/api/v1/auth/login", proxyHandler.ProxyRequest)
	router.POST("/api/v1/auth/register", proxyHandler.ProxyRequest)
	router.POST("/api/v1/auth/refresh", proxyHandler.ProxyRequest)
	router.POST("/api/v1/auth/verify-email", proxyHandler.ProxyRequest)
	router.POST("/api/v1/auth/resend-verification", proxyHandler.ProxyRequest)
	router.POST("/api/v1/auth/forgot-password", proxyHandler.ProxyRequest)
	router.POST("/api/v1/auth/reset-password", proxyHandler.ProxyRequest)

	// Destination routes (public)
	router.GET("/api/v1/destinations", proxyHandler.ProxyRequest)
	router.GET("/api/v1/destinations/featured", proxyHandler.ProxyRequest)
	router.GET("/api/v1/destinations/categories", proxyHandler.ProxyRequest)
	router.GET("/api/v1/destinations/:id", proxyHandler.ProxyRequest)
	router.GET("/api/v1/destinations/slug/:slug", proxyHandler.ProxyRequest)

	// Review routes (public for viewing)
	router.GET("/api/v1/reviews/destinations/:destinationId", proxyHandler.ProxyRequest)

	// AI routes (public)
	router.POST("/api/v1/ai/parse", proxyHandler.ProxyRequest)
	router.POST("/api/v1/ai/itinerary", proxyHandler.ProxyRequest)
	router.POST("/api/v1/ai/recommendations", proxyHandler.ProxyRequest)
	router.POST("/api/v1/ai/enhance-destination", proxyHandler.ProxyRequest)
	router.POST("/api/v1/ai/smart-booking-recommendation", proxyHandler.ProxyRequest)
	router.POST("/api/v1/ai/dynamic-pricing", proxyHandler.ProxyRequest)

	// ========== PROTECTED ROUTES (Authentication Required) ==========
	// Apply auth middleware to these routes
	auth := router.Group("/")
	auth.Use(middleware.AuthMiddleware(cfg))
	{
		// User endpoints
		auth.GET("/api/v1/users/me", proxyHandler.ProxyRequest)
		auth.PUT("/api/v1/users/me", proxyHandler.ProxyRequest)
		
		// Booking endpoints
		auth.POST("/api/v1/bookings", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/bookings", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/bookings/:id", proxyHandler.ProxyRequest)
		auth.POST("/api/v1/bookings/:id/cancel", proxyHandler.ProxyRequest)
		
		// Favorites endpoints
		auth.POST("/api/v1/favorites", proxyHandler.ProxyRequest)
		auth.DELETE("/api/v1/favorites/:destinationId", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/favorites", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/favorites/check/:destinationId", proxyHandler.ProxyRequest)
		
		// Review endpoints (write operations)
		auth.POST("/api/v1/reviews", proxyHandler.ProxyRequest)
		auth.PUT("/api/v1/reviews/:id", proxyHandler.ProxyRequest)
		auth.DELETE("/api/v1/reviews/:id", proxyHandler.ProxyRequest)
		auth.POST("/api/v1/reviews/:id/helpful", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/reviews/me", proxyHandler.ProxyRequest)
		
		// Payment endpoints
		auth.POST("/api/v1/payments/initialize", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/payments/verify/:transactionRef", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/payments/status/:transactionRef", proxyHandler.ProxyRequest)
		
		// Admin endpoints
		auth.GET("/api/v1/admin/users", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/admin/users/:id", proxyHandler.ProxyRequest)
		auth.POST("/api/v1/admin/users", proxyHandler.ProxyRequest)
		auth.PATCH("/api/v1/admin/users/:id/role", proxyHandler.ProxyRequest)
		auth.DELETE("/api/v1/admin/users/:id", proxyHandler.ProxyRequest)
		auth.POST("/api/v1/admin/destinations", proxyHandler.ProxyRequest)
		auth.PUT("/api/v1/admin/destinations/:id", proxyHandler.ProxyRequest)
		auth.DELETE("/api/v1/admin/destinations/:id", proxyHandler.ProxyRequest)
		auth.POST("/api/v1/admin/destinations/categories", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/admin/bookings", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/admin/analytics/dashboard", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/admin/analytics/bookings", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/admin/analytics/revenue", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/admin/analytics/popular-destinations", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/admin/analytics/user-growth", proxyHandler.ProxyRequest)
		auth.GET("/api/v1/admin/analytics/reviews", proxyHandler.ProxyRequest)
	}

	// Start server
	log.Printf("🚀 API Gateway running on port %s", cfg.GatewayPort)
	log.Printf("📦 Environment: %s", cfg.AppEnv)
	log.Printf("🔗 CORS Allowed Origins: %v", origins)
	log.Printf("⚡ Rate limit: %d requests/sec, burst: %d", cfg.RateLimitPerSecond, cfg.RateLimitBurst)
	log.Println("")
	log.Println("📌 PUBLIC ROUTES (no auth required):")
	log.Println("   GET    /health, /api/v1/health")
	log.Println("   GET    /api/v1/destinations*")
	log.Println("   GET    /api/v1/destinations/categories")
	log.Println("   POST   /api/v1/auth/*")
	log.Println("   POST   /api/v1/ai/*")
	log.Println("")
	log.Println("🔒 PROTECTED ROUTES (auth required):")
	log.Println("   /api/v1/users/*, /api/v1/bookings/*, /api/v1/favorites/*")
	log.Println("   /api/v1/payments/*, /api/v1/admin/*")

	if err := router.Run(":" + cfg.GatewayPort); err != nil {
		log.Fatal("Failed to start gateway: ", err)
	}
}