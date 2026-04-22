package integrations

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

// Stubs to integrate with destination and booking services.
// Replace HTTP client calls with real implementations.

type Destination struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Booking struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

func QueryDestinations(ctx context.Context, baseURL string, q map[string]interface{}) ([]Destination, error) {
	if baseURL == "" {
		return []Destination{{ID: "dest:demo", Name: "Demo Destination"}}, nil
	}
	client := &http.Client{Timeout: 10 * time.Second}
	endpoint := fmt.Sprintf("%s/v1/destinations", baseURL)
	req, err := http.NewRequestWithContext(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	// attach query params if present
	if q != nil {
		vals := url.Values{}
		for k, v := range q {
			vals.Add(k, fmt.Sprintf("%v", v))
		}
		req.URL.RawQuery = vals.Encode()
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("destination service returned %d", resp.StatusCode)
	}
	var out []Destination
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	return out, nil
}

func QueryBookings(ctx context.Context, baseURL, userID string) ([]Booking, error) {
	// TODO: call booking-service endpoints
	if baseURL == "" {
		return []Booking{{ID: "bk:demo", Status: "confirmed"}}, nil
	}
	client := &http.Client{Timeout: 10 * time.Second}
	endpoint := fmt.Sprintf("%s/v1/bookings?userId=%s", baseURL, url.QueryEscape(userID))
	req, err := http.NewRequestWithContext(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("booking service returned %d", resp.StatusCode)
	}
	var out []Booking
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	return out, nil
}
