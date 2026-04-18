package service

import (
	"context"
	"fmt"

	"chatbot-service/internal/config"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type ChatbotService struct {
	cfg        *config.Config
	geminiClient *genai.Client
	model      *genai.GenerativeModel
}

func NewChatbotService(cfg *config.Config) (*ChatbotService, error) {
	// Initialize Gemini client
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(cfg.GeminiAPIKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}

	// Use Gemini 1.5 Flash (faster, cheaper for chat)
	model := client.GenerativeModel("gemini-1.5-flash")
	
	// Configure model settings
	model.SetTemperature(0.7)
	model.SetTopP(0.95)
	model.SetTopK(40)
	model.SetMaxOutputTokens(1024)

	// Set system prompt to define chatbot's personality
	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text("You are 'Selam', a friendly Ethiopian travel assistant for Tourism Platform. " +
				"You help travelers discover Ethiopia's amazing destinations like Simien Mountains, " +
				"Lalibela, Danakil Depression, Lake Tana, Axum, and Harar. " +
				"You provide helpful information about tours, bookings, travel tips, and Ethiopian culture. " +
				"Keep responses concise, warm, and informative. " +
				"Never give false information. If unsure, suggest contacting customer support."),
		},
	}

	return &ChatbotService{
		cfg:          cfg,
		geminiClient: client,
		model:        model,
	}, nil
}

// ChatRequest represents a user's message
type ChatRequest struct {
	Message   string `json:"message"`
	UserID    string `json:"user_id,omitempty"`
	SessionID string `json:"session_id,omitempty"`
}

// ChatResponse represents the AI's reply
type ChatResponse struct {
	Message   string `json:"message"`
	SessionID string `json:"session_id"`
}

// SendMessage processes user message and returns AI response
func (s *ChatbotService) SendMessage(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	// Start a chat session
	session := s.model.StartChat()
	
	// Send user message
	resp, err := session.SendMessage(ctx, genai.Text(req.Message))
	if err != nil {
		return nil, fmt.Errorf("failed to get response from Gemini: %w", err)
	}

	// Extract response text
	var responseText string
	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				responseText += fmt.Sprintf("%s", part)
			}
		}
	}

	return &ChatResponse{
		Message:   responseText,
		SessionID: req.SessionID,
	}, nil
}

// GetTravelRecommendation provides personalized destination suggestions
func (s *ChatbotService) GetTravelRecommendation(ctx context.Context, preferences string) (string, error) {
	prompt := fmt.Sprintf(`Based on these preferences: "%s", recommend 3 Ethiopian destinations.
For each, provide:
- Destination name
- Why it matches their interests
- Best time to visit
- One unique experience

Format as bullet points with emojis.`, preferences)

	resp, err := s.model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", err
	}

	var result string
	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				result += fmt.Sprintf("%s", part)
			}
		}
	}
	return result, nil
}

// Close closes the Gemini client connection
func (s *ChatbotService) Close() error {
	return s.geminiClient.Close()
}