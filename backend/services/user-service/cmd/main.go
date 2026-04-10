package main

import (
	"log"

	"user-service/internal/config"
	"user-service/internal/database"
	"user-service/internal/handler"
	"user-service/internal/repository"
	"user-service/internal/routes"
	"user-service/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration from .env file
	cfg := config.Load()

	// Connect to PostgreSQL database
	db := database.ConnectDB(cfg)

	// Initialize repository layer (handles database operations)
	userRepo := repository.NewUserRepository(db)

	// Initialize service layer (handles business logic)
	userService := service.NewUserService(userRepo)

	// Initialize handler layer (handles HTTP requests)
	userHandler := handler.NewUserHandler(userService)

	// Create Gin router
	router := gin.Default()

	// Add CORS middleware (allows frontend to communicate)
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:3000",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Register all routes
	routes.RegisterRoutes(router, userHandler, cfg)

	// Start the server
	log.Printf("User service running on port %s", cfg.AppPort)
	log.Printf("Environment: %s", cfg.AppEnv)
	log.Printf("Auth Service URL: %s", cfg.AuthServiceURL)

	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}