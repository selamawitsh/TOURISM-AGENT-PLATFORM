package handler

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strconv"
	"strings"

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

// ParseHandler extracts preferences from natural language text
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

	// Use LLM to parse the text
	prefs, err := s.llm.Parse(body.Text)
	if err != nil {
		prefs = s.parseWithRegex(body.Text)
	}

	if prefs == nil {
		prefs = make(map[string]interface{})
	}
	
	// Ensure all fields have values
	if _, ok := prefs["durationDays"]; !ok {
		prefs["durationDays"] = s.extractDuration(body.Text)
	}
	if _, ok := prefs["budgetUSD"]; !ok {
		prefs["budgetUSD"] = s.extractBudget(body.Text)
	}
	if _, ok := prefs["destination"]; !ok {
		prefs["destination"] = s.extractDestination(body.Text)
	}
	if _, ok := prefs["interests"]; !ok {
		prefs["interests"] = s.extractInterests(body.Text)
	}
	
	// Fix common parsing issues
	prefs = s.fixParsedPreferences(prefs, body.Text)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(prefs)
}

// ItineraryHandler generates a day-by-day itinerary
func (s *Server) ItineraryHandler(w http.ResponseWriter, r *http.Request) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// If user sent free text, parse it first
	if text, ok := body["text"].(string); ok && text != "" {
		parsed, _ := s.llm.Parse(text)
		for k, v := range parsed {
			body[k] = v
		}
	}

	itinerary, err := s.llm.GenerateItinerary(body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(itinerary)
}

// RecommendationsHandler suggests destinations based on user query
func (s *Server) RecommendationsHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Text string `json:"text"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	// Parse the query to get preferences
	prefs, _ := s.llm.Parse(body.Text)
	
	destination := ""
	if d, ok := prefs["destination"].(string); ok && d != "" {
		destination = d
	}
	
	// Generate recommendations based on destination
	recommendations := s.getRecommendations(destination, body.Text)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"query":   body.Text,
		"results": recommendations,
	})
}

// Helper methods
func (s *Server) extractDuration(text string) int {
	re := regexp.MustCompile(`(\d+)\s*(?:day|days?|d)`)
	matches := re.FindStringSubmatch(text)
	if len(matches) > 1 {
		d, _ := strconv.Atoi(matches[1])
		return d
	}
	return 3
}

func (s *Server) extractBudget(text string) float64 {
	re := regexp.MustCompile(`\$?(\d{3,5})`)
	matches := re.FindStringSubmatch(text)
	if len(matches) > 1 {
		b, _ := strconv.ParseFloat(matches[1], 64)
		return b
	}
	return 500
}

func (s *Server) extractDestination(text string) string {
	destinations := []string{"Addis Ababa", "Lalibela", "Gondar", "Axum", "Bahir Dar", "Harar", "Simien", "Danakil", "Arba Minch", "Jinka"}
	textLower := strings.ToLower(text)
	for _, dest := range destinations {
		if strings.Contains(textLower, strings.ToLower(dest)) {
			return dest
		}
	}
	return ""
}

func (s *Server) extractInterests(text string) []string {
	interests := []string{}
	textLower := strings.ToLower(text)
	
	keywords := map[string][]string{
		"culture":    {"culture", "history", "historical", "church", "museum", "heritage"},
		"nature":     {"nature", "mountain", "trekking", "hiking", "wildlife", "lake", "waterfall"},
		"adventure":  {"adventure", "extreme", "volcano", "desert", "climbing"},
		"relaxation": {"relax", "beach", "spa", "peaceful", "calm"},
		"food":       {"food", "coffee", "cuisine", "restaurant", "dining"},
	}
	
	for category, words := range keywords {
		for _, word := range words {
			if strings.Contains(textLower, word) {
				interests = append(interests, category)
				break
			}
		}
	}
	
	if len(interests) == 0 {
		interests = []string{"culture", "nature"}
	}
	return interests
}

func (s *Server) parseWithRegex(text string) map[string]interface{} {
	return map[string]interface{}{
		"durationDays": s.extractDuration(text),
		"budgetUSD":    s.extractBudget(text),
		"destination":  s.extractDestination(text),
		"interests":    s.extractInterests(text),
		"originalText": text,
	}
}

func (s *Server) fixParsedPreferences(prefs map[string]interface{}, originalText string) map[string]interface{} {
	// Fix duration - always trust the user's explicit number
	re := regexp.MustCompile(`(\d+)\s*(?:day|days?)`)
	if matches := re.FindStringSubmatch(originalText); len(matches) > 1 {
		if userDays, _ := strconv.Atoi(matches[1]); userDays > 0 {
			prefs["durationDays"] = userDays
		}
	}
	
	// Fix budget - look for $ sign with 3-5 digits
	re = regexp.MustCompile(`\$?(\d{3,5})`)
	if matches := re.FindStringSubmatch(originalText); len(matches) > 1 {
		if realBudget, _ := strconv.Atoi(matches[1]); realBudget > 0 {
			prefs["budgetUSD"] = realBudget
		}
	}
	
	return prefs
}

func (s *Server) getRecommendations(destination, query string) []map[string]interface{} {
	// Ethiopian destinations with details
	allDestinations := []map[string]interface{}{
		{"name": "Lalibela", "price": 299, "description": "Famous rock-hewn churches, a UNESCO World Heritage site", "image": "lalibela.jpg", "rating": 4.8},
		{"name": "Gondar", "price": 199, "description": "Castles and royal enclosures, the Camelot of Africa", "image": "gondar.jpg", "rating": 4.6},
		{"name": "Axum", "price": 249, "description": "Ancient obelisks and archaeological wonders", "image": "axum.jpg", "rating": 4.7},
		{"name": "Bahir Dar", "price": 179, "description": "Lake Tana monasteries and Blue Nile Falls", "image": "bahirdar.jpg", "rating": 4.5},
		{"name": "Simien Mountains", "price": 399, "description": "Spectacular trekking and wildlife viewing", "image": "simien.jpg", "rating": 4.9},
		{"name": "Harar", "price": 159, "description": "Historic walled city and hyena feeding", "image": "harar.jpg", "rating": 4.4},
		{"name": "Danakil Depression", "price": 599, "description": "Otherworldly landscapes and active volcanoes", "image": "danakil.jpg", "rating": 4.7},
		{"name": "Addis Ababa", "price": 129, "description": "Capital city with museums and cultural sites", "image": "addis.jpg", "rating": 4.3},
	}
	
	// If a specific destination is mentioned, prioritize it
	if destination != "" {
		for i, d := range allDestinations {
			if strings.EqualFold(d["name"].(string), destination) {
				return []map[string]interface{}{allDestinations[i]}
			}
		}
	}
	
	// Otherwise return top destinations
	return allDestinations[:4]
}