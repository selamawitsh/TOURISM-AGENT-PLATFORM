package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// GeminiClient is a lightweight adapter for Google's Generative Language REST API.
type GeminiClient struct {
	apiKey     string
	httpClient *http.Client
	model      string
	embedModel string
}

func NewGeminiClient(apiKey, model, embedModel string) *GeminiClient {
	return &GeminiClient{
		apiKey:     apiKey,
		httpClient: &http.Client{Timeout: 30 * time.Second},
		model:      model,
		embedModel: embedModel,
	}
}

func (g *GeminiClient) doRequest(ctx context.Context, method, rawurl string, body interface{}, out interface{}) error {
	var rb io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return err
		}
		rb = bytes.NewReader(b)
	}
	
	u, err := url.Parse(rawurl)
	if err != nil {
		return err
	}
	q := u.Query()
	q.Set("key", g.apiKey)
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, method, u.String(), rb)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := g.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("gemini request failed: status=%d body=%s", resp.StatusCode, string(b))
	}
	
	if out != nil {
		return json.NewDecoder(resp.Body).Decode(out)
	}
	return nil
}

// extractTextFromResponse extracts text from Gemini API response
func extractTextFromResponse(resp map[string]interface{}) string {
	// Check candidates array
	if candidates, ok := resp["candidates"].([]interface{}); ok && len(candidates) > 0 {
		if first, ok := candidates[0].(map[string]interface{}); ok {
			if content, ok := first["content"].(map[string]interface{}); ok {
				if parts, ok := content["parts"].([]interface{}); ok && len(parts) > 0 {
					if part, ok := parts[0].(map[string]interface{}); ok {
						if text, ok := part["text"].(string); ok {
							return text
						}
					}
				}
			}
			if text, ok := first["text"].(string); ok {
				return text
			}
		}
	}
	
	// Check output field
	if output, ok := resp["output"].(map[string]interface{}); ok {
		if content, ok := output["content"].(string); ok {
			return content
		}
	}
	
	// Check simple fields
	if text, ok := resp["text"].(string); ok {
		return text
	}
	if content, ok := resp["content"].(string); ok {
		return content
	}
	
	return ""
}

// Parse extracts travel preferences from natural language text
func (g *GeminiClient) Parse(text string) (map[string]interface{}, error) {
	ctx := context.Background()
	
	// Use the correct Gemini API endpoint (v1beta for generateContent)
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", g.model)
	
	prompt := fmt.Sprintf(`Extract travel preferences from the user's text. Return ONLY valid JSON with these exact fields:

- durationDays: number of days (extract the exact number, e.g., "5 day" = 5)
- budgetUSD: budget amount (look for $ sign or "dollars", e.g., "$500" = 500)
- destination: the place/city/country name
- interests: array of strings (culture, nature, hiking, food, adventure, relaxation)

User text: "%s"

Example output for "5 day trip to Bahir Dar with $500 budget":
{"durationDays": 5, "budgetUSD": 500, "destination": "Bahir Dar", "interests": ["culture", "nature"]}

Return ONLY the JSON, no other text.`, text)
	
	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"temperature":     0.1,
			"topP":           0.95,
			"topK":           40,
			"maxOutputTokens": 1024,
		},
	}
	
	var resp map[string]interface{}
	if err := g.doRequest(ctx, "POST", url, payload, &resp); err != nil {
		return g.parseWithRegex(text), nil // Fallback to regex on error
	}
	
	content := extractTextFromResponse(resp)
	if content == "" {
		return g.parseWithRegex(text), nil
	}
	
	// Try to extract JSON from the response (in case there's extra text)
	jsonStr := extractJSON(content)
	
	var parsed map[string]interface{}
	if err := json.Unmarshal([]byte(jsonStr), &parsed); err == nil {
		// Fix common parsing errors
		parsed = g.fixParsedPreferences(parsed, text)
		return parsed, nil
	}
	
	return g.parseWithRegex(text), nil
}

// GenerateItinerary creates a day-by-day travel plan
func (g *GeminiClient) GenerateItinerary(prefs map[string]interface{}) (map[string]interface{}, error) {
	ctx := context.Background()
	
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", g.model)
	
	prefsJSON, _ := json.Marshal(prefs)
	
	prompt := fmt.Sprintf(`Create a detailed day-by-day travel itinerary based on these preferences: %s

Return a JSON object with this structure:
{
  "destination": "place name",
  "durationDays": number,
  "budget": number,
  "summary": "brief overview",
  "days": [
    {"day": 1, "title": "Day title", "activities": ["activity1", "activity2"], "meals": ["breakfast", "lunch", "dinner"], "accommodation": "hotel name"}
  ],
  "tips": ["tip1", "tip2"]
}

Make it realistic, engaging, and useful for travelers. Return ONLY valid JSON.`, string(prefsJSON))
	
	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"temperature":     0.3,
			"topP":           0.95,
			"topK":           40,
			"maxOutputTokens": 2048,
		},
	}
	
	var resp map[string]interface{}
	if err := g.doRequest(ctx, "POST", url, payload, &resp); err != nil {
		return g.getDefaultItinerary(prefs), nil
	}
	
	content := extractTextFromResponse(resp)
	if content == "" {
		return g.getDefaultItinerary(prefs), nil
	}
	
	jsonStr := extractJSON(content)
	
	var parsed map[string]interface{}
	if err := json.Unmarshal([]byte(jsonStr), &parsed); err == nil {
		return parsed, nil
	}
	
	return g.getDefaultItinerary(prefs), nil
}

// Embed generates embeddings for text (for recommendations)
func (g *GeminiClient) Embed(text string) ([]float64, error) {
	// Use the embeddings endpoint
	ctx := context.Background()
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:embedContent", g.embedModel)
	
	payload := map[string]interface{}{
		"model":  g.embedModel,
		"content": map[string]interface{}{
			"parts": []map[string]interface{}{
				{"text": text},
			},
		},
	}
	
	var resp map[string]interface{}
	if err := g.doRequest(ctx, "POST", url, payload, &resp); err != nil {
		return g.getDefaultEmbedding(text), nil
	}
	
	if embedding, ok := resp["embedding"].(map[string]interface{}); ok {
		if values, ok := embedding["values"].([]interface{}); ok {
			result := make([]float64, len(values))
			for i, v := range values {
				if f, ok := v.(float64); ok {
					result[i] = f
				}
			}
			return result, nil
		}
	}
	
	return g.getDefaultEmbedding(text), nil
}

// Helper functions
func (g *GeminiClient) parseWithRegex(text string) map[string]interface{} {
	result := make(map[string]interface{})
	
	// Extract duration
	re := regexp.MustCompile(`(\d+)\s*(?:day|days?)`)
	if matches := re.FindStringSubmatch(text); len(matches) > 1 {
		days, _ := strconv.Atoi(matches[1])
		result["durationDays"] = days
	} else {
		result["durationDays"] = 3
	}
	
	// Extract budget
	re = regexp.MustCompile(`\$?(\d{3,5})`)
	if matches := re.FindStringSubmatch(text); len(matches) > 1 {
		budget, _ := strconv.Atoi(matches[1])
		result["budgetUSD"] = budget
	} else {
		result["budgetUSD"] = 500
	}
	
	// Extract destination
	destinations := []string{"Addis Ababa", "Lalibela", "Gondar", "Axum", "Bahir Dar", "Harar", "Simien", "Danakil"}
	for _, dest := range destinations {
		if strings.Contains(text, dest) {
			result["destination"] = dest
			break
		}
	}
	
	// Extract interests
	interests := []string{}
	if strings.Contains(strings.ToLower(text), "culture") || strings.Contains(strings.ToLower(text), "history") {
		interests = append(interests, "culture")
	}
	if strings.Contains(strings.ToLower(text), "nature") || strings.Contains(strings.ToLower(text), "mountain") {
		interests = append(interests, "nature")
	}
	if len(interests) == 0 {
		interests = []string{"culture", "nature"}
	}
	result["interests"] = interests
	
	return result
}

func (g *GeminiClient) fixParsedPreferences(prefs map[string]interface{}, originalText string) map[string]interface{} {
	// Fix duration
	if _, ok := prefs["durationDays"].(float64); ok {
		re := regexp.MustCompile(`(\d+)\s*(?:day|days?)`)
		if matches := re.FindStringSubmatch(originalText); len(matches) > 1 {
			if userDays, _ := strconv.Atoi(matches[1]); userDays > 0 {
				prefs["durationDays"] = float64(userDays)
			}
		}
	}
	
	// Fix budget
	if budget, ok := prefs["budgetUSD"].(float64); ok {
		if budget < 10 {
			re := regexp.MustCompile(`\$?(\d{3,5})`)
			if matches := re.FindStringSubmatch(originalText); len(matches) > 1 {
				if realBudget, _ := strconv.Atoi(matches[1]); realBudget > 0 {
					prefs["budgetUSD"] = float64(realBudget)
				}
			}
		}
	}
	
	return prefs
}

func (g *GeminiClient) getDefaultItinerary(prefs map[string]interface{}) map[string]interface{} {
	duration := 3
	if d, ok := prefs["durationDays"].(float64); ok {
		duration = int(d)
	}
	
	destination := "Ethiopia"
	if d, ok := prefs["destination"].(string); ok && d != "" {
		destination = d
	}
	
	budget := 500
	if b, ok := prefs["budgetUSD"].(float64); ok {
		budget = int(b)
	}
	
	days := make([]map[string]interface{}, duration)
	for i := 0; i < duration; i++ {
		days[i] = map[string]interface{}{
			"day":        i + 1,
			"title":      fmt.Sprintf("Day %d: Explore %s", i+1, destination),
			"activities": []string{"Morning: Arrival and check-in", "Afternoon: City tour", "Evening: Local dinner"},
			"meals":      []string{"Breakfast at hotel", "Lunch at local restaurant", "Dinner at traditional spot"},
			"accommodation": "Comfortable hotel in city center",
		}
	}
	
	return map[string]interface{}{
		"destination": destination,
		"durationDays": duration,
		"budget":      budget,
		"summary":     fmt.Sprintf("A wonderful %d-day journey through %s", duration, destination),
		"days":        days,
		"tips":        []string{"Book in advance", "Pack comfortable shoes", "Try local cuisine"},
	}
}

func (g *GeminiClient) getDefaultEmbedding(text string) []float64 {
	v := make([]float64, 128)
	for i := range v {
		v[i] = float64((len(text) + i) % 100) / 100.0
	}
	return v
}

// extractJSON finds JSON object or array in a string
func extractJSON(s string) string {
	// Find first { or [
	start := -1
	for i, c := range s {
		if c == '{' || c == '[' {
			start = i
			break
		}
	}
	if start == -1 {
		return "{}"
	}
	
	// Find matching closing bracket
	stack := 0
	end := -1
	for i := start; i < len(s); i++ {
		c := s[i]
		if c == '{' || c == '[' {
			stack++
		} else if c == '}' || c == ']' {
			stack--
			if stack == 0 {
				end = i
				break
			}
		}
	}
	if end == -1 {
		return "{}"
	}
	return s[start : end+1]
}

func (g *GeminiClient) doRequestWithRetry(ctx context.Context, method, rawurl string, body interface{}, out interface{}) error {
    maxRetries := 3
    for i := 0; i < maxRetries; i++ {
        err := g.doRequest(ctx, method, rawurl, body, out)
        if err == nil {
            return nil
        }
        
        // Check if it's a rate limit error (429)
        if strings.Contains(err.Error(), "429") || strings.Contains(err.Error(), "RESOURCE_EXHAUSTED") {
            waitTime := time.Duration(i+1) * 10 * time.Second // 10s, 20s, 30s
            log.Printf("Rate limited. Waiting %v before retry %d/%d...", waitTime, i+1, maxRetries)
            time.Sleep(waitTime)
            continue
        }
        return err
    }
    return fmt.Errorf("max retries exceeded")
}