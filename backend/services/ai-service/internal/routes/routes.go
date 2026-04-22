package routes

import (
	"net/http"

	"backend/services/ai-service/internal/config"
	"backend/services/ai-service/internal/handler"
	"backend/services/ai-service/internal/llm"
)

func RegisterRoutes(cfg *config.Config) http.Handler {
	mux := http.NewServeMux()
	var client llm.Client
	switch cfg.LLMProvider {
	case "openai":
		client = llm.NewOpenAIClient(cfg.LLMAPIKey)
	case "gemini":
		client = llm.NewGeminiClient(cfg.LLMAPIKey, cfg.LLMModel, cfg.LLMEmbedModel)
	default:
		if cfg.LLMAPIKey != "" {
			client = llm.NewOpenAIClient(cfg.LLMAPIKey)
		} else {
			client = &llm.MockClient{}
		}
	}
	s := handler.NewServer(cfg, client)

	mux.HandleFunc("/api/v1/ai/parse", s.ParseHandler)
	mux.HandleFunc("/api/v1/ai/itinerary", s.ItineraryHandler)
	mux.HandleFunc("/api/v1/ai/recommendations", s.RecommendationsHandler)
	mux.HandleFunc("/api/v1/ai/booking-status", s.BookingStatusHandler)
	return mux
}
