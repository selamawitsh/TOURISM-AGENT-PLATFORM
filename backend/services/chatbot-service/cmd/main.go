package main

import (
	"log"

	"chatbot-service/internal/config"
	"chatbot-service/internal/handler"
	"chatbot-service/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	// Initialize chatbot service
	chatbotService, err := service.NewChatbotService(cfg)
	if err != nil {
		log.Fatal("Failed to initialize chatbot service: ", err)
	}
	defer chatbotService.Close()

	chatbotHandler := handler.NewChatbotHandler(chatbotService)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// API routes
	v1 := router.Group("/api/v1/chat")
	{
		v1.POST("/message", chatbotHandler.Chat)
		v1.POST("/recommend", chatbotHandler.Recommend)
	}

	log.Printf("🚀 Chatbot service running on port %s", cfg.AppPort)
	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}