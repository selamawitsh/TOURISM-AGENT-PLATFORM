package main

import (
	"log"

	"booking-service/internal/config"
	"booking-service/internal/database"
	"booking-service/internal/handler"
	"booking-service/internal/repository"
	"booking-service/internal/routes"
	"booking-service/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db := database.ConnectDB(cfg)

	// Initialize repository
	bookingRepo := repository.NewBookingRepository(db)

	// Initialize service
	bookingService := service.NewBookingService(bookingRepo, cfg)

	// Initialize handler
	bookingHandler := handler.NewBookingHandler(bookingService)

	// Create Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:3000",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Register routes
	routes.RegisterRoutes(router, bookingHandler, cfg)

	// Start server
	log.Printf("🚀 Booking service running on port %s", cfg.AppPort)
	log.Printf("📝 Environment: %s", cfg.AppEnv)
	log.Printf("🔗 Auth Service URL: %s", cfg.AuthServiceURL)
	log.Printf("🔗 User Service URL: %s", cfg.UserServiceURL)
	log.Printf("🔗 Destination Service URL: %s", cfg.DestServiceURL)

	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatal("❌ Failed to start server: ", err)
	}
}