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
	}
}
