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
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db := database.ConnectDB(cfg)

	// Initialize repository layer
	userRepo := repository.NewUserRepository(db)

	// Initialize service layer with Auth Service URL
	userService := service.NewUserService(userRepo, cfg.AuthServiceURL)

	// Initialize handler layer
	userHandler := handler.NewUserHandler(userService)

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
	routes.RegisterRoutes(router, userHandler, cfg)

	// Start server
	log.Printf("User service running on port %s", cfg.AppPort)
	log.Printf("Environment: %s", cfg.AppEnv)
	log.Printf("Auth Service URL: %s", cfg.AuthServiceURL)

	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}