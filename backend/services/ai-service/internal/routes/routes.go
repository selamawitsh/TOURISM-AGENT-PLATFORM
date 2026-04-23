package routes

import (
	"net/http"

	"backend/services/ai-service/internal/config"
	"backend/services/ai-service/internal/handler"
	"backend/services/ai-service/internal/llm"
)

func RegisterRoutes(cfg *config.Config) http.Handler {
	mux := http.NewServeMux()
	
	// Initialize LLM client based on provider
	var client llm.Client
	
	switch cfg.LLMProvider {
	case "openai":
		if cfg.LLMAPIKey != "" {
			client = llm.NewOpenAIClient(cfg.LLMAPIKey)
		}
	case "gemini":
		if cfg.LLMAPIKey != "" {
			client = llm.NewGeminiClient(cfg.LLMAPIKey, cfg.LLMModel, cfg.LLMEmbedModel)
		}
	}
	
	// If no valid client, use mock for development
	if client == nil {
		client = &llm.MockClient{}
	}
	
	s := handler.NewServer(cfg, client)
	
	// API routes
	mux.HandleFunc("POST /api/v1/ai/parse", s.ParseHandler)
	mux.HandleFunc("POST /api/v1/ai/itinerary", s.ItineraryHandler)
	mux.HandleFunc("POST /api/v1/ai/recommendations", s.RecommendationsHandler)
	
	// Health check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"ai-service"}`))
	})
	
	return mux
}