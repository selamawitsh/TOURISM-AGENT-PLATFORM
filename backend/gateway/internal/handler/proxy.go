package handler

import (
	"bytes"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"tourism-platform/backend/gateway/internal/config"

	"github.com/gin-gonic/gin"
)

type ProxyHandler struct {
	cfg *config.Config
}

func NewProxyHandler(cfg *config.Config) *ProxyHandler {
	return &ProxyHandler{cfg: cfg}
}

// ProxyRequest forwards the request to the appropriate backend service
func (h *ProxyHandler) ProxyRequest(c *gin.Context) {
	path := c.Request.URL.Path
	method := c.Request.Method

	log.Printf("[GATEWAY] ===> %s %s", method, path)

	// Get target service URL
	targetURL := h.cfg.GetServiceURL(path)
	if targetURL == "" {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Service not found",
			"path":  path,
		})
		return
	}

	// Preserve the path suffix
	trimmedPath := strings.TrimPrefix(path, "/api/v1")
	if trimmedPath == "" {
		trimmedPath = "/"
	}

	// Build target URL
	target := targetURL + "/api/v1" + trimmedPath
	log.Printf("[GATEWAY] 🎯 Target URL: %s", target)

	// Add query parameters
	if c.Request.URL.RawQuery != "" {
		target += "?" + c.Request.URL.RawQuery
	}

	// Read body
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("[GATEWAY] ❌ Failed to read body: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read request body",
		})
		return
	}
	c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

	// Create proxy request
	req, err := http.NewRequest(method, target, bytes.NewBuffer(body))
	if err != nil {
		log.Printf("[GATEWAY] ❌ Failed to create request: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create proxy request",
		})
		return
	}

	// Copy headers
	for key, values := range c.Request.Header {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	// Add X-Forwarded headers
	req.Header.Set("X-Forwarded-For", c.ClientIP())
	req.Header.Set("X-Forwarded-Host", c.Request.Host)
	req.Header.Set("X-Forwarded-Proto", "http")
	req.Header.Set("X-Real-IP", c.ClientIP())

	// Add user info from context (set by auth middleware)
	if userID, exists := c.Get("user_id"); exists {
		req.Header.Set("X-User-ID", userID.(string))
	}
	if userRole, exists := c.Get("user_role"); exists {
		req.Header.Set("X-User-Role", userRole.(string))
	}

	// Execute request with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[GATEWAY] ❌ Service unavailable: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{
			"error":   "Service unavailable",
			"service": targetURL,
			"details": err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("[GATEWAY] ❌ Failed to read response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read response body",
		})
		return
	}

	log.Printf("[GATEWAY] <=== Response status: %d", resp.StatusCode)

	// Copy response headers
	for key, values := range resp.Header {
		for _, value := range values {
			c.Header(key, value)
		}
	}

	// Send response
	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), respBody)
}

// HealthCheck returns gateway health status
func (h *ProxyHandler) HealthCheck(c *gin.Context) {
	services := map[string]string{
		"auth":        h.cfg.AuthServiceURL,
		"user":        h.cfg.UserServiceURL,
		"destination": h.cfg.DestinationServiceURL,
		"booking":     h.cfg.BookingServiceURL,
		"favorites":   h.cfg.FavoritesServiceURL,
		"review":      h.cfg.ReviewServiceURL,
		"payment":     h.cfg.PaymentServiceURL,
		"analytics":   h.cfg.AnalyticsServiceURL,
		"ai":          h.cfg.AIServiceURL,
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"service":   "api-gateway",
		"version":   "1.0.0",
		"services":  services,
		"timestamp": time.Now().Unix(),
	})
}
