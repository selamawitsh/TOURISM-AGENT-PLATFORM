package middleware

import (
	"log"
	"net/http"
	"strings"

	"tourism-platform/backend/gateway/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {

		// ==========================================
		// IMPORTANT:
		// This middleware is only used on protected
		// route groups in main.go
		//
		// So NO need to call RequiresAuth(path)
		// ==========================================

		path := c.Request.URL.Path

		log.Printf("[AUTH] Protected route hit: %s", path)

		// Skip OPTIONS preflight requests
		if c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		// ==========================================
		// Read Authorization Header
		// ==========================================

		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			log.Printf("[AUTH] Missing token: %s", path)

			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Missing authorization header",
				"code":  "MISSING_TOKEN",
			})
			return
		}

		// ==========================================
		// Validate Bearer Format
		// ==========================================

		parts := strings.SplitN(authHeader, " ", 2)

		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("[AUTH] Invalid header format: %s", path)

			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Use Authorization: Bearer <token>",
				"code":  "INVALID_TOKEN_FORMAT",
			})
			return
		}

		tokenString := strings.TrimSpace(parts[1])

		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Empty token",
				"code":  "EMPTY_TOKEN",
			})
			return
		}

		// ==========================================
		// Parse JWT
		// ==========================================

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {

			// Only allow HMAC signing
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}

			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			log.Printf("[AUTH] Invalid token: %s | %v", path, err)

			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
				"code":  "INVALID_TOKEN",
			})
			return
		}

		// ==========================================
		// Extract Claims
		// ==========================================

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token claims",
				"code":  "INVALID_CLAIMS",
			})
			return
		}

		// Store user data for services
		if userID, exists := claims["user_id"]; exists {
			c.Set("user_id", userID)
		}

		if email, exists := claims["email"]; exists {
			c.Set("user_email", email)
		}

		if role, exists := claims["role"]; exists {
			c.Set("user_role", role)
		}

		log.Printf("[AUTH] Authenticated user: %v", claims["user_id"])

		c.Next()
	}
}