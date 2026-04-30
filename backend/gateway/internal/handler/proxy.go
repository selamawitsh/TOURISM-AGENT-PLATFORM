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

// ================================
// MAIN PROXY HANDLER
// ================================
func (h *ProxyHandler) ProxyRequest(c *gin.Context) {
	path := c.Request.URL.Path
	method := c.Request.Method

	log.Printf("[GATEWAY] ===> %s %s", method, path)

	// ================================
	// HANDLE PREFLIGHT (OPTIONS)
	// ================================
	if method == http.MethodOptions {
		h.applyCORS(c)
		c.AbortWithStatus(204)
		return
	}

	// ================================
	// GET TARGET SERVICE
	// ================================
	targetURL := h.cfg.GetServiceURL(path)
	if targetURL == "" {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Service not found",
			"path":  path,
		})
		return
	}

	// ================================
	// CLEAN PATH
	// ================================
	trimmedPath := strings.TrimPrefix(path, "/api/v1")
	if trimmedPath == "" {
		trimmedPath = "/"
	}

	target := targetURL + "/api/v1" + trimmedPath

	// add query string
	if c.Request.URL.RawQuery != "" {
		target += "?" + c.Request.URL.RawQuery
	}

	log.Printf("[GATEWAY] 🎯 Target URL: %s", target)

	// ================================
	// READ BODY
	// ================================
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read request body",
		})
		return
	}
	c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

	// ================================
	// CREATE REQUEST
	// ================================
	req, err := http.NewRequest(method, target, bytes.NewBuffer(body))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create request",
		})
		return
	}

	// ================================
	// COPY HEADERS
	// ================================
	for key, values := range c.Request.Header {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	// ================================
	// FORWARD HEADERS
	// ================================
	clientIP := c.ClientIP()

	req.Header.Set("X-Forwarded-For", clientIP)
	req.Header.Set("X-Real-IP", clientIP)
	req.Header.Set("X-Forwarded-Host", c.Request.Host)
	req.Header.Set("X-Forwarded-Proto", "https")

	if userID, exists := c.Get("user_id"); exists {
		req.Header.Set("X-User-ID", userID.(string))
	}
	if role, exists := c.Get("user_role"); exists {
		req.Header.Set("X-User-Role", role.(string))
	}

	// ================================
	// HTTP CLIENT
	// ================================
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[GATEWAY] ❌ Service error: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{
			"error":   "Service unavailable",
			"details": err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	// ================================
	// READ RESPONSE
	// ================================
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read response",
		})
		return
	}

	log.Printf("[GATEWAY] <=== %d %s", resp.StatusCode, target)

	// ================================
	// COPY RESPONSE HEADERS
	// ================================
	for key, values := range resp.Header {
		for _, value := range values {
			c.Header(key, value)
		}
	}

	// ================================
	// FIX CORS ALWAYS (CRITICAL)
	// ================================
	h.applyCORS(c)

	// fallback content-type
	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/json"
	}

	// ================================
	// RETURN RESPONSE
	// ================================
	c.Data(resp.StatusCode, contentType, respBody)
}

// ================================
// CENTRAL CORS HANDLER
// ================================
func (h *ProxyHandler) applyCORS(c *gin.Context) {
	origin := c.GetHeader("Origin")

	if origin == "" {
		return
	}

	c.Header("Access-Control-Allow-Origin", origin)
	c.Header("Access-Control-Allow-Credentials", "true")
	c.Header("Access-Control-Allow-Headers",
		"Content-Type, Authorization, X-Requested-With, Accept, Origin")
	c.Header("Access-Control-Allow-Methods",
		"GET, POST, PUT, PATCH, DELETE, OPTIONS")
	c.Header("Vary", "Origin")
}

// ================================
// HEALTH CHECK
// ================================
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