package main

import (
	"log"

	"destination-service/internal/config"
	"destination-service/internal/database"
	"destination-service/internal/handler"
	"destination-service/internal/repository"
	"destination-service/internal/routes"
	"destination-service/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db := database.ConnectDB(cfg)

	// Initialize repository
	destinationRepo := repository.NewDestinationRepository(db)

	// Initialize service
	destinationService := service.NewDestinationService(destinationRepo)

	// Initialize handler
	destinationHandler := handler.NewDestinationHandler(destinationService)

	// Create Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:3000", "https://frontend-nextjs-self.vercel.app", "https://frontend-nextjs-self.vercel.app",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Register routes
	routes.RegisterRoutes(router, destinationHandler, cfg)

	// Start server
	log.Printf("Destination service running on port %s", cfg.AppPort)
	log.Printf("Environment: %s", cfg.AppEnv)

	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}