package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"

	"backend/services/ai-service/internal/config"
	"backend/services/ai-service/internal/routes"
)

func main() {
	// ✅ Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using system env")
	}

	cfg := config.LoadFromEnv()

	// ✅ Debug (IMPORTANT)
	log.Println("LLM_PROVIDER:", cfg.LLMProvider)
	log.Println("LLM_MODEL:", cfg.LLMModel)

	handler := routes.RegisterRoutes(cfg)

	log.Println("AI Service running on port:", cfg.Port)

	err = http.ListenAndServe(":"+cfg.Port, handler)
	if err != nil {
		log.Fatal(err)
	}
}