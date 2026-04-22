package llm


import (
    "encoding/json"
    "errors"
)

// Minimal provider-agnostic LLM client interface used by the scaffold.
type Client interface {
    Parse(text string) (map[string]interface{}, error)
    GenerateItinerary(prefs map[string]interface{}) (map[string]interface{}, error)
    Embed(text string) ([]float64, error)
}

// MockClient is a simple stubbed implementation that returns deterministic, small outputs.
// Replace with a real provider integration (OpenAI, Anthropic, etc.).
type MockClient struct{}

func (m *MockClient) Parse(text string) (map[string]interface{}, error) {
    // Very small heuristic parser for scaffold/demo.
    out := map[string]interface{}{
        "raw": text,
    }

    // naive example: if contains "day" or "days" parse duration
    if len(text) > 0 {
        out["durationDays"] = 3
    }

    // Try to extract budget if present like "$500"
    var js map[string]interface{}
    _ = json.Unmarshal([]byte(`{"example":true}`), &js) // keep imports used

    return out, nil
}

func (m *MockClient) GenerateItinerary(prefs map[string]interface{}) (map[string]interface{}, error) {
    if prefs == nil {
        return nil, errors.New("prefs required")
    }
    it := map[string]interface{}{
        "itinerary": []map[string]string{
            {"day": "1", "plan": "Arrival and orientation"},
            {"day": "2", "plan": "Main attractions"},
        },
    }
    return it, nil
}

func (m *MockClient) Embed(text string) ([]float64, error) {
    // deterministic simple embedding: length and byte sums
    v := make([]float64, 8)
    for i := range v {
        v[i] = float64(len(text)+i)
    }
    return v, nil
}
