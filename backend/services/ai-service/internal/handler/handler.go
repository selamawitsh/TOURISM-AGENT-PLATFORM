package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"backend/services/ai-service/internal/config"
	"backend/services/ai-service/internal/embeddings"
	"backend/services/ai-service/internal/integrations"
	"backend/services/ai-service/internal/llm"
	"backend/services/ai-service/internal/nlu"
)

type Server struct {
	cfg *config.Config
	llm llm.Client
	nlu *nlu.Parser
}

func NewServer(cfg *config.Config, client llm.Client) *Server {
	return &Server{cfg: cfg, llm: client, nlu: nlu.NewParser(client)}
}

func (s *Server) ParseHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Text string `json:"text"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	// First try LLM parse
	llmOut, err := s.nlu.ParseText(body.Text)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Build structured preferences with heuristics and LLM suggestions
	prefs := make(map[string]interface{})
	textLower := strings.ToLower(body.Text)

	// duration: look for "X day(s)" patterns
	if d := extractDuration(body.Text); d > 0 {
		prefs["durationDays"] = d
	} else if v, ok := llmOut["durationDays"]; ok {
		prefs["durationDays"] = v
	}

	// budget: look for $ or number followed by budget
	if b := extractBudget(body.Text); b >= 0 {
		prefs["budgetUSD"] = b
	} else if v, ok := llmOut["budgetUSD"]; ok {
		prefs["budgetUSD"] = v
	}

	// month: check month names
	if m := extractMonth(body.Text); m != "" {
		prefs["month"] = m
	} else if v, ok := llmOut["month"]; ok {
		prefs["month"] = v
	}

	// interests: keyword mapping
	if ints := extractInterests(textLower); len(ints) > 0 {
		prefs["interests"] = ints
	} else if v, ok := llmOut["interests"]; ok {
		prefs["interests"] = v
	}

	// destination: try LLM suggestion, then simple NER, then destination-service lookup
	var destCandidate string
	if v, ok := llmOut["destination"]; ok {
		if sstr, ok2 := v.(string); ok2 && sstr != "" {
			destCandidate = sstr
		}
	}
	if destCandidate == "" {
		destCandidate = extractDestination(body.Text)
	}
	if destCandidate != "" {
		// attempt to resolve via destination-service
		dests, _ := integrations.QueryDestinations(context.Background(), s.cfg.DestinationServiceURL, map[string]interface{}{"q": destCandidate})
		if len(dests) > 0 {
			prefs["destination"] = dests[0].Name
			prefs["destinationId"] = dests[0].ID
		} else {
			prefs["destination"] = destCandidate
		}
	}

	// include raw llm output for debugging
	prefs["_llm_raw"] = llmOut

	json.NewEncoder(w).Encode(prefs)
}

func extractDuration(text string) int {
	re := regexp.MustCompile(`(?i)(\b(\d{1,2})\s*-?\s*days?\b)|(\b(\d{1,2})-day\b)`)
	m := re.FindStringSubmatch(text)
	if len(m) > 0 {
		for _, g := range m[1:] {
			if g == "" {
				continue
			}
			if n, err := strconv.Atoi(regexp.MustCompile(`\d+`).FindString(g)); err == nil {
				return n
			}
		}
	}
	return 0
}

func extractBudget(text string) float64 {
	re := regexp.MustCompile(`\$\s*(\d{2,6})(?:\.\d{1,2})?`)
	if m := re.FindStringSubmatch(text); len(m) > 1 {
		if v, err := strconv.ParseFloat(m[1], 64); err == nil {
			return v
		}
	}
	// fallback: look for number followed by 'budget' or 'usd'
	re2 := regexp.MustCompile(`(?i)(\d{2,6})\s*(usd|dollars|budget)`)
	if m := re2.FindStringSubmatch(text); len(m) > 1 {
		if v, err := strconv.ParseFloat(m[1], 64); err == nil {
			return v
		}
	}
	return -1
}

func extractMonth(text string) string {
	months := []string{"january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"}
	tl := strings.ToLower(text)
	for _, m := range months {
		if strings.Contains(tl, m) {
			return strings.Title(m)
		}
	}
	return ""
}

func extractInterests(textLower string) []string {
	mapping := map[string][]string{
		"culture":  {"culture", "histor", "heritage", "museum", "church", "churches"},
		"hiking":   {"hike", "hiking", "trek", "trekking", "mountain"},
		"beach":    {"beach", "coast", "sea", "ocean"},
		"wildlife": {"wildlife", "safari", "animals", "bird"},
		"food":     {"food", "cuisine", "eat", "restaurant", "local food"},
		"romantic": {"romantic", "couple", "honeymoon"},
	}
	res := []string{}
	for tag, keywords := range mapping {
		for _, k := range keywords {
			if strings.Contains(textLower, k) {
				res = append(res, tag)
				break
			}
		}
	}
	return res
}

func extractDestination(text string) string {
	// simple heuristic: look for capitalized words (proper nouns) longer than 3 chars
	re := regexp.MustCompile(`([A-Z][a-z]{3,}(?:\s+[A-Z][a-z]{3,})*)`)
	if m := re.FindStringSubmatch(text); len(m) > 1 {
		return m[1]
	}
	return ""
}

func (s *Server) ItineraryHandler(w http.ResponseWriter, r *http.Request) {
	// Accept either { "text": "freeform request" } or structured preferences JSON
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	var prefs map[string]interface{}
	// if user passed freeform text, first parse it into prefs
	if t, ok := body["text"]; ok {
		if ts, ok2 := t.(string); ok2 && ts != "" {
			llmOut, err := s.nlu.ParseText(ts)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			// merge llmOut into prefs
			prefs = make(map[string]interface{})
			for k, v := range llmOut {
				prefs[k] = v
			}
		}
	}
	// if body already contains structured preferences, use them (overrides parsed values)
	for k, v := range body {
		if k == "text" {
			continue
		}
		if prefs == nil {
			prefs = make(map[string]interface{})
		}
		prefs[k] = v
	}
	if prefs == nil {
		prefs = map[string]interface{}{}
	}

	out, err := s.llm.GenerateItinerary(prefs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// If LLM returned a text fallback, try to extract JSON from it
	if txt, ok := out["text"].(string); ok && txt != "" {
		if parsed, err := extractJSONFromText(txt); err == nil {
			json.NewEncoder(w).Encode(parsed)
			return
		}
		// fallback: return text in a structured envelope
		json.NewEncoder(w).Encode(map[string]interface{}{"text": txt})
		return
	}

	json.NewEncoder(w).Encode(out)
}

// extractJSONFromText finds a JSON object or array inside a freeform text and unmarshals it.
func extractJSONFromText(s string) (interface{}, error) {
	// find first '{' or '[' and last matching '}' or ']'
	start := -1
	var open rune
	for i, r := range s {
		if r == '{' || r == '[' {
			start = i
			open = r
			break
		}
	}
	if start == -1 {
		return nil, fmt.Errorf("no json object start found")
	}
	var close rune
	if open == '{' {
		close = '}'
	} else {
		close = ']'
	}
	end := -1
	// scan from end to find last close
	for i := len(s) - 1; i >= 0; i-- {
		if rune(s[i]) == close {
			end = i
			break
		}
	}
	if end == -1 || end <= start {
		return nil, fmt.Errorf("no json end found")
	}
	cand := s[start : end+1]
	var out interface{}
	if err := json.Unmarshal([]byte(cand), &out); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *Server) RecommendationsHandler(w http.ResponseWriter, r *http.Request) {
	// For scaffold: return demo recommendations using embeddings + integrations
	q := struct {
		Text string `json:"text"`
	}{}
	_ = json.NewDecoder(r.Body).Decode(&q)

	// create query embedding
	qv, _ := s.llm.Embed(q.Text)

	// demo dataset: fetch destinations
	dests, _ := integrations.QueryDestinations(context.Background(), s.cfg.DestinationServiceURL, nil)
	// make fake vectors
	vectors := make([][]float64, len(dests))
	for i := range vectors {
		vectors[i] = make([]float64, len(qv))
		for j := range qv {
			vectors[i][j] = float64(i + 1)
		}
	}
	idx := embeddings.Recommend(vectors, qv, 3)
	res := make([]integrations.Destination, 0, len(idx))
	for _, i := range idx {
		if i < len(dests) {
			res = append(res, dests[i])
		}
	}
	json.NewEncoder(w).Encode(map[string]interface{}{"results": res})
}

func (s *Server) BookingStatusHandler(w http.ResponseWriter, r *http.Request) {
	q := struct {
		UserID string `json:"userId"`
	}{}
	_ = json.NewDecoder(r.Body).Decode(&q)
	bks, _ := integrations.QueryBookings(context.Background(), s.cfg.BookingServiceURL, q.UserID)
	// simple natural language formatting
	if len(bks) == 0 {
		json.NewEncoder(w).Encode(map[string]string{"status": "no bookings found"})
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{"bookings": bks})
}
