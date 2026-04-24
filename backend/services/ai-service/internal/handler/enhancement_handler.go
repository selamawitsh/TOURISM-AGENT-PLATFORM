package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"backend/services/ai-service/internal/config"
	"backend/services/ai-service/internal/llm"
)

type EnhancementHandler struct {
	cfg *config.Config
	llm llm.Client
}

func NewEnhancementHandler(cfg *config.Config, client llm.Client) *EnhancementHandler {
	return &EnhancementHandler{cfg: cfg, llm: client}
}

// EnhanceDestination generates additional content for a destination using AI only
func (h *EnhancementHandler) EnhanceDestination(w http.ResponseWriter, r *http.Request) {
	var body struct {
		DestinationID   string `json:"destination_id"`
		DestinationName string `json:"destination_name"`
		City            string `json:"city"`
		Country         string `json:"country"`
		Description     string `json:"description"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}
	
	// Create a single comprehensive prompt for AI to generate all content
	prompt := fmt.Sprintf(`Generate comprehensive travel information for %s in %s, %s.

Return ONLY valid JSON with this exact structure. Do not include any markdown or explanations.

{
  "history": "A detailed 2-3 sentence paragraph about the history and cultural significance of %s",
  "hotels": [
    {"name": "Real hotel name", "price_range": "$/$$/$$$", "rating": 4.5, "description": "Short description of the hotel"}
  ],
  "weather": {
    "best_time": "Specific months (e.g., October to March)",
    "temperature": "Temperature range (e.g., 15°C - 25°C)",
    "rainy_season": "Months (e.g., June to September)",
    "current_weather": "General description"
  },
  "activities": [
    {"name": "Activity name", "duration": "X hours", "price": 50, "description": "What to expect"}
  ],
  "restaurants": [
    {"name": "Restaurant name", "cuisine": "Type of food", "price_range": "$/$$/$$$", "rating": 4.5}
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"]
}

Requirements:
- hotels: Provide 3 realistic hotels that actually exist or are common in the area
- activities: Provide 4-5 real activities or tours available at the destination
- restaurants: Provide 3 authentic local restaurants
- tips: Provide 5 practical travel tips specific to the destination
- All information must be realistic, accurate, and specific to %s

Return ONLY valid JSON.`, body.DestinationName, body.City, body.Country, body.DestinationName, body.DestinationName)

	log.Printf("Enhancing destination: %s", body.DestinationName)

	// Call AI to generate the content
	result, err := h.llm.GenerateItinerary(map[string]interface{}{
		"task":  "destination_enhancement",
		"query": prompt,
	})
	
	if err != nil {
		log.Printf("AI generation failed: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error":   "Failed to generate content. Please try again.",
			"details": err.Error(),
		})
		return
	}
	
	// Add destination info to response
	result["destination_id"] = body.DestinationID
	result["name"] = body.DestinationName
	
	// Ensure all required fields exist with defaults if AI didn't provide them
	if _, ok := result["history"]; !ok {
		result["history"] = fmt.Sprintf("Discover the beauty and rich history of %s, a remarkable destination in %s.", body.DestinationName, body.Country)
	}
	if _, ok := result["hotels"]; !ok {
		result["hotels"] = []interface{}{}
	}
	if _, ok := result["weather"]; !ok {
		result["weather"] = map[string]interface{}{
			"best_time":       "October to March",
			"temperature":     "15°C - 25°C",
			"rainy_season":    "June to September",
			"current_weather": "Pleasant",
		}
	}
	if _, ok := result["activities"]; !ok {
		result["activities"] = []interface{}{}
	}
	if _, ok := result["restaurants"]; !ok {
		result["restaurants"] = []interface{}{}
	}
	if _, ok := result["tips"]; !ok {
		result["tips"] = []interface{}{}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}