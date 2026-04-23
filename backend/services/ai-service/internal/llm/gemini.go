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

func (g *GeminiClient) doRequest(ctx context.Context, url string, body interface{}, out interface{}) error {
	b, err := json.Marshal(body)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(b))
	if err != nil {
		return err
	}

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

	log.Printf("📡 Gemini Response Status: %d", resp.StatusCode)
	log.Printf("📡 Gemini Response Body: %s", string(bodyBytes))

	if resp.StatusCode >= 400 {
		return fmt.Errorf("gemini error (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	if out != nil {
		return json.Unmarshal(bodyBytes, out)
	}

	return nil
}

func (g *GeminiClient) Parse(text string) (map[string]interface{}, error) {
	ctx := context.Background()

	// Use the correct v1 endpoint with API key in URL
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1/models/%s:generateContent?key=%s", g.model, g.apiKey)

	prompt := fmt.Sprintf(`Extract travel preferences from this text. Return ONLY valid JSON with these exact fields:
- durationDays: number of days
- budgetUSD: number (amount in US dollars)
- destination: string (place/city name)
- interests: array of strings

Text: "%s"

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
	if err := g.doRequest(ctx, url, payload, &resp); err != nil {
		return nil, err
	}

	// Extract the response text
	content := extractGeminiText(resp)
	if content == "" {
		return nil, fmt.Errorf("empty response from Gemini")
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

func (g *GeminiClient) GenerateItinerary(prefs map[string]interface{}) (map[string]interface{}, error) {
	ctx := context.Background()

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1/models/%s:generateContent?key=%s", g.model, g.apiKey)

	prefsJSON, _ := json.Marshal(prefs)

	prompt := fmt.Sprintf(`Create a detailed day-by-day travel itinerary based on these preferences: %s

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

	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"temperature":     0.7,
			"topP":           0.95,
			"topK":           40,
			"maxOutputTokens": 2048,
		},
	}

	var resp map[string]interface{}
	if err := g.doRequest(ctx, url, payload, &resp); err != nil {
		return nil, err
	}

	content := extractGeminiText(resp)
	if content == "" {
		return nil, fmt.Errorf("empty response from Gemini")
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

func (g *GeminiClient) Embed(text string) ([]float64, error) {
	return nil, fmt.Errorf("embeddings not implemented for Gemini")
}

// extractGeminiText extracts the text response from Gemini API response
func extractGeminiText(resp map[string]interface{}) string {
	// Check candidates array
	candidates, ok := resp["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return ""
	}

	candidate, ok := candidates[0].(map[string]interface{})
	if !ok {
		return ""
	}

	content, ok := candidate["content"].(map[string]interface{})
	if !ok {
		return ""
	}

	parts, ok := content["parts"].([]interface{})
	if !ok || len(parts) == 0 {
		return ""
	}

	part, ok := parts[0].(map[string]interface{})
	if !ok {
		return ""
	}

	text, ok := part["text"].(string)
	if !ok {
		return ""
	}

	return text
}