package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type ClientLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

func RateLimiterMiddleware(rps int, burst int) gin.HandlerFunc {
	var (
		mu       sync.Mutex
		clients  = make(map[string]*ClientLimiter)
	)

	// cleanup old clients every 5 min
	go func() {
		for {
			time.Sleep(5 * time.Minute)

			mu.Lock()
			for ip, client := range clients {
				if time.Since(client.lastSeen) > 10*time.Minute {
					delete(clients, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return func(c *gin.Context) {

		// Skip OPTIONS preflight
		if c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		// More accurate IP behind proxy
		ip := c.GetHeader("X-Forwarded-For")

		if ip == "" {
			ip = c.ClientIP()
		}

		// If multiple forwarded IPs
		if strings.Contains(ip, ",") {
			ip = strings.Split(ip, ",")[0]
			ip = strings.TrimSpace(ip)
		}

		mu.Lock()

		client, exists := clients[ip]

		if !exists {
			client = &ClientLimiter{
				limiter: rate.NewLimiter(rate.Limit(rps), burst),
			}
			clients[ip] = client
		}

		client.lastSeen = time.Now()

		allowed := client.limiter.Allow()

		mu.Unlock()

		if !allowed {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Try again shortly.",
				"code":  "RATE_LIMIT_EXCEEDED",
			})
			return
		}

		c.Next()
	}
}