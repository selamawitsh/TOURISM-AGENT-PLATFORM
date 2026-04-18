package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func LoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method
		clientIP := c.ClientIP()

		// Process request
		c.Next()

		// Log after request
		latency := time.Since(start)
		statusCode := c.Writer.Status()
		
		log.Printf("[GATEWAY] %s %s %d | %s | %s | %v",
			method,
			path,
			statusCode,
			clientIP,
			c.Request.UserAgent(),
			latency,
		)
	}
}