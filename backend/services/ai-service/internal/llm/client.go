package llm

import (
	"errors"
	"log"
)

// Client interface - all AI providers must implement this
type Client interface {
	Parse(text string) (map[string]interface{}, error)
	GenerateItinerary(prefs map[string]interface{}) (map[string]interface{}, error)
	Embed(text string) ([]float64, error)
}

// MockClient for when NO API keys are available
type MockClient struct{}

func (m *MockClient) Parse(text string) (map[string]interface{}, error) {
	return nil, errors.New("no API key configured. Please add GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY to your .env file")
}

func (m *MockClient) GenerateItinerary(prefs map[string]interface{}) (map[string]interface{}, error) {
	return nil, errors.New("no API key configured. Please add GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY to your .env file")
}

func (m *MockClient) Embed(text string) ([]float64, error) {
	return nil, errors.New("no API key configured. Please add GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY to your .env file")
}

// MultiClient tries providers in order: Groq → Gemini → OpenAI → Mock
type MultiClient struct {
	clients []Client
}

func NewMultiClient(clients ...Client) *MultiClient {
	return &MultiClient{clients: clients}
}

func (m *MultiClient) Parse(text string) (map[string]interface{}, error) {
	var lastErr error
	for i, client := range m.clients {
		log.Printf("🔄 Attempting Parse with provider #%d\n", i+1)
		result, err := client.Parse(text)
		if err == nil && result != nil {
			log.Printf("✅ Parse success with provider #%d\n", i+1)
			return result, nil
		}
		lastErr = err
		log.Printf("⚠️ Parse failed on provider #%d: %v\n", i+1, err)
	}
	return nil, lastErr
}

func (m *MultiClient) GenerateItinerary(prefs map[string]interface{}) (map[string]interface{}, error) {
	var lastErr error
	for i, client := range m.clients {
		providerName := getProviderName(client)
		log.Printf("🔄 Trying provider #%d (%s) for itinerary...", i+1, providerName)
		
		result, err := client.GenerateItinerary(prefs)
		if err == nil && result != nil {
			log.Printf("✅ Success with provider #%d (%s)", i+1, providerName)
			return result, nil
		}
		lastErr = err
		log.Printf("⚠️ Provider #%d (%s) failed: %v", i+1, providerName, err)
	}
	return nil, lastErr
}

func getProviderName(client Client) string {
	switch client.(type) {
	case *GroqClient:
		return "Groq"
	case *GeminiClient:
		return "Gemini"
	case *OpenAIClient:
		return "OpenAI"
	default:
		return "Unknown"
	}
}

func (m *MultiClient) Embed(text string) ([]float64, error) {
	var lastErr error
	for i, client := range m.clients {
		log.Printf("🔄 Attempting Embed with provider #%d\n", i+1)
		result, err := client.Embed(text)
		if err == nil && result != nil {
			log.Printf("✅ Embed success with provider #%d\n", i+1)
			return result, nil
		}
		lastErr = err
		log.Printf("⚠️ Embed failed on provider #%d: %v\n", i+1, err)
	}
	return nil, lastErr
}