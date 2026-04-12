package routes

import (
	"destination-service/internal/config"
	"destination-service/internal/handler"
	"destination-service/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, destinationHandler *handler.DestinationHandler, cfg *config.Config) {
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "destination-service",
			"message": "Destination service is running",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Public endpoints (no auth required)
		public := v1.Group("/destinations")
		{
			public.GET("", destinationHandler.ListDestinations)
			public.GET("/featured", destinationHandler.GetFeaturedDestinations)
			public.GET("/categories", destinationHandler.GetAllCategories)
			public.GET("/:id", destinationHandler.GetDestinationByID)
			public.GET("/slug/:slug", destinationHandler.GetDestinationBySlug)
		}

		// Admin endpoints (require authentication + admin role)
		admin := v1.Group("/admin/destinations")
		admin.Use(middleware.AuthMiddleware(cfg))
		admin.Use(middleware.RoleMiddleware("admin"))
		{
			admin.POST("", destinationHandler.CreateDestination)
			admin.PUT("/:id", destinationHandler.UpdateDestination)
			admin.DELETE("/:id", destinationHandler.DeleteDestination)
			admin.POST("/categories", destinationHandler.CreateCategory)
		}
	}
}