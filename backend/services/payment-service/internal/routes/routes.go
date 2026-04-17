package routes

import (
	"payment-service/internal/config"
	"payment-service/internal/handler"
	"payment-service/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, paymentHandler *handler.PaymentHandler, cfg *config.Config) {
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "payment-service",
			"message": "Payment service is running",
		})
	})
	
	// Webhook (public - no auth)
	router.POST("/api/v1/payments/webhook", paymentHandler.Webhook)
	
	// API v1 routes
	v1 := router.Group("/api/v1")
	v1.Use(middleware.AuthMiddleware(cfg))
	{
		payments := v1.Group("/payments")
		{
			payments.POST("/initialize", paymentHandler.InitializePayment)
			payments.GET("/verify/:transaction_ref", paymentHandler.VerifyPayment)
			payments.GET("/status/:transaction_ref", paymentHandler.GetPaymentStatus)
		}
	}
}