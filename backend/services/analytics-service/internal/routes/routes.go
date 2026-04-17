package routes

import (
	"analytics-service/internal/config"
	"analytics-service/internal/handler"
	"analytics-service/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, analyticsHandler *handler.AnalyticsHandler, cfg *config.Config) {
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "analytics-service",
			"message": "Analytics service is running",
		})
	})

	// API v1 routes (admin only)
	v1 := router.Group("/api/v1/admin/analytics")
	v1.Use(middleware.AuthMiddleware(cfg))
	{
		v1.GET("/bookings", analyticsHandler.GetBookingAnalytics)
		v1.GET("/revenue", analyticsHandler.GetRevenueAnalytics)
		v1.GET("/popular-destinations", analyticsHandler.GetPopularDestinations)
		v1.GET("/user-growth", analyticsHandler.GetUserGrowth)
		v1.GET("/reviews", analyticsHandler.GetReviewAnalytics)
		v1.GET("/dashboard", analyticsHandler.GetDashboardSummary)
	}
}