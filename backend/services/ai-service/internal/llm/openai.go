package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type OpenAIClient struct {
	apiKey     string
	httpClient *http.Client
	model      string
	embedModel string
}

func NewOpenAIClient(apiKey string) *OpenAIClient {
	m := os.Getenv("LLM_MODEL")
	if m == "" {
		m = "gpt-4o-mini"
	}
	em := os.Getenv("LLM_EMBED_MODEL")
	if em == "" {
		em = "text-embedding-3-small"
	}
	return &OpenAIClient{
		apiKey:     apiKey,
		httpClient: &http.Client{Timeout: 15 * time.Second},
		model:      m,
		embedModel: em,
	}
}

func (c *OpenAIClient) doRequest(ctx context.Context, method, url string, body interface{}, out interface{}) error {
	var rb io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return err
		}
		rb = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, url, rb)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("openai request failed: status=%d body=%s", resp.StatusCode, string(b))
	}
	if out != nil {
		dec := json.NewDecoder(resp.Body)
		dec.DisallowUnknownFields()
		if err := dec.Decode(out); err != nil {
			// fallback to lenient unmarshal
			b, _ := io.ReadAll(resp.Body)
			return json.Unmarshal(b, out)
		}
		return nil
	}
	return nil
}

// Parse calls the chat completions endpoint and attempts to return structured JSON when possible.
func (c *OpenAIClient) Parse(text string) (map[string]interface{}, error) {
	ctx := context.Background()
	url := "https://api.openai.com/v1/chat/completions"
	payload := map[string]interface{}{
		"model":       c.model,
		"messages":    []map[string]string{{"role": "user", "content": text}},
		"temperature": 0.2,
	}
	var resp map[string]interface{}
	if err := c.doRequest(ctx, "POST", url, payload, &resp); err != nil {
		return nil, err
	}
	// try to extract content safely
	choices, _ := resp["choices"].([]interface{})
	if len(choices) == 0 {
		return map[string]interface{}{"text": ""}, nil
	}
	ch, _ := choices[0].(map[string]interface{})
	if msg, ok := ch["message"].(map[string]interface{}); ok {
		if content, ok := msg["content"].(string); ok {
			var parsed map[string]interface{}
			if err := json.Unmarshal([]byte(content), &parsed); err == nil {
				return parsed, nil
			}
			return map[string]interface{}{"text": content}, nil
		}
	}
	if txt, ok := ch["text"].(string); ok {
		var parsed map[string]interface{}
		if err := json.Unmarshal([]byte(txt), &parsed); err == nil {
			return parsed, nil
		}
		return map[string]interface{}{"text": txt}, nil
	}
	return map[string]interface{}{"text": ""}, nil
}

func (c *OpenAIClient) GenerateItinerary(prefs map[string]interface{}) (map[string]interface{}, error) {
	ctx := context.Background()
	promptBytes, _ := json.Marshal(prefs)
	prompt := fmt.Sprintf("Generate a day-by-day itinerary in JSON for the following preferences: %s\nThe output must be valid JSON.", string(promptBytes))
	url := "https://api.openai.com/v1/chat/completions"
	payload := map[string]interface{}{
		"model":       c.model,
		"messages":    []map[string]string{{"role": "user", "content": prompt}},
		"temperature": 0.3,
	}
	var resp map[string]interface{}
	if err := c.doRequest(ctx, "POST", url, payload, &resp); err != nil {
		return nil, err
	}
	choices, _ := resp["choices"].([]interface{})
	if len(choices) == 0 {
		return nil, fmt.Errorf("no choices returned")
	}
	ch, _ := choices[0].(map[string]interface{})
	if msg, ok := ch["message"].(map[string]interface{}); ok {
		if content, ok := msg["content"].(string); ok {
			var parsed map[string]interface{}
			if err := json.Unmarshal([]byte(content), &parsed); err == nil {
				return parsed, nil
			}
			return map[string]interface{}{"text": content}, nil
		}
	}
	if txt, ok := ch["text"].(string); ok {
		var parsed map[string]interface{}
		if err := json.Unmarshal([]byte(txt), &parsed); err == nil {
			return parsed, nil
		}
		return map[string]interface{}{"text": txt}, nil
	}
	return nil, fmt.Errorf("no content in completion choices")
}

func (c *OpenAIClient) Embed(text string) ([]float64, error) {
	ctx := context.Background()
	url := "https://api.openai.com/v1/embeddings"
	payload := map[string]interface{}{
		"model": c.embedModel,
		"input": text,
	}
	var resp map[string]interface{}
	if err := c.doRequest(ctx, "POST", url, payload, &resp); err != nil {
		return nil, err
	}
	data, ok := resp["data"].([]interface{})
	if !ok || len(data) == 0 {
		return nil, fmt.Errorf("no embedding returned")
	}
	item, _ := data[0].(map[string]interface{})
	embIface, ok := item["embedding"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("embedding missing or wrong type")
	}
	emb := make([]float64, len(embIface))
	for i, v := range embIface {
		fv, ok := v.(float64)
		if !ok {
			return nil, fmt.Errorf("embedding value not float64")
		}
		emb[i] = fv
	}
	return emb, nil
}
