package routes

import (
	"auth-service/internal/config"
	"auth-service/internal/handler"
	"auth-service/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up all routes for the auth service
func RegisterRoutes(router *gin.Engine, authHandler *handler.AuthHandler, cfg *config.Config) {
	// Health check endpoint (public)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": cfg.AppName,
			"env":     cfg.AppEnv,
			"message": "Auth service is running",
		})
	})

	// API v1 auth routes
	v1 := router.Group("/api/v1/auth")
	{
		// Public routes (no authentication required)
		v1.POST("/register", authHandler.Register)
		v1.POST("/login", authHandler.Login)
		v1.POST("/refresh", authHandler.RefreshToken)
		v1.POST("/verify-email", authHandler.VerifyEmail)
		v1.POST("/resend-verification", authHandler.ResendVerification)
		v1.POST("/forgot-password", authHandler.ForgotPassword) 
		v1.POST("/reset-password", authHandler.ResetPassword)   

		// Protected routes (authentication required)
		protected := v1.Group("/")
		protected.Use(middleware.GinAuthMiddleware(cfg))
		{
			protected.GET("/me", authHandler.Me)
			protected.POST("/logout", authHandler.Logout)
		}
	}
}