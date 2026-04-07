package main

import (
	"log"

	"auth-service/internal/config"
	"auth-service/internal/database"
	"auth-service/internal/handler"
	"auth-service/internal/repository"
	"auth-service/internal/routes"
	"auth-service/internal/service"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db := database.ConnectDB(cfg)

	// Initialize repository layer
	authRepo := repository.NewAuthRepository(db)

	// Initialize service layer (business logic)
	authService := service.NewAuthService(authRepo, cfg)

	// Initialize handler layer (HTTP handlers)
	authHandler := handler.NewAuthHandler(authService)

	// Create Gin router
	router := gin.Default()

	// Add global middleware (optional but recommended)
	router.Use(gin.Logger())   // Log all requests
	router.Use(gin.Recovery()) // Recover from panics

	// Register all routes using your routes package
	// Pass router, authHandler, and cfg to the routes function
	routes.RegisterRoutes(router, authHandler, cfg)

	// Start server
	log.Printf("Auth service running on port %s", cfg.AppPort)
	log.Printf("Environment: %s", cfg.AppEnv)
	log.Printf("Frontend URL: %s", cfg.FrontendURL)
	
	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}