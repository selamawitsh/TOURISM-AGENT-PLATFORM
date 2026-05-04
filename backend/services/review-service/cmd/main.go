package main

import (
	"log"

	"review-service/internal/config"
	"review-service/internal/database"
	"review-service/internal/handler"
	"review-service/internal/repository"
	"review-service/internal/routes"
	"review-service/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db := database.ConnectDB(cfg)

	// Initialize repository
	reviewRepo := repository.NewReviewRepository(db)

	// Initialize service
	reviewService := service.NewReviewService(reviewRepo, cfg)

	// Initialize handler
	reviewHandler := handler.NewReviewHandler(reviewService)

	// Create Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:3000", "https://frontend-nextjs-self.vercel.app",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Register routes
	routes.RegisterRoutes(router, reviewHandler, cfg)

	// Start server
	log.Printf("Review service running on port %s", cfg.AppPort)
	log.Printf("Environment: %s", cfg.AppEnv)

	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}