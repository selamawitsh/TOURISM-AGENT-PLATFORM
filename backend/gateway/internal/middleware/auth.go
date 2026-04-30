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
		path := c.Request.URL.Path
		
		// Check if this route requires authentication
		requiresAuth := cfg.RequiresAuth(path)
		
		// Log for debugging
		log.Printf("[AUTH] Path: %s, RequiresAuth: %v", path, requiresAuth)
		
		if !requiresAuth {
			log.Printf("[AUTH] Path %s is PUBLIC", path)
			c.Next()
			return
		}

		log.Printf("[AUTH] Path %s requires authentication", path)

		// Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			log.Printf("[AUTH] No Authorization header for %s", path)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Missing authorization header",
				"code":  "MISSING_TOKEN",
			})
			c.Abort()
			return
		}

		// Check Bearer format
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			log.Printf("[AUTH] Invalid auth format for %s", path)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization format. Use: Bearer <token>",
				"code":  "INVALID_TOKEN_FORMAT",
			})
			c.Abort()
			return
		}

		tokenString := tokenParts[1]

		// Parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			log.Printf("[AUTH] Invalid token for %s: %v", path, err)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
				"code":  "INVALID_TOKEN",
			})
			c.Abort()
			return
		}

		// Extract claims and store in context
		claims, ok := token.Claims.(jwt.MapClaims)
		if ok && token.Valid {
			c.Set("user_id", claims["user_id"])
			c.Set("user_email", claims["email"])
			c.Set("user_role", claims["role"])
			log.Printf("[AUTH] Authenticated user: %v", claims["user_id"])
		}

		c.Next()
	}
}