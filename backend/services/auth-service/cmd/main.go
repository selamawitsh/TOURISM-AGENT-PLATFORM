package main

import (
	"log"

	"auth-service/internal/config"
	"auth-service/internal/database"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	db := database.ConnectDB(cfg)
	
	_ = db // Keep this temporarily until you use db in routes

	// Create router
	router := gin.Default()

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": cfg.AppName,
			"env":     cfg.AppEnv,
			"message": "Auth service is running",
		})
	})

	// Start server
	log.Printf("Auth service running on port %s", cfg.AppPort)
	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}