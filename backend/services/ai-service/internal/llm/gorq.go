package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

type GroqClient struct {
	apiKey     string
	httpClient *http.Client
	model      string
	embedModel string
}

func NewGroqClient(apiKey, model, embedModel string) *GroqClient {
	return &GroqClient{
		apiKey:     apiKey,
		httpClient: &http.Client{Timeout: 30 * time.Second},
		model:      model,
		embedModel: embedModel,
	}
}

func (g *GroqClient) doRequest(ctx context.Context, url string, body interface{}, out interface{}) error {
	b, err := json.Marshal(body)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(b))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+g.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := g.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	log.Printf("Groq Response Status: %d", resp.StatusCode)
	log.Printf("Groq Response Body: %s", string(bodyBytes))

	if resp.StatusCode >= 400 {
		return fmt.Errorf("groq error (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	if out != nil {
		return json.Unmarshal(bodyBytes, out)
	}

	return nil
}

func (g *GroqClient) Parse(text string) (map[string]interface{}, error) {
	ctx := context.Background()

	prompt := fmt.Sprintf(`Extract travel preferences from this text. Return ONLY valid JSON with these exact fields:
- durationDays: number of days
- budgetUSD: number (amount in US dollars)
- destination: string (place/city name)
- interests: array of strings

Text: "%s"

Return ONLY the JSON, no other text.`, text)

	payload := map[string]interface{}{
		"model": g.model,
		"messages": []map[string]string{
			{"role": "system", "content": "You are a travel preference extractor. Return ONLY valid JSON."},
			{"role": "user", "content": prompt},
		},
		"temperature": 0.1,
	}

	var resp map[string]interface{}
	if err := g.doRequest(ctx, "https://api.groq.com/openai/v1/chat/completions", payload, &resp); err != nil {
		return nil, err
	}

	choices, ok := resp["choices"].([]interface{})
	if !ok || len(choices) == 0 {
		return nil, fmt.Errorf("no choices in response")
	}

	choice, ok := choices[0].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid choice format")
	}

	message, ok := choice["message"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid message format")
	}

	content, ok := message["content"].(string)
	if !ok || content == "" {
		return nil, fmt.Errorf("empty response content")
	}

	content = strings.TrimSpace(content)
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	var parsed map[string]interface{}
	if err := json.Unmarshal([]byte(content), &parsed); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %s", err.Error())
	}

	return parsed, nil
}

func (g *GroqClient) GenerateItinerary(prefs map[string]interface{}) (map[string]interface{}, error) {
	ctx := context.Background()

	prefsJSON, _ := json.Marshal(prefs)
	
	// Check what type of request this is
	taskType := "itinerary"
	if task, ok := prefs["task"].(string); ok {
		taskType = task
	}
	
	var prompt string
	switch taskType {
	case "destination_enhancement":
		// For destination enhancement, use the query directly
		if query, ok := prefs["query"].(string); ok {
			prompt = query
		} else {
			prompt = fmt.Sprintf(`Generate comprehensive travel information for a destination. Return ONLY valid JSON with fields: history (string), hotels (array of objects with name, price_range, rating, description), weather (object with best_time, temperature, rainy_season, current_weather), activities (array of objects with name, duration, price, description), restaurants (array of objects with name, cuisine, price_range, rating), tips (array of strings). Use realistic data for the destination.`)
		}
		
	case "recommendations":
		prompt = fmt.Sprintf(`Based on this travel request: %s

Return a JSON object with:
{
  "recommendations": [
    {"name": "Destination name", "price": 123, "description": "Why visit", "rating": 4.5}
  ]
}
Make 4-6 recommendations. Return ONLY valid JSON.`, string(prefsJSON))
		
	default:
		// Default itinerary generation
		prompt = fmt.Sprintf(`Create a detailed day-by-day travel itinerary based on these preferences: %s

Return a JSON object with:
{
  "destination": "place name",
  "durationDays": number,
  "budget": number,
  "summary": "overview",
  "days": [
    {"day": 1, "title": "Day title", "activities": ["activity1", "activity2"]}
  ],
  "tips": ["tip1", "tip2"]
}
Each day MUST have different activities. Return ONLY valid JSON.`, string(prefsJSON))
	}

	payload := map[string]interface{}{
		"model": g.model,
		"messages": []map[string]string{
			{"role": "system", "content": "You are a travel expert. Return ONLY valid JSON. No markdown, no explanations."},
			{"role": "user", "content": prompt},
		},
		"temperature": 0.7,
	}

	var resp map[string]interface{}
	if err := g.doRequest(ctx, "https://api.groq.com/openai/v1/chat/completions", payload, &resp); err != nil {
		return nil, err
	}

	choices, ok := resp["choices"].([]interface{})
	if !ok || len(choices) == 0 {
		return nil, fmt.Errorf("no choices in response")
	}

	choice, ok := choices[0].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid choice format")
	}

	message, ok := choice["message"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid message format")
	}

	content, ok := message["content"].(string)
	if !ok || content == "" {
		return nil, fmt.Errorf("empty response content")
	}

	// Clean up the content
	content = strings.TrimSpace(content)
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	var parsed map[string]interface{}
	if err := json.Unmarshal([]byte(content), &parsed); err != nil {
		log.Printf("Failed to parse JSON: %s", err.Error())
		log.Printf("Raw content: %s", content)
		return nil, fmt.Errorf("failed to parse JSON: %s", err.Error())
	}

	return parsed, nil
}

func (g *GroqClient) Embed(text string) ([]float64, error) {
	return nil, fmt.Errorf("embeddings not supported by Groq")
}