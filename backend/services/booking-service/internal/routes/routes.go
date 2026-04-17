package routes

import (
	"booking-service/internal/config"
	"booking-service/internal/handler"
	"booking-service/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, bookingHandler *handler.BookingHandler, cfg *config.Config) {
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "booking-service",
			"message": "Booking service is running",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Protected routes (require authentication)
		bookings := v1.Group("/bookings")
		bookings.Use(middleware.AuthMiddleware(cfg))
		{
			bookings.POST("", bookingHandler.CreateBooking)
			bookings.GET("", bookingHandler.GetMyBookings)
			bookings.GET("/:id", bookingHandler.GetBookingByID)
			bookings.POST("/:id/cancel", bookingHandler.CancelBooking)
		}
		
		// Admin routes
		admin := v1.Group("/admin/bookings")
		admin.Use(middleware.AuthMiddleware(cfg))
		admin.Use(middleware.RoleMiddleware("admin"))
		{
			admin.GET("", bookingHandler.GetAllBookings)
		}
		// Public endpoint for payment service (no auth)
		v1.GET("/bookings/public/:id", bookingHandler.GetBookingByIDForPayment)
	}
}