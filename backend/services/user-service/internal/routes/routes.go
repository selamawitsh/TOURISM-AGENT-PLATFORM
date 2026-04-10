package routes

import (
	"user-service/internal/config"
	"user-service/internal/handler"
	"user-service/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up all HTTP routes for the user service
func RegisterRoutes(router *gin.Engine, userHandler *handler.UserHandler, cfg *config.Config) {
	// Health check endpoint (public, no auth needed)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "user-service",
			"message": "User service is running",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// User routes (require authentication)
		userRoutes := v1.Group("/users")
		userRoutes.Use(middleware.AuthMiddleware(cfg))
		{
			// Self-service endpoints (for the logged-in user)
			userRoutes.GET("/me", userHandler.GetProfile)
			userRoutes.PUT("/me", userHandler.UpdateProfile)
		}

		// Admin routes (require authentication + admin role)
		adminRoutes := v1.Group("/admin/users")
		adminRoutes.Use(middleware.AuthMiddleware(cfg))
		adminRoutes.Use(middleware.RoleMiddleware("admin"))
		{
			adminRoutes.GET("", userHandler.ListAllUsers)
			adminRoutes.GET("/:id", userHandler.GetUserByID)
			adminRoutes.PATCH("/:id/role", userHandler.UpdateUserRole)
			adminRoutes.DELETE("/:id", userHandler.DeleteUser)
		}
	}
}