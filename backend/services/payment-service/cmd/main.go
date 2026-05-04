package main

import (
	"log"

	"payment-service/internal/config"
	"payment-service/internal/database"
	"payment-service/internal/handler"
	"payment-service/internal/repository"
	"payment-service/internal/routes"
	"payment-service/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db := database.ConnectDB(cfg)

	// Initialize repository
	paymentRepo := repository.NewPaymentRepository(db)

	// Initialize service
	paymentService := service.NewPaymentService(paymentRepo, cfg)

	// Initialize handler
	paymentHandler := handler.NewPaymentHandler(paymentService)

	// Create Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:3000", "https://frontend-nextjs-self.vercel.app", "https://frontend-nextjs-self.vercel.app",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Register routes
	routes.RegisterRoutes(router, paymentHandler, cfg)

	// Start server
	log.Printf("Payment service running on port %s", cfg.AppPort)
	log.Printf("Environment: %s", cfg.AppEnv)

	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}