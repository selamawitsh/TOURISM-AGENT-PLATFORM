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

	// Trust proxies (important for Render / proxies)
	router.SetTrustedProxies(nil)

	// ================================
	// ALLOWED ORIGINS
	// ================================
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

	// ================================
	// GLOBAL MIDDLEWARE ORDER (IMPORTANT)
	// ================================

	// 1. Recovery FIRST
	router.Use(gin.Recovery())

	// 2. Logging
	router.Use(middleware.LoggingMiddleware())

	// 3. CORS (CRITICAL FIX)
	router.Use(cors.New(cors.Config{
		AllowOrigins: origins,
		AllowMethods: []string{
			"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"X-Requested-With",
		},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,

		// IMPORTANT: strict origin validation
		AllowOriginFunc: func(origin string) bool {
			for _, o := range origins {
				if o == origin {
					return true
				}
			}
			return false
		},
	}))

	// 4. EXTRA SAFETY HEADER FIX (VERY IMPORTANT FOR PROXY)
	router.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		if origin != "" {
			for _, o := range origins {
				if o == origin {
					c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
					c.Writer.Header().Set("Vary", "Origin")
					break
				}
			}
		}

		c.Next()
	})

	// ================================
	// HANDLERS
	// ================================
	proxyHandler := handler.NewProxyHandler(cfg)

	// ================================
	// PUBLIC ROUTES
	// ================================

	router.GET("/health", proxyHandler.HealthCheck)
	router.GET("/api/v1/health", proxyHandler.HealthCheck)

	// AUTH
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

	// DESTINATIONS (PUBLIC)
	dest := router.Group("/api/v1/destinations")
	{
		dest.GET("", proxyHandler.ProxyRequest)
		dest.GET("/featured", proxyHandler.ProxyRequest)
		dest.GET("/categories", proxyHandler.ProxyRequest)
		dest.GET("/:id", proxyHandler.ProxyRequest)
		dest.GET("/slug/:slug", proxyHandler.ProxyRequest)
	}

	// REVIEWS
	router.GET("/api/v1/reviews/destinations/:destinationId", proxyHandler.ProxyRequest)

	// AI
	ai := router.Group("/api/v1/ai")
	{
		ai.POST("/parse", proxyHandler.ProxyRequest)
		ai.POST("/itinerary", proxyHandler.ProxyRequest)
		ai.POST("/recommendations", proxyHandler.ProxyRequest)
		ai.POST("/enhance-destination", proxyHandler.ProxyRequest)
		ai.POST("/smart-booking-recommendation", proxyHandler.ProxyRequest)
		ai.POST("/dynamic-pricing", proxyHandler.ProxyRequest)
	}

	// ================================
	// PROTECTED ROUTES
	// ================================
	protected := router.Group("/api/v1")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		protected.GET("/users/me", proxyHandler.ProxyRequest)
		protected.PUT("/users/me", proxyHandler.ProxyRequest)

		protected.POST("/bookings", proxyHandler.ProxyRequest)
		protected.GET("/bookings", proxyHandler.ProxyRequest)
		protected.GET("/bookings/:id", proxyHandler.ProxyRequest)
		protected.POST("/bookings/:id/cancel", proxyHandler.ProxyRequest)

		protected.POST("/favorites", proxyHandler.ProxyRequest)
		protected.DELETE("/favorites/:destinationId", proxyHandler.ProxyRequest)
		protected.GET("/favorites", proxyHandler.ProxyRequest)
		protected.GET("/favorites/check/:destinationId", proxyHandler.ProxyRequest)

		protected.POST("/reviews", proxyHandler.ProxyRequest)
		protected.PUT("/reviews/:id", proxyHandler.ProxyRequest)
		protected.DELETE("/reviews/:id", proxyHandler.ProxyRequest)

		protected.POST("/payments/initialize", proxyHandler.ProxyRequest)
		protected.GET("/payments/verify/:transactionRef", proxyHandler.ProxyRequest)
		protected.GET("/payments/status/:transactionRef", proxyHandler.ProxyRequest)

		// ADMIN
		admin := protected.Group("/admin")
		{
			admin.GET("/users", proxyHandler.ProxyRequest)
			admin.POST("/users", proxyHandler.ProxyRequest)
			admin.PATCH("/users/:id/role", proxyHandler.ProxyRequest)

			admin.POST("/destinations", proxyHandler.ProxyRequest)
			admin.PUT("/destinations/:id", proxyHandler.ProxyRequest)
			admin.DELETE("/destinations/:id", proxyHandler.ProxyRequest)

			admin.GET("/analytics/dashboard", proxyHandler.ProxyRequest)
		}
	}


	log.Printf("🚀 Gateway running on port %s", cfg.GatewayPort)
	log.Printf("📦 Environment: %s", cfg.AppEnv)
	log.Printf("🌍 Allowed Origins: %v", origins)

	if err := router.Run(":" + cfg.GatewayPort); err != nil {
		log.Fatal(err)
	}
}