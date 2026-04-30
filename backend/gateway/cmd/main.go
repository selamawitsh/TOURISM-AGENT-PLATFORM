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

	// Recovery middleware
	router.Use(gin.Recovery())
	router.Use(middleware.LoggingMiddleware())

	// Get allowed origins
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
	
	// CORS middleware - MUST BE FIRST
	router.Use(cors.New(cors.Config{
		AllowAllOrigins:  false,
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           86400,
	}))

	// Handle OPTIONS preflight
	router.OPTIONS("/*path", func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Max-Age", "86400")
		c.AbortWithStatus(204)
	})

	// Rate limiter
	router.Use(middleware.RateLimiterMiddleware(cfg.RateLimitPerSecond, cfg.RateLimitBurst))

	// Create proxy handler
	proxyHandler := handler.NewProxyHandler(cfg)

	// ============================================
	// PUBLIC ROUTES - NO AUTHENTICATION REQUIRED
	// ============================================
	
	// Health check
	router.GET("/health", proxyHandler.HealthCheck)
	router.GET("/api/v1/health", proxyHandler.HealthCheck)
	
	// Auth endpoints
	authGroup := router.Group("/api/v1/auth")
	{
		authGroup.POST("/login", proxyHandler.ProxyRequest)
		authGroup.POST("/register", proxyHandler.ProxyRequest)
		authGroup.POST("/refresh", proxyHandler.ProxyRequest)
		authGroup.POST("/verify-email", proxyHandler.ProxyRequest)
		authGroup.POST("/resend-verification", proxyHandler.ProxyRequest)
		authGroup.POST("/forgot-password", proxyHandler.ProxyRequest)
		authGroup.POST("/reset-password", proxyHandler.ProxyRequest)
	}
	
	// Destination endpoints (public)
	destGroup := router.Group("/api/v1/destinations")
	{
		destGroup.GET("", proxyHandler.ProxyRequest)
		destGroup.GET("/featured", proxyHandler.ProxyRequest)
		destGroup.GET("/categories", proxyHandler.ProxyRequest)
		destGroup.GET("/:id", proxyHandler.ProxyRequest)
		destGroup.GET("/slug/:slug", proxyHandler.ProxyRequest)
	}
	
	// Reviews (public view)
	router.GET("/api/v1/reviews/destinations/:destinationId", proxyHandler.ProxyRequest)
	
	// AI endpoints (public)
	aiGroup := router.Group("/api/v1/ai")
	{
		aiGroup.POST("/parse", proxyHandler.ProxyRequest)
		aiGroup.POST("/itinerary", proxyHandler.ProxyRequest)
		aiGroup.POST("/recommendations", proxyHandler.ProxyRequest)
		aiGroup.POST("/enhance-destination", proxyHandler.ProxyRequest)
		aiGroup.POST("/smart-booking-recommendation", proxyHandler.ProxyRequest)
		aiGroup.POST("/dynamic-pricing", proxyHandler.ProxyRequest)
	}

	// ============================================
	// PROTECTED ROUTES - AUTHENTICATION REQUIRED
	// ============================================
	
	// Apply auth middleware to all protected routes
	protected := router.Group("/api/v1")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		// User endpoints
		protected.GET("/users/me", proxyHandler.ProxyRequest)
		protected.PUT("/users/me", proxyHandler.ProxyRequest)
		
		// Booking endpoints
		protected.POST("/bookings", proxyHandler.ProxyRequest)
		protected.GET("/bookings", proxyHandler.ProxyRequest)
		protected.GET("/bookings/:id", proxyHandler.ProxyRequest)
		protected.POST("/bookings/:id/cancel", proxyHandler.ProxyRequest)
		
		// Favorites endpoints
		protected.POST("/favorites", proxyHandler.ProxyRequest)
		protected.DELETE("/favorites/:destinationId", proxyHandler.ProxyRequest)
		protected.GET("/favorites", proxyHandler.ProxyRequest)
		protected.GET("/favorites/check/:destinationId", proxyHandler.ProxyRequest)
		
		// Reviews (write)
		protected.POST("/reviews", proxyHandler.ProxyRequest)
		protected.PUT("/reviews/:id", proxyHandler.ProxyRequest)
		protected.DELETE("/reviews/:id", proxyHandler.ProxyRequest)
		protected.POST("/reviews/:id/helpful", proxyHandler.ProxyRequest)
		protected.GET("/reviews/me", proxyHandler.ProxyRequest)
		
		// Payments
		protected.POST("/payments/initialize", proxyHandler.ProxyRequest)
		protected.GET("/payments/verify/:transactionRef", proxyHandler.ProxyRequest)
		protected.GET("/payments/status/:transactionRef", proxyHandler.ProxyRequest)
		
		// Admin
		adminGroup := protected.Group("/admin")
		{
			adminGroup.GET("/users", proxyHandler.ProxyRequest)
			adminGroup.GET("/users/:id", proxyHandler.ProxyRequest)
			adminGroup.POST("/users", proxyHandler.ProxyRequest)
			adminGroup.PATCH("/users/:id/role", proxyHandler.ProxyRequest)
			adminGroup.DELETE("/users/:id", proxyHandler.ProxyRequest)
			adminGroup.POST("/destinations", proxyHandler.ProxyRequest)
			adminGroup.PUT("/destinations/:id", proxyHandler.ProxyRequest)
			adminGroup.DELETE("/destinations/:id", proxyHandler.ProxyRequest)
			adminGroup.POST("/destinations/categories", proxyHandler.ProxyRequest)
			adminGroup.GET("/bookings", proxyHandler.ProxyRequest)
			adminGroup.GET("/analytics/dashboard", proxyHandler.ProxyRequest)
			adminGroup.GET("/analytics/bookings", proxyHandler.ProxyRequest)
			adminGroup.GET("/analytics/revenue", proxyHandler.ProxyRequest)
			adminGroup.GET("/analytics/popular-destinations", proxyHandler.ProxyRequest)
			adminGroup.GET("/analytics/user-growth", proxyHandler.ProxyRequest)
			adminGroup.GET("/analytics/reviews", proxyHandler.ProxyRequest)
		}
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
	log.Println("   /api/v1/users/*")
	log.Println("   /api/v1/bookings/*")
	log.Println("   /api/v1/favorites/*")
	log.Println("   /api/v1/payments/*")
	log.Println("   /api/v1/admin/*")

	if err := router.Run(":" + cfg.GatewayPort); err != nil {
		log.Fatal("Failed to start gateway: ", err)
	}
}