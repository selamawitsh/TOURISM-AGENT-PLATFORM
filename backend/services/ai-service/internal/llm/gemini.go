package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// GeminiClient is a lightweight adapter for Google's Generative Language REST API.
// It uses the simple API key form (appending ?key=API_KEY). For production, prefer
// Google Cloud service accounts or the official client libraries.
type GeminiClient struct {
	apiKey     string
	httpClient *http.Client
	model      string
	embedModel string
}

func NewGeminiClient(apiKey, model, embedModel string) *GeminiClient {
	return &GeminiClient{
		apiKey:     apiKey,
		httpClient: &http.Client{Timeout: 15 * time.Second},
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
	// attach API key as query param
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

// extractText attempts to extract text from several response shapes used by GenAI APIs.
func extractText(resp map[string]interface{}) string {
	// check candidates
	if cands, ok := resp["candidates"].([]interface{}); ok && len(cands) > 0 {
		if first, ok := cands[0].(map[string]interface{}); ok {
			if cont, ok := first["content"].(string); ok {
				return cont
			}
			if cont, ok := first["text"].(string); ok {
				return cont
			}
		}
	}
	// check output
	if out, ok := resp["output"].(map[string]interface{}); ok {
		if txt, ok := out["content"].(string); ok {
			return txt
		}
	}
	// check simple fields
	if s, ok := resp["text"].(string); ok {
		return s
	}
	if s, ok := resp["content"].(string); ok {
		return s
	}
	return ""
}

func (g *GeminiClient) Parse(text string) (map[string]interface{}, error) {
	ctx := context.Background()
	// use the v1 models generate endpoint
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1/models/%s:generate", g.model)
	payload := map[string]interface{}{
		"prompt":      map[string]interface{}{"text": text},
		"temperature": 0.2,
	}
	var resp map[string]interface{}
	if err := g.doRequest(ctx, "POST", url, payload, &resp); err != nil {
		return nil, err
	}
	content := extractText(resp)
	if content == "" {
		return map[string]interface{}{"text": ""}, nil
	}
	var parsed map[string]interface{}
	if err := json.Unmarshal([]byte(content), &parsed); err == nil {
		return parsed, nil
	}
	return map[string]interface{}{"text": content}, nil
}

func (g *GeminiClient) GenerateItinerary(prefs map[string]interface{}) (map[string]interface{}, error) {
	ctx := context.Background()
	promptBytes, _ := json.Marshal(prefs)
	prompt := fmt.Sprintf("Generate a day-by-day itinerary in JSON for the following preferences: %s\nThe output must be valid JSON.", string(promptBytes))
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1/models/%s:generate", g.model)
	payload := map[string]interface{}{
		"prompt":      map[string]interface{}{"text": prompt},
		"temperature": 0.3,
	}
	var resp map[string]interface{}
	if err := g.doRequest(ctx, "POST", url, payload, &resp); err != nil {
		return nil, err
	}
	content := extractText(resp)
	if content == "" {
		return nil, fmt.Errorf("no content in response")
	}
	var parsed map[string]interface{}
	if err := json.Unmarshal([]byte(content), &parsed); err == nil {
		return parsed, nil
	}
	return map[string]interface{}{"text": content}, nil
}

func (g *GeminiClient) Embed(text string) ([]float64, error) {
	// Generative Embeddings via Google require a dedicated embeddings endpoint or using a model
	// that supports embeddings. For now, provide a deterministic fallback to avoid runtime errors.
	// TODO: implement real Gemini embeddings using the official embeddings endpoint.
	v := make([]float64, 8)
	for i := range v {
		v[i] = float64(len(text) + i)
	}
	return v, nil
}
