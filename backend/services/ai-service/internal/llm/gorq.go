package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
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
	
	// Check if this is a recommendations request
	taskType := "itinerary"
	if task, ok := prefs["task"].(string); ok && task == "recommendations" {
		taskType = "recommendations"
	}
	
	var prompt string
	if taskType == "recommendations" {
		prompt = fmt.Sprintf(`You are a travel expert. Based on this user request: "%s"

Return a JSON object with travel recommendations in this EXACT format:
{
  "recommendations": [
    {"name": "Specific place name", "price": 123, "description": "Why this place is worth visiting", "rating": 4.5},
    {"name": "Another place", "price": 456, "description": "What makes it special", "rating": 4.3}
  ]
}

Make 4-6 relevant recommendations. Use realistic prices in USD. Return ONLY valid JSON.`, string(prefsJSON))
	} else {
		prompt = fmt.Sprintf(`Create a detailed day-by-day travel itinerary based on these preferences: %s

Return a JSON object with this exact structure:
{
  "destination": "place name",
  "durationDays": number,
  "budget": number,
  "summary": "brief overview of the trip",
  "days": [
    {"day": 1, "title": "Unique day title", "activities": ["specific activity 1", "specific activity 2", "specific activity 3"]}
  ],
  "tips": ["useful tip 1", "useful tip 2"]
}

IMPORTANT: Each day MUST have DIFFERENT activities. Do NOT repeat the same activities across days.
Make it realistic and specific to the destination. Return ONLY valid JSON.`, string(prefsJSON))
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
		return nil, fmt.Errorf("failed to parse JSON: %s", err.Error())
	}

	return parsed, nil
}

func (g *GroqClient) Embed(text string) ([]float64, error) {
	return nil, fmt.Errorf("embeddings not supported by Groq")
}