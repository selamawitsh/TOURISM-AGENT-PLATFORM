package main

import (
	"log"
	"os"
	"strings"
	"time"

	"tourism-platform/backend/gateway/internal/config"
	"tourism-platform/backend/gateway/internal/handler"
	"tourism-platform/backend/gateway/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load config
	cfg := config.Load()

	// Production mode
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router
	router := gin.New()

	// Trust proxy headers from Render
	router.SetTrustedProxies(nil)

	// ==================================================
	// ALLOWED ORIGINS
	// ==================================================
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	var origins []string

	if allowedOrigins != "" {
		origins = strings.Split(allowedOrigins, ",")
	} else {
		origins = []string{
			"https://tourism-frontend-kappa.vercel.app",
			"https://tourism-frontend-85qdjnbf4-selamawitshs-projects.vercel.app",
			"http://localhost:5173",
			"http://localhost:3000",
		}
	}

	// ==================================================
	// CRITICAL: HANDLE OPTIONS PREFLIGHT FIRST
	// ==================================================
	router.OPTIONS("/*path", func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		
		// Check if origin is allowed
		allowed := false
		for _, o := range origins {
			if o == origin {
				allowed = true
				break
			}
		}
		
		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD")
			c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Max-Age", "86400")
		}
		
		c.AbortWithStatus(204)
	})

	// ==================================================
	// CORS MIDDLEWARE
	// ==================================================
	router.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Recovery and Logging
	router.Use(gin.Recovery())
	router.Use(middleware.LoggingMiddleware())

	// ==================================================
	// HANDLERS
	// ==================================================
	proxyHandler := handler.NewProxyHandler(cfg)

	// ==================================================
	// PUBLIC ROUTES
	// ==================================================

	router.GET("/health", proxyHandler.HealthCheck)
	router.GET("/api/v1/health", proxyHandler.HealthCheck)

	// Auth
	auth := router.Group("/api/v1/auth")
	{
		auth.POST("/login", proxyHandler.ProxyRequest)
		auth.POST("/register", proxyHandler.ProxyRequest)
		auth.POST("/refresh", proxyHandler.ProxyRequest)
		auth.POST("/verify-email", proxyHandler.ProxyRequest)
		auth.POST("/resend-verification", proxyHandler.ProxyRequest)
		auth.POST("/forgot-password", proxyHandler.ProxyRequest)
		auth.POST("/reset-password", proxyHandler.ProxyRequest)
	}

	// Destinations (PUBLIC)
	dest := router.Group("/api/v1/destinations")
	{
		dest.GET("", proxyHandler.ProxyRequest)
		dest.GET("/featured", proxyHandler.ProxyRequest)
		dest.GET("/categories", proxyHandler.ProxyRequest)
		dest.GET("/:id", proxyHandler.ProxyRequest)
		dest.GET("/slug/:slug", proxyHandler.ProxyRequest)
	}

	// Public reviews
	router.GET("/api/v1/reviews/destinations/:destinationId", proxyHandler.ProxyRequest)

	// AI Public
	ai := router.Group("/api/v1/ai")
	{
		ai.POST("/parse", proxyHandler.ProxyRequest)
		ai.POST("/itinerary", proxyHandler.ProxyRequest)
		ai.POST("/recommendations", proxyHandler.ProxyRequest)
		ai.POST("/enhance-destination", proxyHandler.ProxyRequest)
		ai.POST("/smart-booking-recommendation", proxyHandler.ProxyRequest)
		ai.POST("/dynamic-pricing", proxyHandler.ProxyRequest)
	}

	// ==================================================
	// PROTECTED ROUTES
	// ==================================================

	protected := router.Group("/api/v1")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		// Users
		protected.GET("/users/me", proxyHandler.ProxyRequest)
		protected.PUT("/users/me", proxyHandler.ProxyRequest)

		// Bookings
		protected.POST("/bookings", proxyHandler.ProxyRequest)
		protected.GET("/bookings", proxyHandler.ProxyRequest)
		protected.GET("/bookings/:id", proxyHandler.ProxyRequest)
		protected.POST("/bookings/:id/cancel", proxyHandler.ProxyRequest)

		// Favorites
		protected.POST("/favorites", proxyHandler.ProxyRequest)
		protected.DELETE("/favorites/:destinationId", proxyHandler.ProxyRequest)
		protected.GET("/favorites", proxyHandler.ProxyRequest)
		protected.GET("/favorites/check/:destinationId", proxyHandler.ProxyRequest)

		// Reviews
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
		admin := protected.Group("/admin")
		{
			admin.GET("/users", proxyHandler.ProxyRequest)
			admin.GET("/users/:id", proxyHandler.ProxyRequest)
			admin.POST("/users", proxyHandler.ProxyRequest)
			admin.PATCH("/users/:id/role", proxyHandler.ProxyRequest)
			admin.DELETE("/users/:id", proxyHandler.ProxyRequest)

			admin.POST("/destinations", proxyHandler.ProxyRequest)
			admin.PUT("/destinations/:id", proxyHandler.ProxyRequest)
			admin.DELETE("/destinations/:id", proxyHandler.ProxyRequest)
			admin.POST("/destinations/categories", proxyHandler.ProxyRequest)

			admin.GET("/bookings", proxyHandler.ProxyRequest)

			admin.GET("/analytics/dashboard", proxyHandler.ProxyRequest)
			admin.GET("/analytics/bookings", proxyHandler.ProxyRequest)
			admin.GET("/analytics/revenue", proxyHandler.ProxyRequest)
			admin.GET("/analytics/popular-destinations", proxyHandler.ProxyRequest)
			admin.GET("/analytics/user-growth", proxyHandler.ProxyRequest)
			admin.GET("/analytics/reviews", proxyHandler.ProxyRequest)
		}
	}

	// ==================================================
	// START SERVER
	// ==================================================

	log.Printf("🚀 API Gateway running on port %s", cfg.GatewayPort)
	log.Printf("📦 Environment: %s", cfg.AppEnv)
	log.Printf("🔗 Allowed Origins: %v", origins)
	log.Printf("⚡ Rate Limit: %d req/sec | burst %d", cfg.RateLimitPerSecond, cfg.RateLimitBurst)

	if err := router.Run(":" + cfg.GatewayPort); err != nil {
		log.Fatal(err)
	}
}