package main

import (
	"log"

	"analytics-service/internal/config"
	"analytics-service/internal/database"
	"analytics-service/internal/handler"
	"analytics-service/internal/repository"
	"analytics-service/internal/routes"
	"analytics-service/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db := database.ConnectDB(cfg)

	// Initialize repository
	analyticsRepo := repository.NewAnalyticsRepository(db)

	// Initialize service
	analyticsService := service.NewAnalyticsService(analyticsRepo, cfg)

	// Initialize handler
	analyticsHandler := handler.NewAnalyticsHandler(analyticsService)

	// Create Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:3000",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Register routes
	routes.RegisterRoutes(router, analyticsHandler, cfg)

	// Start server
	log.Printf("Analytics service running on port %s", cfg.AppPort)
	log.Printf("Environment: %s", cfg.AppEnv)

	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}