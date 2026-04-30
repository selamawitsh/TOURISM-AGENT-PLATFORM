package middleware

import (
	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type ClientLimiter struct {
	limiter  *rate.Limiter
	lastSeen int64
}
func RateLimiterMiddleware(rps int, burst int) gin.HandlerFunc {
	var (
		mu sync.Mutex
		limiters = make(map[string]*ClientLimiter)
	)

	return func(c *gin.Context) {

		if c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		clientIP := c.GetHeader("X-Forwarded-For")
		if clientIP == "" {
			clientIP = c.ClientIP()
		}

		mu.Lock()

		limiter, exists := limiters[clientIP]
		if !exists {
			limiter = &ClientLimiter{
				limiter: rate.NewLimiter(rate.Limit(rps), burst),
			}
			limiters[clientIP] = limiter
		}

		mu.Unlock()

		if !limiter.limiter.Allow() {
			c.AbortWithStatusJSON(429, gin.H{
				"error": "Too many requests",
			})
			return
		}

		c.Next()
	}
}