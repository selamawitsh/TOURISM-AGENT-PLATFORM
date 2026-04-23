package handler

import (
	"encoding/json"
	"net/http"

	"backend/services/ai-service/internal/config"
	"backend/services/ai-service/internal/llm"
)

type Server struct {
	cfg *config.Config
	llm llm.Client
}

func NewServer(cfg *config.Config, client llm.Client) *Server {
	return &Server{cfg: cfg, llm: client}
}

// ParseHandler extracts preferences using AI only
func (s *Server) ParseHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Text string `json:"text"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if body.Text == "" {
		http.Error(w, "Text is required", http.StatusBadRequest)
		return
	}

	result, err := s.llm.Parse(body.Text)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// ItineraryHandler generates itinerary using AI only
func (s *Server) ItineraryHandler(w http.ResponseWriter, r *http.Request) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// If user sent free text, parse it first
	if text, ok := body["text"].(string); ok && text != "" {
		if parsed, err := s.llm.Parse(text); err == nil {
			for k, v := range parsed {
				body[k] = v
			}
		}
	}

	result, err := s.llm.GenerateItinerary(body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// RecommendationsHandler generates recommendations using AI only - NO HARDCODE
func (s *Server) RecommendationsHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Text string `json:"text"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if body.Text == "" {
		http.Error(w, "Text is required", http.StatusBadRequest)
		return
	}

	// First parse the query to understand what user wants
	parsed, err := s.llm.Parse(body.Text)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Create a recommendations request for the AI
	recRequest := map[string]interface{}{
		"query":       body.Text,
		"destination": parsed["destination"],
		"interests":   parsed["interests"],
		"task":        "recommendations",
	}

	// Let AI generate recommendations
	result, err := s.llm.GenerateItinerary(recRequest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Extract recommendations from AI response
	var recommendations []interface{}
	
	// Try different possible response structures
	if recs, ok := result["recommendations"].([]interface{}); ok {
		recommendations = recs
	} else if recs, ok := result["results"].([]interface{}); ok {
		recommendations = recs
	} else if recs, ok := result["destinations"].([]interface{}); ok {
		recommendations = recs
	} else {
		// If AI didn't return expected structure, return the whole result
		recommendations = []interface{}{result}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"query":   body.Text,
		"results": recommendations,
	})
}