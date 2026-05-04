package main

import (
	"log"

	"favorites-service/internal/config"
	"favorites-service/internal/database"
	"favorites-service/internal/handler"
	"favorites-service/internal/repository"
	"favorites-service/internal/routes"
	"favorites-service/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db := database.ConnectDB(cfg)

	// Initialize repository
	favoriteRepo := repository.NewFavoriteRepository(db)

	// Initialize service
	favoriteService := service.NewFavoriteService(favoriteRepo, cfg)

	// Initialize handler
	favoriteHandler := handler.NewFavoriteHandler(favoriteService)

	// Create Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:3000", "https://frontend-nextjs-self.vercel.app",
		},
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Register routes
	routes.RegisterRoutes(router, favoriteHandler, cfg)

	// Start server
	log.Printf("🚀 Favorites service running on port %s", cfg.AppPort)
	log.Printf("📝 Environment: %s", cfg.AppEnv)
	log.Printf("🔗 Auth Service URL: %s", cfg.AuthServiceURL)
	log.Printf("🔗 Destination Service URL: %s", cfg.DestServiceURL)

	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}