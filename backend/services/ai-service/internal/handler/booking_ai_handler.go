package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"backend/services/ai-service/internal/config"
	"backend/services/ai-service/internal/llm"
)

type BookingAIHandler struct {
	cfg *config.Config
	llm llm.Client
}

func NewBookingAIHandler(cfg *config.Config, client llm.Client) *BookingAIHandler {
	return &BookingAIHandler{cfg: cfg, llm: client}
}

// SmartBookingRecommendation suggests optimal booking options using AI
func (h *BookingAIHandler) SmartBookingRecommendation(w http.ResponseWriter, r *http.Request) {
	var body struct {
		DestinationID   string `json:"destination_id"`
		DestinationName string `json:"destination_name"`
		Budget          int    `json:"budget"`
		TravelDate      string `json:"travel_date"`
		GroupSize       int    `json:"group_size"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Create AI prompt for smart booking recommendations
	prompt := fmt.Sprintf(`You are a travel booking expert. Based on the following booking request:
- Destination: %s
- Budget: $%d
- Group Size: %d people
- Travel Date: %s

Generate smart booking recommendations. Return ONLY valid JSON with this exact structure:
{
  "best_deals": [
    {"description": "Specific money-saving tip", "savings": 50}
  ],
  "recommended_booking": {
    "duration": "X days",
    "price": %d,
    "message": "Personalized recommendation message"
  },
  "availability_forecast": "High/Medium/Low",
  "alternative_dates": ["Alternative date suggestion 1", "Alternative date suggestion 2"],
  "upgrade_suggestions": ["Upgrade option 1", "Upgrade option 2"],
  "tips": ["Booking tip 1", "Booking tip 2"]
}

Make recommendations realistic and helpful for the traveler. Return ONLY valid JSON.`,
		body.DestinationName, body.Budget, body.GroupSize, body.TravelDate, body.Budget)

	result, err := h.llm.GenerateItinerary(map[string]interface{}{
		"task":  "booking_recommendations",
		"query": prompt,
	})

	if err != nil {
		log.Printf("AI booking recommendation failed: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Failed to generate recommendations. Please try again.",
		})
		return
	}

	// Ensure required fields exist (fallbacks only if AI doesn't provide)
	if _, ok := result["best_deals"]; !ok {
		result["best_deals"] = []interface{}{}
	}
	if _, ok := result["recommended_booking"]; !ok {
		result["recommended_booking"] = map[string]interface{}{
			"duration": "5 days",
			"price":    body.Budget,
			"message":  fmt.Sprintf("A %d-day package fits your budget of $%d. Book now for best availability!", body.Budget/100, body.Budget),
		}
	}
	if _, ok := result["availability_forecast"]; !ok {
		result["availability_forecast"] = "High"
	}
	if _, ok := result["alternative_dates"]; !ok {
		result["alternative_dates"] = []interface{}{}
	}
	if _, ok := result["upgrade_suggestions"]; !ok {
		result["upgrade_suggestions"] = []interface{}{}
	}
	if _, ok := result["tips"]; !ok {
		result["tips"] = []interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// DynamicPricing suggests optimal pricing based on demand using AI
func (h *BookingAIHandler) DynamicPricing(w http.ResponseWriter, r *http.Request) {
	var body struct {
		DestinationID   string `json:"destination_id"`
		DestinationName string `json:"destination_name"`
		Season          string `json:"season"`
		BasePrice       int    `json:"base_price"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Create AI prompt for dynamic pricing
	prompt := fmt.Sprintf(`You are a pricing analyst for travel destinations. Based on:
- Destination: %s
- Season: %s
- Base Price: $%d

Generate dynamic pricing recommendations. Return ONLY valid JSON with this exact structure:
{
  "base_price": %d,
  "peak_season": %d,
  "off_season": %d,
  "last_minute": %d,
  "early_bird": %d,
  "weekend_price": %d,
  "group_discount": {"min_people": 4, "discount_percent": 10},
  "demand_level": "High/Medium/Low",
  "recommended_price": %d,
  "price_trend": "increasing/decreasing/stable",
  "demand_factors": ["Factor 1", "Factor 2"]
}

Use realistic pricing adjustments. Return ONLY valid JSON.`,
		body.DestinationName, body.Season, body.BasePrice,
		body.BasePrice, body.BasePrice+100, body.BasePrice-50,
		body.BasePrice-30, body.BasePrice-20, body.BasePrice+50, body.BasePrice)

	result, err := h.llm.GenerateItinerary(map[string]interface{}{
		"task":  "dynamic_pricing",
		"query": prompt,
	})

	if err != nil {
		log.Printf("AI dynamic pricing failed: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Failed to generate pricing. Please try again.",
		})
		return
	}

	// Ensure required fields exist
	if _, ok := result["base_price"]; !ok {
		result["base_price"] = body.BasePrice
	}
	if _, ok := result["peak_season"]; !ok {
		result["peak_season"] = body.BasePrice + 100
	}
	if _, ok := result["off_season"]; !ok {
		result["off_season"] = body.BasePrice - 50
	}
	if _, ok := result["last_minute"]; !ok {
		result["last_minute"] = body.BasePrice - 30
	}
	if _, ok := result["early_bird"]; !ok {
		result["early_bird"] = body.BasePrice - 20
	}
	if _, ok := result["weekend_price"]; !ok {
		result["weekend_price"] = body.BasePrice + 50
	}
	if _, ok := result["group_discount"]; !ok {
		result["group_discount"] = map[string]interface{}{
			"min_people":      4,
			"discount_percent": 10,
		}
	}
	if _, ok := result["demand_level"]; !ok {
		result["demand_level"] = "Medium"
	}
	if _, ok := result["recommended_price"]; !ok {
		result["recommended_price"] = body.BasePrice
	}
	if _, ok := result["price_trend"]; !ok {
		result["price_trend"] = "stable"
	}
	if _, ok := result["demand_factors"]; !ok {
		result["demand_factors"] = []interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}