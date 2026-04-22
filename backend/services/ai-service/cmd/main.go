package main


import (
    "log"
    "net/http"

    "backend/services/ai-service/internal/config"
    "backend/services/ai-service/internal/routes"
)

func main() {
    cfg := config.LoadFromEnv()

    addr := ":" + cfg.Port
    mux := routes.RegisterRoutes(cfg)

    log.Printf("ai-service starting on %s", addr)
    if err := http.ListenAndServe(addr, mux); err != nil {
        log.Fatalf("server failed: %v", err)
    }
}
