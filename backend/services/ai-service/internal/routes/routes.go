package routes

import (
	"log"
	"net/http"

	"backend/services/ai-service/internal/config"
	"backend/services/ai-service/internal/handler"
	"backend/services/ai-service/internal/llm"
)

func RegisterRoutes(cfg *config.Config) http.Handler {
	mux := http.NewServeMux()

	var clients []llm.Client

	// 1. Groq (Primary - Fastest, Free tier)
	if cfg.GroqAPIKey != "" && cfg.GroqAPIKey != "gsk_" {
		log.Println("✅ Adding Groq client (primary)")
		model := cfg.GroqModel
		if model == "" {
			model = "mixtral-8x7b-32768"
		}
		clients = append(clients, llm.NewGroqClient(cfg.GroqAPIKey, model, "llama3-8b-8192"))
	} else {
		log.Println("⚠️ Groq API key not configured, skipping")
	}

	// 2. Gemini (Fallback - Good quality)
	// In routes.go, update Gemini model
if cfg.GeminiAPIKey != "" && cfg.GeminiAPIKey != "AIzaSy" {
	log.Println("✅ Adding Gemini client (fallback)")
	model := cfg.GeminiModel
	if model == "" {
		model = "gemini-2.0-flash"  // Make sure this is correct
	}
	clients = append(clients, llm.NewGeminiClient(cfg.GeminiAPIKey, model, "embedding-001"))
}else {
		log.Println("⚠️ Gemini API key not configured, skipping")
	}

	// 3. OpenAI (Last resort - Paid)
	if cfg.OpenAIAPIKey != "" && cfg.OpenAIAPIKey != "sk-" {
		log.Println("✅ Adding OpenAI client (last resort)")
		clients = append(clients, llm.NewOpenAIClient(cfg.OpenAIAPIKey))
	} else {
		log.Println("⚠️ OpenAI API key not configured, skipping")
	}

	// 4. MockClient (Final fallback - Returns errors)
	if len(clients) == 0 {
		log.Println("⚠️ No API keys configured! Using MockClient (will return errors)")
		clients = append(clients, &llm.MockClient{})
	}

	// Create MultiClient - tries providers in order
	client := llm.NewMultiClient(clients...)

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

	log.Println("")
	log.Println("AI Service routes registered:")
	log.Println("  POST /api/v1/ai/parse")
	log.Println("  POST /api/v1/ai/itinerary")
	log.Println("  POST /api/v1/ai/recommendations")
	log.Println("  GET  /health")
	log.Println("")

	return mux
}