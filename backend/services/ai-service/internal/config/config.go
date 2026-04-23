package config

import "os"

type Config struct {
	Port                  string
	LLMProvider           string
	LLMAPIKey             string
	LLMModel              string
	LLMEmbedModel         string
	DestinationServiceURL string
	BookingServiceURL     string
	
	// Provider-specific keys
	GroqAPIKey    string
	GroqModel     string
	GeminiAPIKey  string
	GeminiModel   string
	OpenAIAPIKey  string
}

func LoadFromEnv() *Config {
	port := os.Getenv("AI_SERVICE_PORT")
	if port == "" {
		port = "8090"
	}

	return &Config{
		Port:                  port,
		LLMProvider:           os.Getenv("LLM_PROVIDER"),
		LLMAPIKey:             os.Getenv("LLM_API_KEY"),
		LLMModel:              os.Getenv("LLM_MODEL"),
		LLMEmbedModel:         os.Getenv("LLM_EMBED_MODEL"),
		DestinationServiceURL: os.Getenv("DESTINATION_SERVICE_URL"),
		BookingServiceURL:     os.Getenv("BOOKING_SERVICE_URL"),
		
		// Provider-specific
		GroqAPIKey:    os.Getenv("GROQ_API_KEY"),
		GroqModel:     os.Getenv("GROQ_MODEL"),
		GeminiAPIKey:  os.Getenv("GEMINI_API_KEY"),
		GeminiModel:   os.Getenv("GEMINI_MODEL"),
		OpenAIAPIKey:  os.Getenv("OPENAI_API_KEY"),
	}
}