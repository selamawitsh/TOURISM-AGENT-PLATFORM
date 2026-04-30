package routes

import (
	"destination-service/internal/config"
	"destination-service/internal/handler"
	"destination-service/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(
	router *gin.Engine,
	destinationHandler *handler.DestinationHandler,
	cfg *config.Config,
) {

	// ==================================================
	// HEALTH CHECK
	// ==================================================
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "destination-service",
			"message": "Destination service is running",
		})
	})

	// ==================================================
	// API V1
	// ==================================================
	v1 := router.Group("/api/v1")

	// ==================================================
	// PUBLIC ROUTES (NO AUTH)
	// IMPORTANT: ORDER MATTERS
	// ==================================================
	public := v1.Group("/destinations")
	{
		public.GET("", destinationHandler.ListDestinations)

		// 🔥 FIX: static routes MUST come BEFORE dynamic routes
		public.GET("/featured", destinationHandler.GetFeaturedDestinations)
		public.GET("/categories", destinationHandler.GetAllCategories)
		public.GET("/slug/:slug", destinationHandler.GetDestinationBySlug)

		// ⚠️ MUST BE LAST (VERY IMPORTANT)
		public.GET("/:id", destinationHandler.GetDestinationByID)
	}

	// ==================================================
	// ADMIN ROUTES (PROTECTED)
	// ==================================================
	admin := v1.Group("/admin/destinations")
	{
		admin.Use(middleware.AuthMiddleware(cfg))
		admin.Use(middleware.RoleMiddleware("admin"))

		admin.POST("", destinationHandler.CreateDestination)
		admin.PUT("/:id", destinationHandler.UpdateDestination)
		admin.DELETE("/:id", destinationHandler.DeleteDestination)

		admin.POST("/categories", destinationHandler.CreateCategory)
	}
}