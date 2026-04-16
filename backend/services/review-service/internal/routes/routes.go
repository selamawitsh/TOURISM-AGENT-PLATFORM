package routes

import (
	"review-service/internal/config"
	"review-service/internal/handler"
	"review-service/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, reviewHandler *handler.ReviewHandler, cfg *config.Config) {
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "review-service",
			"message": "Review service is running",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Public endpoints (no auth required for viewing reviews)
		v1.GET("/reviews/destinations/:destination_id", reviewHandler.GetDestinationReviews)

		// Protected endpoints (require authentication)
		protected := v1.Group("/reviews")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			protected.POST("", reviewHandler.CreateReview)
			protected.GET("/me", reviewHandler.GetMyReviews)
			protected.PUT("/:id", reviewHandler.UpdateReview)
			protected.DELETE("/:id", reviewHandler.DeleteReview)
			protected.POST("/:id/helpful", reviewHandler.MarkHelpful)
		}
	}
}